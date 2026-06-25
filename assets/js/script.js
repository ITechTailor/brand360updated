// Close mobile menu on scroll
window.addEventListener('scroll', () => {
    document.getElementById('mob-menu').classList.remove('open');
}, { passive: true });
// Keyboard close modal
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('enquiry-modal').classList.remove('open');
});


// Portfolio filter — exposed to window for inline onclick
window.filterPort = function (btn, cat) {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.port-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
};

// Enquiry form submit — exposed to window for inline onclick
window.handleSubmit = async function () {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const email = document.getElementById('f-email').value.trim();
    if (!name || !phone || !email) {
        alert('Please fill in your name, phone, and email to proceed.');
        return;
    }
    const typeEl = document.getElementById('f-type');
    const sizeEl = document.getElementById('f-size');
    const payload = {
        name,
        phone,
        email,
        eventType: typeEl ? typeEl.options[typeEl.selectedIndex].text : '',
        eventDate: document.getElementById('f-date').value || '',
        eventSize: sizeEl ? sizeEl.options[sizeEl.selectedIndex].text : '',
        message: document.getElementById('f-msg').value.trim(),
    };
    const btn = document.getElementById('f-submit');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${supabaseUrl}/functions/v1/send-enquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Request failed');
        document.getElementById('enquiry-modal').classList.remove('open');
        alert('Thank you, ' + name + '! Your enquiry has been sent. Our team will be in touch within 24 hours.\n\nOr call us now: +91 98844 26115');
    } catch (err) {
        alert('Sorry, something went wrong sending your enquiry. Please try again or call us at +91 98844 26115.');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
};


// Number counters
const statsSection = document.querySelector('.stats');
const counters = document.querySelectorAll('.stat-n');
let counterStarted = false;

const animateCounter = (counter) => {
    const target = +counter.dataset.count;
    const isK = counter.textContent.includes('K');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const update = () => {
        current += increment;
        if (current < target) {
            counter.textContent = Math.floor(current) + (isK ? 'K+' : '+');
            requestAnimationFrame(update);
        } else {
            counter.textContent = target + (isK ? 'K+' : '+');
        }
    };
    update();
};

if (statsSection) {
    new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counterStarted) {
                counterStarted = true;
                counters.forEach(animateCounter);
                obs.unobserve(statsSection);
            }
        });
    }, { threshold: 0.5 }).observe(statsSection);
}


// Founder Carousel
var founderIndex = 0;
var founderTimer;
var founderTrack = document.getElementById('founderTrack');
var founderDots = document.querySelectorAll('.founder-dot');

function founderGoTo(n) {
    founderIndex = ((n % 2) + 2) % 2;
    founderTrack.style.transform = 'translateX(-' + (founderIndex * 100) + '%)';
    founderDots.forEach(function (d, i) { d.classList.toggle('active', i === founderIndex); });
}

function founderStartTimer() {
    clearInterval(founderTimer);
    founderTimer = setInterval(function () { founderGoTo(founderIndex + 1); }, 3000);
}

founderDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
        founderGoTo(parseInt(this.dataset.slide, 10));
        founderStartTimer();
    });
});

founderStartTimer();


// Scroll to top
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
