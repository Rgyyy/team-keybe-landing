 document.addEventListener('DOMContentLoaded', () => {
      const cardImages = document.querySelectorAll('.card-image');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      let currentIndex = 0;

      function rotateCarousel(direction) {
        currentIndex = direction === 'next'
          ? (currentIndex + 1) % cardImages.length
          : (currentIndex - 1 + cardImages.length) % cardImages.length;

        cardImages.forEach((card, index) => {
          const angle = (index - currentIndex) * 72; // 균등 간격
          card.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(300px) scale(${index === currentIndex ? 1 : 0.8})`;
        });
      }

      nextBtn.addEventListener('click', () => rotateCarousel('next'));
      prevBtn.addEventListener('click', () => rotateCarousel('prev'));

      // 초기 배치
      cardImages.forEach((card, index) => {
        const angle = (index - currentIndex) * 72;
        card.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(300px) scale(${index === currentIndex ? 1 : 0.8})`;
      });
    });