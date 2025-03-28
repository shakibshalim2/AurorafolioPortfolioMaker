require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(() => { console.log('Connected to MongoDB'); })
.catch(err => { console.error('MongoDB connection error:', err); });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  email: String,
  phone: String,
  bio: String,
  softSkills: [String],
  technicalSkills: [String],
  academicBackground: [{
    institute: String,
    degree: String,
    year: Number,
    grade: String
  }],
  company: String,
  duration: String,
  responsibilities: String,
  projects: String,
  photo: Buffer,
  photoContentType: String
});
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/create-account', (req, res) => {
  if (req.session.userId) return res.redirect('/portfolio');
  res.sendFile(path.join(__dirname, 'public', 'create-account.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send('Email already in use. <a href="/login">Login</a>.');
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Error registering user.');
  }
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/portfolio');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send('No user found with that email. <a href="/create-account">Create an account</a>.');
    if (user.password !== password) return res.send('Incorrect password. <a href="/login">Try again</a>.');
    req.session.userId = user._id;
    res.redirect('/portfolio');
  } catch (err) {
    console.error(err);
    res.send('Error logging in.');
  }
});

app.get('/portfolio', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

app.get('/currentUser', (req, res) => {
  if (req.session.userId) res.json({ loggedIn: true });
  else res.json({ loggedIn: false });
});

app.post('/preview', upload.single('photo'), async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const { fullName, email, phone, bio, softSkills, technicalSkills, company, duration, responsibilities, projects } = req.body;
    const softSkillsArray = softSkills ? softSkills.split(',').map(s => s.trim()) : [];
    const technicalSkillsArray = technicalSkills ? technicalSkills.split(',').map(s => s.trim()) : [];
    const academicBackground = JSON.parse(req.body.academicBackground || '[]');

    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfData);
    });
    doc.fontSize(20).text('Portfolio Preview', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Full Name: ${fullName || ''}`);
    doc.text(`Email: ${email || ''}`);
    if(phone.length>0){
      doc.text(`Phone: ${phone || ''}`);
    }
    doc.text(`Bio: ${bio || ''}`);
    doc.moveDown();
    if (req.file) {
      try {
        doc.text('Photo:', { underline: true });
        doc.moveDown(0.5);
        doc.image(req.file.buffer, { fit: [300, 300], align: 'left' });
        doc.moveDown(13);
      } catch (error) {
        console.error('Error embedding image in preview:', error);
      }
    }
    doc.fontSize(14).text('Skills:', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Soft Skills: ${softSkillsArray.join(', ')}`);
    doc.text(`Technical Skills: ${technicalSkillsArray.join(', ')}`);
    doc.moveDown();
   // Academic Background
   if (academicBackground.length > 0) {
    doc.fontSize(16).fillColor('#007AFF').text('Academic Background', { underline: true }).moveDown(0.5);
    academicBackground.forEach(entry => {
      doc.fontSize(12).fillColor('#333')
        .text(`Institute: ${entry.institute || ''}`)
        .text(`Degree: ${entry.degree || ''}`)
        .text(`Year: ${entry.year || ''}`)
        .text(`Grade: ${entry.grade || ''}`)
        .moveDown();
    });
  }

    doc.text('Work Experience:', { underline: true });
    doc.text(`Company: ${company || ''}`);
    doc.text(`Duration: ${duration || ''}`);
    doc.text(`Responsibilities: ${responsibilities || ''}`);
    doc.moveDown();
    if (projects) {
      doc.text('Projects/Publications:', { underline: true });
      doc.text(projects);
      doc.moveDown();
    }
    doc.end();
  } catch (err) {
    console.error(err);
    res.send('Error generating preview PDF.');
  }
});

app.post('/portfolio', upload.single('photo'), async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const { fullName, email, phone, bio, softSkills, technicalSkills, company, duration, responsibilities, projects } = req.body;
    
    // Parse the skills into arrays first
    const softSkillsArray = softSkills ? softSkills.split(',').map(s => s.trim()) : [];
    const technicalSkillsArray = technicalSkills ? technicalSkills.split(',').map(s => s.trim()) : [];
    
    const academicBackground = JSON.parse(req.body.academicBackground || '[]').map(entry => ({
      institute: entry.institute,
      degree: entry.degree,
      year: entry.year ? parseInt(entry.year, 10) : null,
      grade: entry.grade
    }));

    const newPortfolio = new Portfolio({
      userId: req.session.userId,
      fullName,
      email,
      phone,
      bio,
      softSkills: softSkillsArray,
      technicalSkills: technicalSkillsArray,
      academicBackground,
      company,
      duration,
      responsibilities,
      projects
    });
    
    if (req.file) {
      newPortfolio.photo = req.file.buffer;
      newPortfolio.photoContentType = req.file.mimetype;
    }
    
    await newPortfolio.save();

    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="portfolio.pdf"');
      res.setHeader('Content-Length', pdfData.length);
      res.end(pdfData);
    });

    doc.fontSize(10).fillColor('#888').text('Aurorafolio - Generated PDF', { align: 'right' });
    doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(doc.x, doc.y + 10).lineTo(550, doc.y + 10).stroke();
    doc.moveDown(2);
    doc.fontSize(24).fillColor('#333').text('PORTFOLIO', { align: 'center' }).moveDown(1);
    doc.fontSize(14).fillColor('#555');
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#007AFF').text('Personal Information', { underline: true });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#333').text(`Full Name: ${fullName}`, { continued: true }).text('    ', { continued: true }).text(`email: ${email}`,{ continued: true }).text('    ', { continued: true }).text(`phone: ${phone}`);
    doc.moveDown(0.5);
    doc.text(`Bio: ${bio}`);
    doc.moveDown(1);
    if (req.file) {
      try {
        doc.fontSize(12).fillColor('#333').text('Photo:', { underline: true });
        doc.moveDown(0.5);
        doc.image(req.file.buffer, { fit: [200, 200], align: 'left' });
        doc.moveDown(10);
      } catch (error) {
        console.error('Error embedding image:', error);
      }
    }
    doc.fontSize(16).fillColor('#007AFF').text('Skills', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(`Soft Skills: ${softSkillsArray.join(', ')}`);
    doc.moveDown(0.5);
    doc.text(`Technical Skills: ${technicalSkillsArray.join(', ')}`);
    doc.moveDown(1);

    if (academicBackground.length > 0) {
      doc.fontSize(16).fillColor('#007AFF').text('Academic Background', { underline: true });
      doc.moveDown(0.5);
      academicBackground.forEach(entry => {
        doc.fontSize(12).fillColor('#333')
          .text(`Institute: ${entry.institute || ''}`)
          .text(`Degree: ${entry.degree || ''}`)
          .text(`Year: ${entry.year || ''}`)
          .text(`Grade: ${entry.grade || ''}`)
          .moveDown();
      });
    }

    doc.fontSize(16).fillColor('#007AFF').text('Work Experience', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(`Company: ${company}`).text(`Duration: ${duration}`).text(`Responsibilities: ${responsibilities}`);
    doc.moveDown(1);
    if (projects) {
      doc.fontSize(16).fillColor('#007AFF').text('Projects/Publications', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333').text(projects);
      doc.moveDown(1);
    }
    doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(doc.x, doc.y + 10).lineTo(550, doc.y + 10).stroke();
    doc.fontSize(10).fillColor('#888').text('Generated by Aurorafolio App', 50, 750, { align: 'center' });
    doc.end();
  } catch (err) {
    console.error(err);
    res.send('Error saving portfolio or generating PDF.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
