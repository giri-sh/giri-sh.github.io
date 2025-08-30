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
    
    // Add planet indicators/navigation dots
    function createPlanetIndicators() {
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'planet-indicators';
        indicatorContainer.innerHTML = `
            <div class=\"indicators-title\">Planets</div>
            <div class=\"indicators-list\">
                ${Array.from(posts).map((_, index) => 
                    `<button class=\"indicator-dot\" data-planet=\"${index}\" title=\"Planet ${index + 1}\">
                        <span class=\"dot-glow\"></span>
                    </button>`
                ).join('')}
            </div>
            <div class=\"navigation-help\">
                <div>\u2191\u2193 or j/k to navigate</div>
                <div>Mouse wheel or swipe</div>
            </div>
        `;
        
        document.body.appendChild(indicatorContainer);
        
        // Add click handlers for indicators
        const indicators = indicatorContainer.querySelectorAll('.indicator-dot');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const planetIndex = parseInt(this.dataset.planet);
                navigateToPlanet(planetIndex);
            });
        });
        
        return indicators;
    }
    
    const indicators = createPlanetIndicators();
    
    // Update indicators when planet changes
    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'visited', 'upcoming');
            
            if (index === currentPlanet) {
                indicator.classList.add('active');
            } else if (index < currentPlanet) {
                indicator.classList.add('visited');
            } else {
                indicator.classList.add('upcoming');
            }
        });
    }
    
    // Override the updatePlanetStates function to include indicators
    const originalUpdatePlanetStates = updatePlanetStates;
    updatePlanetStates = function() {
        originalUpdatePlanetStates();
        updateIndicators();
    };
    
    // Add CSS for planet indicators
    const indicatorStyles = document.createElement('style');
    indicatorStyles.textContent = `
        .planet-indicators {
            position: fixed;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            background: rgba(26, 26, 46, 0.9);
            padding: 1.5rem 1rem;
            border-radius: 15px;
            border: 1px solid rgba(77, 208, 225, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .indicators-title {
            color: #00d4ff;
            font-size: 0.8rem;
            text-align: center;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        
        .indicators-list {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            margin-bottom: 1rem;
        }
        
        .indicator-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid rgba(77, 208, 225, 0.5);
            background: transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            padding: 0;
        }
        
        .indicator-dot:hover {
            border-color: #00d4ff;
            transform: scale(1.2);
        }
        
        .indicator-dot.active {
            background: #00d4ff;
            border-color: #00d4ff;
            box-shadow: 0 0 10px #4dd0e1;
        }
        
        .indicator-dot.visited {
            background: rgba(77, 208, 225, 0.6);
            border-color: rgba(77, 208, 225, 0.8);
        }
        
        .indicator-dot.upcoming {
            border-color: rgba(77, 208, 225, 0.3);
        }
        
        .dot-glow {
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(77, 208, 225, 0.3) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .indicator-dot.active .dot-glow {
            opacity: 1;
        }
        
        .navigation-help {
            font-size: 0.7rem;
            color: rgba(232, 234, 240, 0.6);
            text-align: center;
            line-height: 1.3;
        }
        
        @media (max-width: 768px) {
            .planet-indicators {
                right: 1rem;
                padding: 1rem 0.8rem;
            }
            
            .navigation-help {
                display: none;
            }
        }
    `;
    
    document.head.appendChild(indicatorStyles);
    
    // Initialize
    updatePlanetStates();
    
    // Add some visual feedback when scrolling
    function addScrollFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'scroll-feedback';
        feedback.innerHTML = '\ud83d\ude80';
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