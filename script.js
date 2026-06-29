/* =====================================================
   Scroll-to-top button
   ===================================================== */
   const mybutton = document.getElementById("myBtn");

   window.onscroll = function () {
       if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
           mybutton.style.display = "flex";
       } else {
           mybutton.style.display = "none";
       }
   };
   
   function topFunction() {
       document.body.scrollTop = 0;
       document.documentElement.scrollTop = 0;
   }
   
   
   /* =====================================================
      Breakpoint helpers
      ===================================================== */
   const BP_TABLET  = 600;
   const BP_DESKTOP = 1200;
   
   function getMode() {
       const w = window.innerWidth;
       if (w >= BP_DESKTOP) return 'desktop';
       if (w >= BP_TABLET)  return 'tablet';
       return 'mobile';
   }
   
   
   /* =====================================================
      Carousel factory
      ===================================================== */
   function initCarousel(trackId, dotsContainerId) {
       const track         = document.getElementById(trackId);
       const dotsContainer = document.getElementById(dotsContainerId);
       if (!track || !dotsContainer) return;
   
       const wrapper = track.parentElement;
       const section = wrapper.closest('.carousel-container');
       const btnPrev = section.querySelector('.carousel-btn--prev');
       const btnNext = section.querySelector('.carousel-btn--next');
       const cards   = Array.from(track.children);
       const total   = cards.length;
       let current   = 0;
   
       /* --- Build dot indicators once --- */
       cards.forEach((_, i) => {
           const dot = document.createElement('button');
           dot.classList.add('carousel-dot');
           dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
           dot.addEventListener('click', () => goTo(i));
           dotsContainer.appendChild(dot);
       });
       const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
   
       /* ---- Mode: mobile — vertical stack, no JS needed ---- */
       function applyMobile() {
           // Reset any leftover transforms / classes from other modes
           track.style.transform = '';
           track.style.flexDirection = '';
           cards.forEach(c => {
               c.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
               c.style.transform = '';
               c.style.opacity   = '';
               c.style.zIndex    = '';
               c.style.position  = '';
               c.style.width     = '';
               c.style.minWidth  = '';
           });
       }
   
       /* ---- Mode: tablet — horizontal slide ---- */
       function applyTablet() {
           cards.forEach(c => {
               c.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
               c.style.transform = '';
               c.style.opacity   = '';
               c.style.zIndex    = '';
               c.style.position  = '';
               c.style.width     = '';
               c.style.minWidth  = '100%';
           });
           track.style.transform = `translateX(-${current * 100}%)`;
   
           dots.forEach((d, i) => d.classList.toggle('active', i === current));
           if (btnPrev) btnPrev.disabled = current === 0;
           if (btnNext) btnNext.disabled = current === total - 1;
       }
   
       /* ---- Mode: desktop — 3D fan ---- */
       function applyDesktop() {
           track.style.transform = '';
           cards.forEach((card, i) => {
               card.style.minWidth = '';
               card.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
               const diff = i - current;
               if      (diff === 0)  card.classList.add('is-active');
               else if (diff === -1) card.classList.add('is-prev');
               else if (diff === 1)  card.classList.add('is-next');
               else                  card.classList.add('is-far');
           });
   
           // Match track height to active card so no dead space above/below
           const activeCard = cards[current];
           if (activeCard) {
               requestAnimationFrame(() => {
                   track.style.minHeight = activeCard.offsetHeight + 'px';
               });
           }
   
           dots.forEach((d, i) => d.classList.toggle('active', i === current));
           if (btnPrev) btnPrev.disabled = current === 0;
           if (btnNext) btnNext.disabled = current === total - 1;
       }
   
       /* ---- Central update ---- */
       function update() {
           const mode = getMode();
           if      (mode === 'mobile')  applyMobile();
           else if (mode === 'tablet')  applyTablet();
           else                         applyDesktop();
       }
   
       function goTo(index) {
           current = Math.max(0, Math.min(index, total - 1));
           update();
       }
   
       /* --- Arrow buttons --- */
       if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
       if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));
   
       /* --- Click side cards on desktop to navigate --- */
       cards.forEach(card => {
           card.addEventListener('click', () => {
               if (getMode() !== 'desktop') return;
               if (card.classList.contains('is-prev')) goTo(current - 1);
               if (card.classList.contains('is-next')) goTo(current + 1);
           });
       });
   
       /* --- Touch swipe (tablet only) --- */
       let touchStartX = 0;
       wrapper.addEventListener('touchstart', e => {
           touchStartX = e.changedTouches[0].screenX;
       }, { passive: true });
   
       wrapper.addEventListener('touchend', e => {
           if (getMode() === 'mobile') return;
           const delta = touchStartX - e.changedTouches[0].screenX;
           if (Math.abs(delta) > 50) goTo(delta > 0 ? current + 1 : current - 1);
       }, { passive: true });
   
       /* --- Keyboard (tablet + desktop) --- */
       wrapper.setAttribute('tabindex', '0');
       wrapper.addEventListener('keydown', e => {
           if (getMode() === 'mobile') return;
           if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
           if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
       });
   
       /* --- Resize: re-apply correct mode --- */
       let resizeTimer;
       window.addEventListener('resize', () => {
           clearTimeout(resizeTimer);
           resizeTimer = setTimeout(update, 100);
       });
   
       update();
   }

window.addEventListener('load', () => {
    initCarousel('experience-track', 'experience-dots');
    initCarousel('projects-track',   'projects-dots');
});