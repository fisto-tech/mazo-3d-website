// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Canvas setup
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const frameCount = 192;
const currentFrame = index => (
    `webpimages/${index.toString().padStart(5, '0')}.webp`
);

const images = [];
const sequence = {
    frame: 0
};

// Preload images
let imagesLoaded = 0;
const loaderBar = document.querySelector('.loader-bar');
const loader = document.getElementById('loader');

for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        imagesLoaded++;
        const progress = (imagesLoaded / frameCount) * 100;
        if (loaderBar) loaderBar.style.width = `${progress}%`;

        if (imagesLoaded === frameCount) {
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                render();
                initScrollAnimations();
                createParticles();
            }, 500);
        }
    };
    images.push(img);
}

function createParticles() {
    const container = document.getElementById('main');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.5;
        container.appendChild(particle);

        gsap.to(particle, {
            y: `+=${Math.random() * 100 - 50}`,
            x: `+=${Math.random() * 100 - 50}`,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const img = images[sequence.frame];
    if (!img) return;

    // Center and scale image to cover canvas (like background-size: cover)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
}

// GSAP Scroll Animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Image Sequence Animation
    gsap.to(sequence, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "power1.out",
        scrollTrigger: {
            trigger: "#main",
            start: "top top",
            endTrigger: "#section4",
            end: "bottom bottom",
            scrub: 1,
        },
        onUpdate: render
    });

    // Full Page Progress Bar
    ScrollTrigger.create({
        trigger: "#main",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            gsap.to("#progress-bar", { width: `${self.progress * 100}%`, duration: 0.3, ease: "power2.out" });
        }
    });

    // Split Text and Animate
    const splitText = (el) => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => 
            `<span class="char" style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    };

    const sections = gsap.utils.toArray(".section");
    sections.forEach((section, i) => {
        const title = section.querySelector(".reveal-text");
        const subtext = section.querySelector(".reveal-subtext");

        if (title) {
            splitText(title);
            const chars = title.querySelectorAll(".char");
            
            // Delay the last section slightly more for "next scroll" feel
            const startPos = section.id === "section5" ? "top 85%" : "top 70%";

            gsap.fromTo(chars, 
                { opacity: 0, y: 50, rotateX: -90 },
                {
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.03,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: startPos,
                        end: "bottom 30%",
                        toggleActions: "play none play reverse",
                    }
                }
            );
        }

        if (subtext) {
            const startPos = section.id === "section5" ? "top 80%" : "top 65%";
            
            gsap.fromTo(subtext,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: section,
                        start: startPos,
                        end: "bottom 35%",
                        toggleActions: "play none play reverse",
                    }
                }
            );
        }
    });

    // Canvas fading/transitions if needed
    // Example: Fade out background towards the final section
    gsap.to(".canvas-container", {
        opacity: 0.3,
        scrollTrigger: {
            trigger: ".footer-section",
            start: "top 80%",
            end: "top 20%",
            scrub: true
        }
    });

    // Navbar Scrolled State
    ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self) => {
            if (self.direction === 1) {
                document.getElementById('navbar').classList.add('scrolled');
            } else if (self.scroll() < 50) {
                document.getElementById('navbar').classList.remove('scrolled');
            }
        }
    });
}

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Disable scroll when menu is open
        if (mobileMenu.classList.contains('active')) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            lenis.start();
        });
    });
}

// Cursor Interaction (Premium Feel)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    // Cursor move
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out"
    });

    // Canvas Parallax
    const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
    const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
    
    gsap.to(canvas, {
        x: xPos,
        y: yPos,
        duration: 1.5,
        ease: "power3.out"
    });
});

// Style the cursor dynamically
const cursorStyle = document.createElement('style');
cursorStyle.innerHTML = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        background: var(--primary);
        border-radius: 50%;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s ease;
    }
    a:hover ~ .custom-cursor, .btn-primary:hover ~ .custom-cursor {
        transform: scale(3);
    }
`;
document.head.appendChild(cursorStyle);
