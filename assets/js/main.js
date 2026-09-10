// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Contact form: AJAX submission via Web3Forms
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const statusEl = document.getElementById('form-status');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';

        const showStatus = (message, type) => {
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.className = 'form-status form-status--' + type;
            statusEl.hidden = false;
        };

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const accessKeyField = contactForm.querySelector('input[name="access_key"]');
            const accessKey = accessKeyField ? accessKeyField.value.trim() : '';
            if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
                showStatus(
                    'This form is not fully configured yet. Please email contact@nattranslation.com or call (207) 385-7813.',
                    'error'
                );
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }
            showStatus('Sending your message…', 'info');

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' }
                });
                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    showStatus(
                        'Thanks! Your message has been sent. We typically reply within 24 hours on business days.',
                        'success'
                    );
                    contactForm.reset();
                } else {
                    const msg = data.message || 'Something went wrong. Please try again or email contact@nattranslation.com.';
                    showStatus(msg, 'error');
                }
            } catch (err) {
                showStatus(
                    'Network error. Please check your connection and try again, or email contact@nattranslation.com.',
                    'error'
                );
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }

    // Trusted partners carousel (home page)
    const partnersCarousel = document.querySelector('[data-partners-carousel]');
    if (partnersCarousel) {
        const track = partnersCarousel.querySelector('.partners-carousel-track');
        const cards = track ? [...track.querySelectorAll('.partner-card')] : [];
        const prevBtn = partnersCarousel.querySelector('.partners-carousel-arrow--prev');
        const nextBtn = partnersCarousel.querySelector('.partners-carousel-arrow--next');
        const dotsHost = partnersCarousel.querySelector('.partners-carousel-dots');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let index = 0;
        let perView = 3;
        let maxIndex = 0;
        let autoTimer = null;
        const AUTO_MS = 5500;

        const getPerView = () => {
            if (window.innerWidth < 640) return 1;
            if (window.innerWidth < 1024) return 2;
            return 3;
        };

        const buildDots = () => {
            if (!dotsHost) return;
            dotsHost.innerHTML = '';
            for (let i = 0; i <= maxIndex; i += 1) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'partners-carousel-dot' + (i === index ? ' is-active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', 'Show partner group ' + (i + 1));
                dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
                dot.addEventListener('click', () => {
                    index = i;
                    render();
                    restartAuto();
                });
                dotsHost.appendChild(dot);
            }
        };

        const render = () => {
            if (!track || cards.length === 0) return;

            perView = getPerView();
            partnersCarousel.style.setProperty('--partners-per-view', String(perView));
            maxIndex = Math.max(0, cards.length - perView);

            if (index > maxIndex) index = 0;

            const staticMode = cards.length <= perView;
            partnersCarousel.classList.toggle('is-static', staticMode);

            if (prevBtn) prevBtn.hidden = staticMode;
            if (nextBtn) nextBtn.hidden = staticMode;
            if (dotsHost) dotsHost.hidden = staticMode;

            if (staticMode) {
                track.style.transform = '';
                if (dotsHost) dotsHost.innerHTML = '';
                stopAuto();
                return;
            }

            const card = cards[0];
            const gap = parseFloat(getComputedStyle(track).gap) || 24;
            const step = card.offsetWidth + gap;
            track.style.transform = 'translateX(-' + (index * step) + 'px)';

            buildDots();
        };

        const next = () => {
            index = index >= maxIndex ? 0 : index + 1;
            render();
        };

        const prev = () => {
            index = index <= 0 ? maxIndex : index - 1;
            render();
        };

        const stopAuto = () => {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        };

        const startAuto = () => {
            if (reduceMotion || cards.length <= getPerView()) return;
            stopAuto();
            autoTimer = setInterval(next, AUTO_MS);
        };

        const restartAuto = () => {
            stopAuto();
            startAuto();
        };

        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAuto(); });

        partnersCarousel.addEventListener('mouseenter', stopAuto);
        partnersCarousel.addEventListener('mouseleave', startAuto);
        partnersCarousel.addEventListener('focusin', stopAuto);
        partnersCarousel.addEventListener('focusout', (e) => {
            if (!partnersCarousel.contains(e.relatedTarget)) startAuto();
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(render, 120);
        });

        render();
        startAuto();
    }
});
