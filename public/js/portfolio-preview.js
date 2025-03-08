document.addEventListener('DOMContentLoaded', () => {
  const previewBtn = document.getElementById('previewBtn');
  const portfolioForm = document.getElementById('portfolioForm');
  const previewModal = document.getElementById('previewModal');
  const closeModal = document.querySelector('.close');
  const pdfFrame = document.getElementById('pdfFrame');

  function openModal() {
    previewModal.style.display = 'block';
  }

  function closePreviewModal() {
    previewModal.style.display = 'none';
  }

  closeModal.addEventListener('click', closePreviewModal);

  window.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      closePreviewModal();
    }
  });
  previewBtn.addEventListener('click', async () => {
    try {
      const formData = new FormData(portfolioForm);
      const response = await fetch('/preview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Preview request failed');
      }
      const pdfBlob = await response.blob();
      const blobUrl = URL.createObjectURL(pdfBlob);
      pdfFrame.src = blobUrl;
      openModal();

    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Could not generate PDF preview. Please try again.');
    }
  });
});
