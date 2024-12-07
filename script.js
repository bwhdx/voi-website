document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel-container');
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    const dotsContainer = document.querySelector('.carousel-dots');
    const totalSlides = slides.length;

    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let animationID = 0;
    let currentTouch = null;
    let autoplayInterval;
    const autoplayDelay = 5000;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    // Touch events
    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: false });
    track.addEventListener('touchend', touchEnd);
    track.addEventListener('touchcancel', touchEnd);

    // Prevent default behavior on touch events
    track.addEventListener('dragstart', (e) => e.preventDefault());

    function touchStart(event) {
        stopAutoplay();
        currentTouch = event.touches[0];
        startX = currentTouch.clientX;
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';
    }

    function touchMove(event) {
        if (!isDragging) return;
        event.preventDefault();
        currentTouch = event.touches[0];
        const currentX = currentTouch.clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        const movedBy = currentTranslate - prevTranslate;

        // Determine if slide should change based on move distance
        if (Math.abs(movedBy) > carousel.offsetWidth * 0.2) {
            if (movedBy < 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
        } else {
            goToSlide(currentIndex);
        }
        startAutoplay();
    }

    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
        const minTranslate = -(totalSlides - 1) * carousel.offsetWidth;
        const maxTranslate = 0;
        currentTranslate = Math.max(Math.min(currentTranslate, maxTranslate), minTranslate);
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function goToSlide(index) {
        // Handle wrapping
        if (index >= totalSlides) {
            index = 0;
        } else if (index < 0) {
            index = totalSlides - 1;
        }

        currentIndex = index;
        const slideWidth = carousel.offsetWidth;
        prevTranslate = -index * slideWidth;
        currentTranslate = prevTranslate;

        track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(${currentTranslate}px)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Autoplay functions
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, autoplayDelay);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Button click handlers
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            stopAutoplay();
            startAutoplay();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            stopAutoplay();
            startAutoplay();
        });
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            stopAutoplay();
            startAutoplay();
        });
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            goToSlide(currentIndex);
        }, 250);
    });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Initialize carousel
    goToSlide(0);
    startAutoplay();

    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            mobileMenu.setAttribute('aria-hidden', isExpanded);
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu && mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });
    });

    // Add lazy loading for images
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    // Feature items scroll effect
    function initFeatureScroll() {
        if (window.innerWidth > 768) return;

        const featureItems = document.querySelectorAll('.feature-item');
        let ticking = false;
        let rafId = null;
        
        function updateFeatures() {
            const viewportCenter = window.innerHeight / 2;
            
            featureItems.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + (rect.height / 2);
                
                // Calculate position relative to viewport center (-1 to 1)
                const relativePosition = (itemCenter - viewportCenter) / (window.innerHeight / 2);
                
                // Calculate scale (1 to 1.08) - linear scale for smooth size transition
                const scale = 1 + Math.max(0, 0.08 * (1 - Math.abs(relativePosition)));
                
                // Calculate color intensity (0 to 1) - using power curve for more dramatic color falloff
                const colorIntensity = Math.max(0, 1 - Math.abs(relativePosition));
                // Apply a power curve to make the color transition more dramatic
                const colorPower = Math.pow(colorIntensity, 3);
                
                // Apply transformations
                item.style.transform = `scale(${scale})`;
                
                // Update colors based on intensity
                if (colorPower > 0) {
                    // Interpolate between white (255,255,255) and Voi purple (124,58,237)
                    const r = Math.round(255 - (colorPower * (255 - 124)));
                    const g = Math.round(255 - (colorPower * (255 - 58)));
                    const b = Math.round(255 - (colorPower * (255 - 237)));
                    
                    item.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                    
                    // Text color transitions - only update if needed
                    if (colorPower > 0.5) {
                        item.querySelector('.feature-title').style.color = 'white';
                        item.querySelector('.feature-description').style.color = 'rgba(255, 255, 255, 0.9)';
                        item.querySelector('.feature-number').style.color = 'rgba(255, 255, 255, 0.8)';
                        item.querySelector('.feature-icon svg').style.stroke = 'white';
                    } else {
                        item.querySelector('.feature-title').style.color = '';
                        item.querySelector('.feature-description').style.color = '';
                        item.querySelector('.feature-number').style.color = '';
                        item.querySelector('.feature-icon svg').style.stroke = '';
                    }
                } else {
                    item.style.backgroundColor = 'white';
                    item.querySelector('.feature-title').style.color = '';
                    item.querySelector('.feature-description').style.color = '';
                    item.querySelector('.feature-number').style.color = '';
                    item.querySelector('.feature-icon svg').style.stroke = '';
                }
            });
            
            ticking = false;
        }

        // Throttled scroll handler
        function onScroll() {
            if (!ticking) {
                ticking = true;
                rafId = requestAnimationFrame(updateFeatures);
            }
        }

        // Add scroll event listener with throttling
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Initial check
        updateFeatures();

        // Cleanup function
        return function cleanup() {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener('scroll', onScroll);
            featureItems.forEach(item => {
                item.style.transform = '';
                item.style.backgroundColor = '';
                const elements = [
                    item.querySelector('.feature-title'),
                    item.querySelector('.feature-description'),
                    item.querySelector('.feature-number'),
                    item.querySelector('.feature-icon svg')
                ];
                elements.forEach(el => {
                    if (el) {
                        el.style.color = '';
                        if (el.tagName === 'svg') el.style.stroke = '';
                    }
                });
            });
        };
    }

    // Initialize on mobile
    let cleanup = null;
    
    function init() {
        if (window.innerWidth <= 768) {
            if (!cleanup) {
                cleanup = initFeatureScroll();
            }
        } else if (cleanup) {
            cleanup();
            cleanup = null;
        }
    }

    // Initialize and handle resize
    init();
    window.addEventListener('resize', init);
});