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

const instituteInput = document.getElementById('instituteInput');
const addInstituteBtn = document.getElementById('addInstituteBtn');
const instituteList = document.getElementById('instituteList');
const institutesHidden = document.getElementById('institutes');
let institutesArray = [];
addInstituteBtn.addEventListener('click', () => {
  const inst = instituteInput.value.trim();
  if (inst) {
    institutesArray.push(inst);
    renderInstitutes();
    instituteInput.value = '';
  }
});
function renderInstitutes() {
  instituteList.innerHTML = '';
  institutesArray.forEach((inst, index) => {
    const li = document.createElement('li');
    li.textContent = inst;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      institutesArray.splice(index, 1);
      renderInstitutes();
    });
    li.appendChild(removeBtn);
    instituteList.appendChild(li);
  });
  institutesHidden.value = institutesArray.join(',');
}

const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closeBtn = document.querySelector('.close');
const pdfFrame = document.getElementById('pdfFrame');
const portfolioForm = document.getElementById('portfolioForm');
previewBtn.addEventListener('click', async () => {
  const formData = new FormData(portfolioForm);
  try {
    const response = await fetch('/preview', { method: 'POST', body: formData });
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      pdfFrame.src = url;
      previewModal.style.display = 'block';
    }
  } catch (error) {}
});
closeBtn.addEventListener('click', () => {
  previewModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.style.display = 'none';
  }
});
