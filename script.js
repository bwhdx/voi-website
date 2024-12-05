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