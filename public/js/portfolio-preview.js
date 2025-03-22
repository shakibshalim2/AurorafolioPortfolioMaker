const softSkillInput = document.getElementById('softSkillInput');
const addSoftSkillBtn = document.getElementById('addSoftSkillBtn');
const softSkillsList = document.getElementById('softSkillsList');
const softSkillsHidden = document.getElementById('softSkills');
let softSkillsArray = [];

addSoftSkillBtn.addEventListener('click', () => {
  const skill = softSkillInput.value.trim();
  if (skill) {
    softSkillsArray.push(skill);
    renderSoftSkills();
    softSkillInput.value = '';
  }
});

function renderSoftSkills() {
  softSkillsList.innerHTML = '';
  softSkillsArray.forEach((skill, index) => {
    const li = document.createElement('li');
    li.textContent = skill;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      softSkillsArray.splice(index, 1);
      renderSoftSkills();
    });
    li.appendChild(removeBtn);
    softSkillsList.appendChild(li);
  });
  softSkillsHidden.value = softSkillsArray.join(',');
}

const techSkillInput = document.getElementById('techSkillInput');
const addTechSkillBtn = document.getElementById('addTechSkillBtn');
const techSkillsList = document.getElementById('techSkillsList');
const technicalSkillsHidden = document.getElementById('technicalSkills');
let techSkillsArray = [];

addTechSkillBtn.addEventListener('click', () => {
  const skill = techSkillInput.value.trim();
  if (skill) {
    techSkillsArray.push(skill);
    renderTechSkills();
    techSkillInput.value = '';
  }
});

function renderTechSkills() {
  techSkillsList.innerHTML = '';
  techSkillsArray.forEach((skill, index) => {
    const li = document.createElement('li');
    li.textContent = skill;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      techSkillsArray.splice(index, 1);
      renderTechSkills();
    });
    li.appendChild(removeBtn);
    techSkillsList.appendChild(li);
  });
  technicalSkillsHidden.value = techSkillsArray.join(',');
}

// Academic Background Handling
const academicEntriesContainer = document.querySelector('.academic-entries');
const addAcademicBtn = document.getElementById('addAcademicBtn');
const academicBackgroundInput = document.getElementById('academicBackground');

function createAcademicEntry() {
  const entryDiv = document.createElement('div');
  entryDiv.className = 'academic-entry';
  
  entryDiv.innerHTML = `
    <div class="two-column">
      <div>
        <label>Institute</label>
        <input type="text" class="academic-institute" required>
      </div>
      <div>
        <label>Degree</label>
        <input type="text" class="academic-degree" required>
      </div>
    </div>
    <div class="two-column">
      <div>
        <label>Year</label>
        <input type="number" class="academic-year">
      </div>
      <div>
        <label>Grade</label>
        <input type="text" class="academic-grade">
      </div>
    </div>
    <button type="button" class="remove-academic-btn">−</button>
  `;

  const removeBtn = entryDiv.querySelector('.remove-academic-btn');
  removeBtn.addEventListener('click', () => {
    // Only remove if there's more than one entry
    if (document.querySelectorAll('.academic-entry').length > 1) {
      entryDiv.remove();
      updateAcademicBackground();
    } else {
      alert("You need at least one academic entry. Clear the fields instead of removing.");
    }
  });

  entryDiv.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateAcademicBackground);
  });

  return entryDiv;
}

function updateAcademicBackground() {
  const entries = [];
  document.querySelectorAll('.academic-entry').forEach(entry => {
    entries.push({
      institute: entry.querySelector('.academic-institute').value.trim(),
      degree: entry.querySelector('.academic-degree').value.trim(),
      year: entry.querySelector('.academic-year').value.trim(),
      grade: entry.querySelector('.academic-grade').value.trim()
    });
  });
  academicBackgroundInput.value = JSON.stringify(entries);
}

addAcademicBtn.addEventListener('click', () => {
  academicEntriesContainer.appendChild(createAcademicEntry());
  updateAcademicBackground();
});

// Initialize with only one academic entry if none exist
if (document.querySelectorAll('.academic-entry').length === 0) {
  academicEntriesContainer.appendChild(createAcademicEntry());
  updateAcademicBackground();
}

const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closeBtn = document.querySelector('.close');
const pdfFrame = document.getElementById('pdfFrame');
const portfolioForm = document.getElementById('portfolioForm');

previewBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  
  // Ensure all data is updated before submitting
  updateAcademicBackground();
  softSkillsHidden.value = softSkillsArray.join(',');
  technicalSkillsHidden.value = techSkillsArray.join(',');
  
  const formData = new FormData(portfolioForm);
  
  try {
    const response = await fetch('/preview', { 
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      pdfFrame.src = url;
      previewModal.style.display = 'block';
    } else {
      console.error('Preview failed:', response.status, response.statusText);
      alert('Failed to generate preview. Please try again.');
    }
  } catch (error) {
    console.error('Preview error:', error);
    alert('Error generating preview. Please check your connection and try again.');
  }
});

closeBtn.addEventListener('click', () => {
  previewModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.style.display = 'none';
  }
});
