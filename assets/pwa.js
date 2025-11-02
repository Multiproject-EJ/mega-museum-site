(function(){
  const mobileClock = document.getElementById('mobileClock');
  const statusIndicator = document.querySelector('[data-mobile-status]');
  const slides = document.querySelectorAll('[data-mobile-slide]');

  if (mobileClock) {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      mobileClock.textContent = `${hours}:${minutes}`;
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  if (statusIndicator) {
    const pulse = () => {
      statusIndicator.classList.toggle('is-online');
    };
    setInterval(pulse, 2000);
  }

  if (slides.length) {
    let index = 0;
    const activateSlide = () => {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      index = (index + 1) % slides.length;
    };
    activateSlide();
    setInterval(activateSlide, 5000);
  }

  if ('serviceWorker' in navigator) {
    const registerServiceWorker = () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      let swHref;

      if (manifestLink && manifestLink.href) {
        swHref = manifestLink.href.replace(/manifest\.webmanifest(?:\?.*)?$/, 'service-worker.js');
      }

      if (!swHref) {
        swHref = new URL('service-worker.js', window.location.origin).href;
      }

      navigator.serviceWorker.register(swHref).catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    };

    window.addEventListener('load', registerServiceWorker);
  }
})();
