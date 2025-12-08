console.log("TelegramCalm loaded");

(function init() {
  console.log("TelegramCalm init running");

  const main = document.querySelector('body');
  if (main) {
    main.style.outline = '189px dashed rgba(0,150,136,0.4)';
    setTimeout(() => {
      main.style.outline = '';
    }, 1000);
  }
})();