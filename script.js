// Ano dinâmico no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Efeito ripple ao clicar nos cards
document.querySelectorAll('.link-card, .featured-link').forEach(card => {
    card.addEventListener('click', e => {
        const rect = card.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    });
});

// Paralaxe leve nos blobs conforme movimento do mouse
const blobs = document.querySelectorAll('.blob');
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    blobs.forEach((b, i) => {
        const depth = (i + 1) * 0.4;
        b.style.translate = `${x * depth}px ${y * depth}px`;
    });
});

// Injeta o estilo do ripple dinamicamente (evita mexer no CSS principal)
const style = document.createElement('style');
style.textContent = `
    .link-card, .featured-link { position: relative; }
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 180, 60, .45);
        transform: scale(0);
        animation: ripple-anim .6s ease-out;
        pointer-events: none;
    }
    @keyframes ripple-anim {
        to { transform: scale(2.5); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Revelar ao scroll (intersection observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.featured-link, .gallery').forEach(el => {
    observer.observe(el);
});

/* ============================================================
   Modal de fotos + lightbox
   ============================================================ */
const modal = document.getElementById('photo-modal');
const openBtn = document.getElementById('open-gallery');
const photoCells = document.querySelectorAll('.photo-cell');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');

const photos = Array.from(photoCells).map(cell => {
    const img = cell.querySelector('img');
    return { src: img.src, alt: img.alt };
});
let currentIndex = 0;

function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}
function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}
function openLightbox(i) {
    currentIndex = i;
    lightboxImg.src = photos[i].src;
    lightboxImg.alt = photos[i].alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}
function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (!modal.classList.contains('open')) {
        document.body.classList.remove('modal-open');
    }
}
function showPhoto(delta) {
    currentIndex = (currentIndex + delta + photos.length) % photos.length;
    lightboxImg.src = photos[currentIndex].src;
    lightboxImg.alt = photos[currentIndex].alt;
}

openBtn.addEventListener('click', openModal);
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
photoCells.forEach((cell, i) => cell.addEventListener('click', () => openLightbox(i)));
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showPhoto(-1));
lightboxNext.addEventListener('click', () => showPhoto(1));

// Fechar/navegar com teclado
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   showPhoto(-1);
        if (e.key === 'ArrowRight')  showPhoto(1);
    } else if (modal.classList.contains('open') && e.key === 'Escape') {
        closeModal();
    }
});

// Swipe no lightbox (mobile)
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showPhoto(dx < 0 ? 1 : -1);
}, { passive: true });

/* ============================================================
   Modal do cardápio (PDF)
   ============================================================ */
const menuModal = document.getElementById('menu-modal');
const menuOpeners = document.querySelectorAll('#open-menu, #open-menu-featured');

function openMenu() {
    menuModal.classList.add('open');
    menuModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}
function closeMenu() {
    menuModal.classList.remove('open');
    menuModal.setAttribute('aria-hidden', 'true');
    if (!modal.classList.contains('open') && !lightbox.classList.contains('open')) {
        document.body.classList.remove('modal-open');
    }
}

menuOpeners.forEach(btn => btn.addEventListener('click', openMenu));
menuModal.querySelectorAll('[data-close-menu]').forEach(el => el.addEventListener('click', closeMenu));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuModal.classList.contains('open')) closeMenu();
});

// Ampliar imagem do cardápio em lightbox ao clicar
const menuImage = document.getElementById('menu-image');
if (menuImage) {
    menuImage.addEventListener('click', () => {
        photos.push({ src: menuImage.src, alt: menuImage.alt });
        openLightbox(photos.length - 1);
    });
}
