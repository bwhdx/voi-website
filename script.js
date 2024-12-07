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
        hamburger.addEventListener('click', function () {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            mobileMenu.setAttribute('aria-hidden', isExpanded);
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
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
        let rafId = null;
        let ticking = false;
        
        // Cache DOM queries and create element references
        const itemData = Array.from(featureItems).map(item => ({
            element: item,
            title: item.querySelector('.feature-title'),
            description: item.querySelector('.feature-description'),
            number: item.querySelector('.feature-number'),
            icon: item.querySelector('.feature-icon svg')
        }));

        // Create a style element for dynamic styles
        const styleElement = document.createElement('style');
        document.head.appendChild(styleElement);

        function updateFeatures() {
            const viewportCenter = window.innerHeight / 2;
            
            // Find the item closest to center
            let closestItem = null;
            let minDistance = Infinity;
            
            itemData.forEach(data => {
                const rect = data.element.getBoundingClientRect();
                const itemCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(itemCenter - viewportCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestItem = data;
                }
            });
            
            // Batch all style updates
            let styleRules = '';
            
            itemData.forEach((data, index) => {
                const rect = data.element.getBoundingClientRect();
                const itemCenter = rect.top + (rect.height / 2);
                const relativePosition = (itemCenter - viewportCenter) / (window.innerHeight / 2);
                const absoluteDistance = Math.abs(relativePosition);
                
                // Determine if this is the closest item or adjacent to it
                const isClosest = data === closestItem;
                const isAdjacent = Math.abs(
                    itemData.indexOf(data) - itemData.indexOf(closestItem)
                ) === 1;
                
                // Scale calculation
                let scale = 1;
                if (isClosest) {
                    scale = 1.08;
                } else if (isAdjacent) {
                    // Subtle scale for adjacent items
                    scale = 1 + (0.04 * Math.max(0, 1 - absoluteDistance));
                }
                
                // Color intensity only for the closest item
                const colorIntensity = isClosest ? 1 : 0;
                
                // Create unique class name for this item's current state
                const className = `feature-state-${index}`;
                data.element.className = `feature-item ${className}`;
                
                // Add styles for this state
                styleRules += `
                    .${className} {
                        transform: translate3d(0,0,0) scale(${scale});
                        background-color: ${colorIntensity > 0 ? 'rgb(124, 58, 237)' : 'white'};
                    }
                    .${className} .feature-title {
                        color: ${colorIntensity > 0 ? 'white' : ''};
                    }
                    .${className} .feature-description {
                        color: ${colorIntensity > 0 ? 'rgba(255, 255, 255, 0.9)' : ''};
                    }
                    .${className} .feature-number {
                        color: ${colorIntensity > 0 ? 'rgba(255, 255, 255, 0.8)' : ''};
                    }
                    .${className} .feature-icon svg {
                        stroke: ${colorIntensity > 0 ? 'white' : ''};
                    }
                `;
            });
            
            // Update all styles at once
            styleElement.textContent = styleRules;
            
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                rafId = requestAnimationFrame(updateFeatures);
            }
        }

        // Add scroll event listener with passive flag for better performance
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Initial update
        updateFeatures();

        // Cleanup function
        return function cleanup() {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener('scroll', onScroll);
            styleElement.remove();
            
            // Reset all styles
            itemData.forEach(data => {
                data.element.className = 'feature-item';
                data.element.style.transform = '';
                data.element.style.backgroundColor = '';
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