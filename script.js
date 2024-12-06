document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel-container');
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));
    const totalSlides = slides.length;

    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let animationID = 0;
    let currentTouch = null;

    // Touch events
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchmove', touchMove);
    track.addEventListener('touchend', touchEnd);

    // Prevent default behavior on touch events
    track.addEventListener('dragstart', (e) => e.preventDefault());

    function touchStart(event) {
        currentTouch = event.touches[0];
        startX = currentTouch.clientX;
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';
    }

    function touchMove(event) {
        if (!isDragging) return;
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
        if (Math.abs(movedBy) > window.innerWidth * 0.2) {
            if (movedBy < 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
        } else {
            goToSlide(currentIndex);
        }
    }

    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
        // Limit the slide movement to prevent dragging beyond first/last slide
        const minTranslate = -(totalSlides - 1) * window.innerWidth;
        const maxTranslate = 0;
        currentTranslate = Math.max(Math.min(currentTranslate, maxTranslate), minTranslate);
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function goToSlide(index) {
        // Ensure index stays within bounds
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentIndex = index;
        prevTranslate = -index * window.innerWidth;
        currentTranslate = prevTranslate;

        // Update slider position with animation
        track.style.transition = 'transform 0.3s ease-out';
        track.style.transform = `translateX(${currentTranslate}px)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Update slider on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            goToSlide(currentIndex);
        }, 250);
    });

    // Initialize dots click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    const dotsContainer = document.querySelector('.carousel-dots');

    let currentSlide = 0;
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

    // Move to slide function
    const moveToSlide = (targetIndex, loop = false) => {
        // Handle wrapping
        if (targetIndex >= slides.length) {
            targetIndex = 0;
        } else if (targetIndex < 0) {
            targetIndex = slides.length - 1;
        }

        track.style.transform = `translateX(-${targetIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[targetIndex].classList.add('active');
        currentSlide = targetIndex;
    };

    // Start autoplay
    const startAutoplay = () => {
        stopAutoplay(); // Clear any existing interval
        autoplayInterval = setInterval(() => {
            moveToSlide(currentSlide + 1, true);
        }, autoplayDelay);
    };

    // Stop autoplay
    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    };

    // Next button click
    nextButton.addEventListener('click', () => {
        moveToSlide(currentSlide + 1, true);
        stopAutoplay();
        startAutoplay(); // Reset the timer
    });

    // Previous button click
    prevButton.addEventListener('click', () => {
        moveToSlide(currentSlide - 1, true);
        stopAutoplay();
        startAutoplay(); // Reset the timer
    });

    // Dot click
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveToSlide(index);
            stopAutoplay();
            startAutoplay(); // Reset the timer
        });
    });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Start autoplay initially
    startAutoplay();
});