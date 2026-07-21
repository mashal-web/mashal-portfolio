// =========================
// DOM Elements
// =========================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// =========================
// Scroll Progress Bar
// =========================
const scrollProgress = $('.scroll-progress');

if (scrollProgress) {
    let progressTimeout;
    window.addEventListener('scroll', () => {
        if (progressTimeout) return;
        progressTimeout = setTimeout(() => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            scrollProgress.style.width = scrolled + '%';
            progressTimeout = null;
        }, 10);
    });
}

// =========================
// Scroll Reveal Animation
// =========================
const hiddenElements = $$('.hidden');

if (hiddenElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Unobserve after reveal for better performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    hiddenElements.forEach((element) => {
        revealObserver.observe(element);
    });
}

// =========================
// Active Navigation Link
// =========================
const sections = $$('section[id]');
const navLinks = $$('.nav-links a');

if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                });
                
                const activeLink = $(`.nav-links a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '0px 0px -100px 0px'
    });
    
    sections.forEach((section) => {
        navObserver.observe(section);
    });
}

// =========================
// Mobile Navigation
// =========================
const hamburger = $('.hamburger');
const navMenu = $('.nav-links');

if (hamburger && navMenu) {
    const toggleMenu = (state) => {
        const isOpen = state !== undefined ? state : !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen);
        hamburger.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    };
    
    hamburger.addEventListener('click', () => toggleMenu());
    
    // Close menu when a navigation link is clicked
    const menuLinks = $$('.nav-links a');
    menuLinks.forEach((link) => {
        link.addEventListener('click', () => toggleMenu(false));
    });
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active')) {
            const isClickInside = navMenu.contains(e.target) || hamburger.contains(e.target);
            if (!isClickInside) {
                toggleMenu(false);
            }
        }
    });
    
    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}

// =========================
// Back To Top Button
// =========================
const backToTop = $('#backToTop');

if (backToTop) {
    let scrollTimeout;
    const handleScroll = () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            const shouldShow = window.scrollY > 300;
            backToTop.classList.toggle('show', shouldShow);
            scrollTimeout = null;
        }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =========================
// Navbar Scroll Effect
// =========================
const navbar = $('.navbar');

if (navbar) {
    let navbarTimeout;
    window.addEventListener('scroll', () => {
        if (navbarTimeout) return;
        navbarTimeout = setTimeout(() => {
            const shouldScrolled = window.scrollY > 40;
            navbar.classList.toggle('scrolled', shouldScrolled);
            navbarTimeout = null;
        }, 50);
    }, { passive: true });
}

// =========================
// Project Card Interactions
// =========================
const projectCards = $$('.project-card .btn');

if (projectCards.length) {
    projectCards.forEach((btn) => {
        btn.addEventListener('click', function(e) {
            if (this.textContent.includes('Coming Soon')) {
                e.preventDefault();
                const projectTitle = this.closest('.project-card').querySelector('h3')?.textContent || 'Project';
                showNotification(`🚧 "${projectTitle}" is currently under development! Stay tuned for updates.`);
            }
        });
    });
}

// =========================
// Custom Notification System
// =========================
function showNotification(message, duration = 4000) {
    const existingNotification = $('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon" aria-hidden="true">ℹ️</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    let timeout;
    
    const removeNotification = () => {
        if (!notification.parentNode) return;
        notification.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    };
    
    closeBtn.addEventListener('click', removeNotification);
    
    timeout = setTimeout(removeNotification, duration);
    
    notification.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
    });
    
    notification.addEventListener('mouseleave', () => {
        timeout = setTimeout(removeNotification, duration);
    });
}

// =========================
// Dynamic Copyright Year
// =========================
const yearElement = document.getElementById('currentYear');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// =========================
// Handle Image Loading Errors
// =========================
document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        console.warn(`Failed to load image: ${this.src}`);
    });
});

// =========================
// Console Easter Egg (Optional - Remove in Production)
// =========================
if (process.env.NODE_ENV !== 'production') {
    console.log('%c🚀 Mashal Khan Portfolio', 'font-size: 24px; font-weight: bold; color: #38bdf8;');
    console.log('%cBuilt with ❤️ using HTML, CSS & JavaScript', 'font-size: 14px; color: #94a3b8;');
}
// =========================
// Contact Form Handler
// =========================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Send to Formspree
            const response = await fetch('https://formspree.io/f/mykrjvrv', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formStatus.className = 'form-status success';
                formStatus.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
                formStatus.style.display = 'block';
                contactForm.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = '❌ Something went wrong. Please try again or email me directly.';
            formStatus.style.display = 'block';
        } finally {
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}