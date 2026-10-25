// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        const setMenu = (open) => {
            navLinks.classList.toggle('active', open);
            mobileMenuToggle.setAttribute('aria-expanded', String(open));
            mobileMenuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        };
        mobileMenuToggle.addEventListener('click', () => {
            setMenu(mobileMenuToggle.getAttribute('aria-expanded') !== 'true');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                mobileMenuToggle.focus();
            }
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.site-header')) setMenu(false);
        });
    }

    // Keep the owner's opening film, with a visible playback control.
    const heroVideo = document.querySelector('.hero-video');
    const videoToggle = document.querySelector('.video-toggle');
    if (heroVideo && videoToggle) {
        const syncPlaybackLabel = () => {
            const paused = heroVideo.paused;
            videoToggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
            videoToggle.innerHTML = paused ? 'Play video <span aria-hidden="true">▷</span>' : 'Pause video <span aria-hidden="true">Ⅱ</span>';
        };
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionPreference.matches) heroVideo.pause();
        motionPreference.addEventListener('change', (event) => {
            if (event.matches) heroVideo.pause();
        });
        heroVideo.addEventListener('play', syncPlaybackLabel);
        heroVideo.addEventListener('pause', syncPlaybackLabel);
        videoToggle.addEventListener('click', () => {
            if (heroVideo.paused) heroVideo.play().catch(syncPlaybackLabel);
            else heroVideo.pause();
        });
        syncPlaybackLabel();
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

    // Native horizontal scrolling, enhanced with a seamless continuous loop.
    const partnersViewport = document.querySelector('.partners-viewport');
    const partnersToggle = document.querySelector('.partners-toggle');
    if (partnersViewport && partnersToggle) {
        const track = partnersViewport.querySelector('.partners-track');
        const group = track.querySelector('.partner-list');
        if (group && group.children.length > 1) {
            const copy = group.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            copy.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
            track.appendChild(copy);
            const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
            let playing = !motionPreference.matches;
            let hovered = false;
            let focused = false;
            let touching = false;
            let previousTime = null;
            let frame = null;
            const canAnimate = () => playing && !hovered && !focused && !touching && !document.hidden;
            const tick = (time) => {
                if (!canAnimate()) { frame = null; previousTime = null; return; }
                if (previousTime !== null) {
                    const distance = group.getBoundingClientRect().width;
                    if (distance > 0) {
                        partnersViewport.scrollLeft = (partnersViewport.scrollLeft + Math.min(time - previousTime, 64) * 0.035) % distance;
                    }
                }
                previousTime = time;
                frame = requestAnimationFrame(tick);
            };
            const updatePlayback = () => {
                partnersToggle.textContent = playing ? 'Pause slideshow' : 'Play slideshow';
                partnersToggle.setAttribute('aria-label', playing ? 'Pause partner slideshow' : 'Play partner slideshow');
                if (canAnimate() && frame === null) frame = requestAnimationFrame(tick);
                else if (!canAnimate() && frame !== null) {
                    cancelAnimationFrame(frame); frame = null; previousTime = null;
                }
            };
            partnersToggle.hidden = false;
            partnersToggle.addEventListener('click', () => { playing = !playing; updatePlayback(); });
            partnersViewport.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true; updatePlayback(); });
            partnersViewport.addEventListener('pointerleave', () => { hovered = false; updatePlayback(); });
            partnersViewport.addEventListener('focusin', () => { focused = true; updatePlayback(); });
            partnersViewport.addEventListener('focusout', event => { focused = partnersViewport.contains(event.relatedTarget); updatePlayback(); });
            partnersViewport.addEventListener('pointerdown', () => { touching = true; updatePlayback(); });
            window.addEventListener('pointerup', () => { touching = false; updatePlayback(); });
            window.addEventListener('pointercancel', () => { touching = false; updatePlayback(); });
            document.addEventListener('visibilitychange', updatePlayback);
            motionPreference.addEventListener('change', event => { playing = !event.matches; updatePlayback(); });
            updatePlayback();
        }
    }

});
