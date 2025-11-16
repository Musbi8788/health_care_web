// ===============================================
// WAIT FOR DOM TO LOAD
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // ===============================================
    // NAVIGATION FUNCTIONALITY
    // ===============================================

    // Get elements
    const navbar = document.getElementById('navbar');
    const scrollTop = document.getElementById('scrollTop');
    const themeToggle = document.getElementById('themeToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById("contactForm");

    // Check for saved theme preference or default to 'light'
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        // Theme Toggle Functionality
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Scroll events
    if (navbar && scrollTop) {
        window.addEventListener('scroll', () => {
            // Add scrolled class to navbar
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Show/hide scroll to top button
            if (window.scrollY > 300) {
                scrollTop.classList.add('show');
            } else {
                scrollTop.classList.remove('show');
            }

            // Trigger scroll animations
            animateOnScroll();
        });

        // Scroll to Top Button
        scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu Toggle
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Focus management for mobile menu
        mobileMenuToggle.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                // Focus first link when menu opens
                setTimeout(() => {
                    if (navLinks[0]) navLinks[0].focus();
                }, 300);
            }
        });
    }

    // Close mobile menu when clicking on a link
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
            });
        });
    }

    // ===============================================
    // SMOOTH SCROLLING
    // ===============================================

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===============================================
    // CONTACT FORM HANDLING - FIXED
    // ===============================================

    if (contactForm) {
        console.log("✅ Contact form found successfully");
        
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent default form submission
            e.stopPropagation(); // Stop event bubbling
            
            console.log("📝 Form submitted!");

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const message = document.getElementById("message").value.trim();

            

            // Validate fields
            if (!name || !phone || !message) {
                alert("⚠️ Please fill in all fields");
                return;
            }

            // Disable submit button to prevent double submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
            }

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, phone, message })
                });

                console.log("Response status:", response.status);

                const data = await response.json();
                console.log("Response data:", data);

                if (response.ok) {
                    alert("✅ Message sent successfully! We'll get back to you soon.");
                    contactForm.reset();
                } else {
                    alert("❌ " + (data.error || "Error sending message. Please try again."));
                }
            } catch (error) {
                console.error("Fetch error:", error);
                alert("❌ Network error. Please check your connection and try again.");
            } finally {
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Send Message";
                }
            }
        });
    } else {
        console.error("❌ Contact form not found! Check your HTML.");
    }

    // ===============================================
    // SCROLL ANIMATIONS
    // ===============================================

    function animateOnScroll() {
        const elements = document.querySelectorAll('.service-card, .benefit-card, .info-card, .about-text, .about-image');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            // Check if element is in viewport
            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                // Add animation classes based on position
                if (!element.classList.contains('visible')) {
                    if (element.classList.contains('about-text')) {
                        element.classList.add('slide-in-left', 'visible');
                    } else if (element.classList.contains('about-image')) {
                        element.classList.add('slide-in-right', 'visible');
                    } else {
                        element.classList.add('slide-in-up', 'visible');
                    }
                }
            }
        });
    }

    // Initial check for elements already in viewport
    animateOnScroll();

    // ===============================================
    // ACTIVE NAVIGATION LINK
    // ===============================================

    // Highlight active section in navigation
    function setActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', setActiveNavLink);

    // ===============================================
    // PERFORMANCE OPTIMIZATION
    // ===============================================

    // Debounce scroll events for better performance
    function debounce(func, wait = 10, immediate = true) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Apply debounce to scroll-heavy functions
    const efficientScroll = debounce(() => {
        animateOnScroll();
        setActiveNavLink();
    });

    window.addEventListener('scroll', efficientScroll);

    // ===============================================
    // PHONE NUMBER CLICK TRACKING (Optional)
    // ===============================================

    // Track when users click phone numbers
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('Phone number clicked:', link.href);
            // In production, you might want to track this with analytics
            // Example: gtag('event', 'phone_click', { phone_number: link.href });
        });
    });

    // ===============================================
    // ACCESSIBILITY ENHANCEMENTS
    // ===============================================

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // ===============================================
    // INTERSECTION OBSERVER (Modern Animation Alternative)
    // ===============================================

    // Use Intersection Observer for better performance on modern browsers
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add specific animation classes
                    if (entry.target.classList.contains('about-text')) {
                        entry.target.classList.add('slide-in-left');
                    } else if (entry.target.classList.contains('about-image')) {
                        entry.target.classList.add('slide-in-right');
                    } else {
                        entry.target.classList.add('slide-in-up');
                    }
                    
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all animated elements
        const animatedElements = document.querySelectorAll('.service-card, .benefit-card, .info-card, .about-text, .about-image');
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // ===============================================
    // CONSOLE MESSAGE
    // ===============================================

    console.log('%c🌿 Jayid Botamed Health Care', 'font-size: 20px; color: #2E8B57; font-weight: bold;');
    console.log('%cWebsite loaded successfully!', 'font-size: 14px; color: #3CBEDC;');
    console.log('%cFor support, call: 7523834 / 2725128', 'font-size: 12px; color: #6C757D;');
    console.log('%cTheme: ' + (document.documentElement.getAttribute('data-theme') || 'light'), 'font-size: 12px; color: #2E8B57;');
}

// ===============================================
// PREVENT FORM RESUBMISSION
// ===============================================

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}