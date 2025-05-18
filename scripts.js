// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS Animation library with enhanced settings
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    
    // Setup all UI components
    setupLoader();
    setupNavigation();
    setupMobileMenu();

    setupMusicVisualizer();

    setupLazyLoading();
    setupSmoothScroll();
});

// Loading Animation with improved transition
function setupLoader() {
    window.addEventListener('load', function() {
        const loader = document.querySelector('.loader-wrapper');
        if (!loader) return;
        
        // Reduced timeout for better user experience
        setTimeout(function() {
            loader.classList.add('fade-out');
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    });
}

// Enhanced Navigation with debounced scroll event
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.querySelector('.scroll-indicator');
    
    if (!navbar && !scrollProgress) return;
    
    // Debounce function to improve scroll performance
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            // Navbar transformation with smoother transitions
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('py-2', 'bg-black', 'shadow-lg');
                    navbar.classList.remove('py-4');
                } else {
                    navbar.classList.add('py-4');
                    navbar.classList.remove('py-2', 'bg-black', 'shadow-lg');
                }
            }
            
            // Scroll Progress indicator with smoother animation
            if (scrollProgress) {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = (window.scrollY / scrollHeight) * 100;
                scrollProgress.style.width = scrolled + '%';
                scrollProgress.style.transition = 'width 0.2s ease-out';
            }
        });
    });
}

// Improved Mobile Menu Toggle with animation
function setupMobileMenu() {
    const menuToggle = document.querySelector('[onclick="toggleMenu()"]');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenu) return;
    
    // Replace inline onclick with proper event listener
    if (menuToggle) {
        menuToggle.removeAttribute('onclick');
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            
            // Add slide animation
            if (mobileMenu.classList.contains('flex')) {
                mobileMenu.style.transform = 'translateY(0)';
                mobileMenu.style.opacity = '1';
            } else {
                mobileMenu.style.transform = 'translateY(-20px)';
                mobileMenu.style.opacity = '0';
            }
        });
    }
    
    // Keep the function for backward compatibility with enhanced animation
    window.toggleMenu = function() {
        if (!mobileMenu) return;
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
        
        if (mobileMenu.classList.contains('flex')) {
            mobileMenu.style.transform = 'translateY(0)';
            mobileMenu.style.opacity = '1';
        } else {
            mobileMenu.style.transform = 'translateY(-20px)';
            mobileMenu.style.opacity = '0';
        }
    };
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target) && !mobileMenu.classList.contains('hidden')) {
            toggleMenu();
        }
    });
}


// Enhanced Music Visualizer with optimized performance
function setupMusicVisualizer() {
    const canvas = document.getElementById('musicVisualizer');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Ensure canvas dimensions match display size with improved handling
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
    }
    
    resizeCanvas();
    
    // Debounce resize event for better performance
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 250);
    });
    
    const bars = 120; // Increased for more detail
    const maxBarHeight = 60; // Maximum bar height
    
    // Use RAF for smoother animation
    let animationFrame;
    let lastTime = 0;
    const fpsLimit = 30; // Limit frames for performance
    
    function animate(timestamp) {
        if (!lastTime || timestamp - lastTime >= 1000 / fpsLimit) {
            lastTime = timestamp;
            
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
            
            const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
            const barWidth = canvasWidth / bars;
            
            for (let i = 0; i < bars; i++) {
                // Smoother height calculation with sine wave influence
                const height = (Math.sin(Date.now() * 0.001 + i * 0.15) + 1) * 0.5 * maxBarHeight + Math.random() * 15;
                
                // Gradient color based on height and position
                const gradient = ctx.createLinearGradient(0, canvasHeight - height, 0, canvasHeight);
                gradient.addColorStop(0, `hsla(${(i * 3) % 360}, 80%, 65%, 0.8)`);
                gradient.addColorStop(1, `hsla(${(i * 3) % 360}, 80%, 45%, 0.4)`);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(i * barWidth, canvasHeight - height, barWidth - 1, height);
                
                // Add glow effect
                ctx.shadowColor = `hsla(${(i * 3) % 360}, 80%, 60%, 0.5)`;
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
            
            // Reset shadow for performance
            ctx.shadowBlur = 0;
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Clean up animation when tab is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            lastTime = 0;
            animate();
        }
    });
}


// New feature: Lazy Loading for images and iframes
function setupLazyLoading() {
    // Check if browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        const lazyElements = document.querySelectorAll('[data-src], [data-background]');
        
        if (lazyElements.length === 0) return;
        
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.hasAttribute('data-src')) {
                        // Handle image or iframe src
                        element.src = element.getAttribute('data-src');
                        element.removeAttribute('data-src');
                    }
                    
                    if (element.hasAttribute('data-background')) {
                        // Handle background image
                        element.style.backgroundImage = `url(${element.getAttribute('data-background')})`;
                        element.removeAttribute('data-background');
                    }
                    
                    // Add a fade-in class
                    element.classList.add('lazy-loaded');
                    
                    // Stop observing once loaded
                    lazyObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        loadAllLazyElements();
    }
    
    function loadAllLazyElements() {
        const lazyElements = document.querySelectorAll('[data-src], [data-background]');
        
        lazyElements.forEach(element => {
            if (element.hasAttribute('data-src')) {
                element.src = element.getAttribute('data-src');
                element.removeAttribute('data-src');
            }
            
            if (element.hasAttribute('data-background')) {
                element.style.backgroundImage = `url(${element.getAttribute('data-background')})`;
                element.removeAttribute('data-background');
            }
            
            element.classList.add('lazy-loaded');
        });
    }
}

// New feature: Smooth Scroll for anchor links
function setupSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    if (anchorLinks.length === 0) return;
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (!targetElement) return;
            
            // Get navbar height for offset (if navbar exists)
            const navbar = document.getElementById('navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            
            // Calculate scroll position with offset
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Update URL hash without scrolling
            history.pushState(null, null, targetId);
        });
    });
}