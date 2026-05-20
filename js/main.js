/* ══════════════════════════════════════════
   main.js — Portfolio Endika Prado
══════════════════════════════════════════ */

// ── Configuración verificación email ────────
// API gratuita, open source, sin registro ni API key
// https://rapid-email-verifier.fly.dev

// ── Navbar scroll ──────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Burger menu ────────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
});

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

// Close pill menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
    }
});

// ── Scroll reveal ──────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ── Typing effect for hero role ─────────────
const roles = [
    'Desarrollador de Aplicaciones Multiplataforma',
    'Estudiante de DAM',
    'Backend Developer',
    'Java & MySQL Dev',
    'Desarrollador Web'
];

const typeTarget = document.querySelector('.type-role');
if (typeTarget) {
    let roleIndex  = 0;
    let charIndex  = 0;
    let isDeleting = false;

    function type() {
        const current = roles[roleIndex];
        if (isDeleting) {
            typeTarget.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typeTarget.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 40 : 70;

        if (!isDeleting && charIndex === current.length) {
            speed      = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex  = (roleIndex + 1) % roles.length;
            speed      = 300;
        }

        setTimeout(type, speed);
    }

    setTimeout(type, 1500);
}

// ── Mac red dot — error shake en TODAS las ventanas ─
function triggerShake(el) {
    el.classList.remove('error-shake');
    void el.offsetWidth;
    el.classList.add('error-shake');
    el.addEventListener('animationend', () => {
        el.classList.remove('error-shake');
    }, { once: true });
}

document.querySelectorAll('.mac-dot.red').forEach(dot => {
    const macWindow = dot.closest('.mac-window') || dot.closest('.photo-shake-wrapper');
    if (!macWindow) return;

    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerShake(macWindow);
    });
});

// ── Contact form — envío real con Resend vía Cloudflare Worker ─
const form       = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        // Validar campos requeridos vacíos
        form.querySelectorAll('[required]').forEach(field => {
            field.classList.remove('error');
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            }
        });

        // Validar formato básico de email
        const emailField = document.getElementById('email');
        const emailValue = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailValue || !emailRegex.test(emailValue)) {
            emailField.classList.add('error');
            valid = false;
        }

        if (!valid) {
            formStatus.textContent = '// Error: rellena todos los campos correctamente.';
            formStatus.style.color = '#e05555';
            return;
        }

        // Envío real vía Cloudflare Worker → Resend
        const btn       = form.querySelector('button[type="submit"]');
        btn.disabled    = true;
        btn.textContent = 'Enviando...';
        formStatus.textContent = '';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:    document.getElementById('name').value.trim(),
                    email:   emailValue,
                    message: document.getElementById('message').value.trim(),
                }),
            });

            if (res.ok) {
                formStatus.textContent = '// Mensaje enviado con éxito. ¡Gracias!';
                formStatus.style.color = 'var(--accent)';
                form.reset();
            } else {
                formStatus.textContent = '// Error al enviar. Inténtalo de nuevo.';
                formStatus.style.color = '#e05555';
            }
        } catch (err) {
            formStatus.textContent = '// Error de conexión. Inténtalo de nuevo.';
            formStatus.style.color = '#e05555';
        }

        btn.disabled    = false;
        btn.textContent = 'Enviar mensaje';
    });

    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('error'));
    });
}

// ── Cursor glow effect (desktop only) ──────
if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(200,245,96,0.05) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        top: 0; left: 0;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    });
}