document.addEventListener('DOMContentLoaded', function() {
    const posts = document.querySelectorAll('.post-planet');
    const postsUniverse = document.getElementById('posts-universe');
    
    if (!posts.length || !postsUniverse) return;
    
    let currentPlanet = 0;
    let isScrolling = false;
    let scrollTimeout;
    
    // Enhanced smooth scrolling with easing
    function smoothScrollTo(element, duration = 1000) {
        const targetPosition = element.offsetTop - 100; // Account for fixed header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = easeInOutCubic(progress);
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
            }
        }
        
        isScrolling = true;
        requestAnimationFrame(animation);
    }
    
    // Navigate to specific planet
    function navigateToPlanet(index) {
        if (index >= 0 && index < posts.length) {
            currentPlanet = index;
            smoothScrollTo(posts[index]);
            updatePlanetStates();
        }
    }
    
    // Update visual states of planets
    function updatePlanetStates() {
        posts.forEach((post, index) => {
            post.classList.remove('active', 'visited', 'upcoming');
            
            if (index === currentPlanet) {
                post.classList.add('active');
            } else if (index < currentPlanet) {
                post.classList.add('visited');
            } else {
                post.classList.add('upcoming');
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (isScrolling) return;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'j':
                e.preventDefault();
                if (currentPlanet < posts.length - 1) {
                    navigateToPlanet(currentPlanet + 1);
                }
                break;
                
            case 'ArrowUp':
            case 'k':
                e.preventDefault();
                if (currentPlanet > 0) {
                    navigateToPlanet(currentPlanet - 1);
                }
                break;
                
            case 'Home':
                e.preventDefault();
                navigateToPlanet(0);
                break;
                
            case 'End':
                e.preventDefault();
                navigateToPlanet(posts.length - 1);
                break;
        }
    });
    
    // Mouse wheel navigation with throttling
    let wheelTimeout;
    document.addEventListener('wheel', function(e) {
        if (isScrolling) {
            e.preventDefault();
            return;
        }
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(function() {
            if (Math.abs(e.deltaY) > 50) { // Threshold for intentional scrolling
                if (e.deltaY > 0 && currentPlanet < posts.length - 1) {
                    e.preventDefault();
                    navigateToPlanet(currentPlanet + 1);
                } else if (e.deltaY < 0 && currentPlanet > 0) {
                    e.preventDefault();
                    navigateToPlanet(currentPlanet - 1);
                }
            }
        }, 50);
    }, { passive: false });
    
    // Touch/swipe navigation for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (isScrolling) return;
        
        touchEndY = e.changedTouches[0].screenY;
        const swipeDistance = touchStartY - touchEndY;
        const minSwipeDistance = 50;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0 && currentPlanet < posts.length - 1) {
                // Swipe up - next planet
                navigateToPlanet(currentPlanet + 1);
            } else if (swipeDistance < 0 && currentPlanet > 0) {
                // Swipe down - previous planet
                navigateToPlanet(currentPlanet - 1);
            }
        }
    });
    
    // Intersection Observer for automatic current planet detection
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver(function(entries) {
        if (isScrolling) return;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const planetIndex = parseInt(entry.target.dataset.postIndex);
                if (planetIndex !== currentPlanet) {
                    currentPlanet = planetIndex;
                    updatePlanetStates();
                }
            }
        });
    }, observerOptions);
    
    // Observe all planets
    posts.forEach(post => {
        observer.observe(post);
    });
    
    // Initialize
    updatePlanetStates();
    
    // Add some visual feedback when scrolling
    function addScrollFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'scroll-feedback';
        feedback.innerHTML = '🚀';
        document.body.appendChild(feedback);
        
        const feedbackStyles = document.createElement('style');
        feedbackStyles.textContent = `
            .scroll-feedback {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                opacity: 0;
                pointer-events: none;
                z-index: 9999;
                transition: all 0.3s ease;
            }
            
            .scroll-feedback.active {
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(1.2);
            }
        `;
        
        document.head.appendChild(feedbackStyles);
        
        // Show feedback during navigation
        const originalNavigateToPlanet = navigateToPlanet;
        navigateToPlanet = function(index) {
            feedback.classList.add('active');
            setTimeout(() => {
                feedback.classList.remove('active');
            }, 300);
            
            originalNavigateToPlanet(index);
        };
    }
    
    addScrollFeedback();
});