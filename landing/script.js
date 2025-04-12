// Create globe animation
function createGlobe() {
    const container = document.createElement('div');
    container.className = 'globe-container';
    
    const globe = document.createElement('div');
    globe.className = 'globe';
    
    // Create dots with varying sizes and opacities
    const numDots = 300;
    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        // Random position on sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Convert spherical coordinates to Cartesian
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        
        // Position dot
        dot.style.transform = `translate3d(${x * 150}px, ${y * 150}px, ${z * 150}px)`;
        
        // Random size and opacity
        const size = Math.random() * 3 + 2;
        const opacity = Math.random() * 0.5 + 0.5;
        
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.opacity = opacity;
        
        // Add glow effect
        dot.style.boxShadow = `0 0 ${size * 2}px var(--accent-color)`;
        
        globe.appendChild(dot);
    }
    
    container.appendChild(globe);
    document.body.appendChild(container);
}

// Initialize globe animation
document.addEventListener('DOMContentLoaded', () => {
    createGlobe();
    
    // Add scroll reveal animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in class to elements
document.querySelectorAll('.feature-card, .machine-card, .tech-content > div').forEach(el => {
    el.classList.add('fade-in-element');
    observer.observe(el);
});

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in-element {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .fade-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Redirecting...';
        submitButton.disabled = true;
        
        // Simulate processing time and redirect to demo
        setTimeout(() => {
            window.location.href = 'demo.html';
        }, 1000);
    });
}

// Add hover effect to machine cards
document.querySelectorAll('.machine-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.machine-icon');
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.machine-icon');
        icon.style.transform = 'scale(1)';
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading animation
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease-in;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadingStyle);

// Demo Version Functionality
const demoButton = document.getElementById('demoButton');
if (demoButton) {
    demoButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show loading state
        demoButton.textContent = 'Loading Demo...';
        demoButton.disabled = true;
        
        // Simulate loading time
        setTimeout(() => {
            // Redirect to demo page
            window.location.href = 'demo.html';
        }, 1000);
    });
}

// Enhanced 3D Card Effects
document.querySelectorAll('.feature-card, .machine-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Parallax Effect for Hero Section
window.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (x - centerX) / 20;
    const moveY = (y - centerY) / 20;
    
    hero.style.backgroundPosition = `${moveX}px ${moveY}px`;
});

// Add CSS for reveal animation
const revealStyle = document.createElement('style');
revealStyle.textContent = `
    section {
        opacity: 0;
        transform: translateY(50px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    section.reveal {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(revealStyle); 