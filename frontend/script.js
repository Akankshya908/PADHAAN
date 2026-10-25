// Mobile Menu Toggle + Page Initialization

function getScholarshipsData() {
    return Array.isArray(window.scholarships) ? window.scholarships : [];
}
let activeScholarshipGroup = 'all';
let scholarshipSearchTerm = '';
const ACCESSIBLE_THEME_KEY = 'padhaan-accessible-theme';
const MATCH_REASON_LABELS = {
    "education match": "Eligible education level",
    "field exact match": "Perfect field match",
    "field open to all": "Field-flexible scholarship",
    "field broad match": "Broad field eligibility",
    "category match": "Category eligible",
    "category open": "Open category eligibility",
    "category broad": "Broader category eligibility",
    "strong academic fit": "Excellent academic performance",
    "good academic fit": "Good academic performance",
    "eligible marks": "Meets minimum marks requirement",
    "comfortably within income limit": "Strong income eligibility",
    "within income limit": "Within income limit",
    "income just fits": "Meets income criteria"
};

function applyAccessibleTheme(isEnabled) {
    if (!document.body) return;

    if (isEnabled) {
        document.body.setAttribute('data-accessible-theme', 'colorblind');
    } else {
        document.body.removeAttribute('data-accessible-theme');
    }

    document.querySelectorAll('[data-accessibility-toggle]').forEach((button) => {
        button.classList.toggle('is-active', isEnabled);
        button.setAttribute('aria-pressed', String(isEnabled));
        button.setAttribute(
            'aria-label',
            isEnabled ? 'Turn off color blind friendly mode' : 'Turn on color blind friendly mode'
        );

        const label = button.querySelector('[data-accessibility-label]');
        if (label) {
            label.textContent = isEnabled ? 'Accessibility On' : 'Accessibility';
        }
    });
}

function isAccessibleThemeEnabled() {
    return localStorage.getItem(ACCESSIBLE_THEME_KEY) === 'true';
}

function createAccessibilityToggle() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accessibility-toggle';
    button.setAttribute('data-accessibility-toggle', 'true');
    button.innerHTML = `
        <span class="accessibility-toggle__dot" aria-hidden="true"></span>
        <span data-accessibility-label>Accessibility</span>
    `;

    button.addEventListener('click', () => {
        const nextState = !isAccessibleThemeEnabled();
        localStorage.setItem(ACCESSIBLE_THEME_KEY, String(nextState));
        applyAccessibleTheme(nextState);
    });

    return button;
}

function initializeAccessibilityToggle() {
    const desktopNav = document.querySelector('.nav-links');
    const mobileMenu = document.getElementById('mobile-menu');

    if (desktopNav && !desktopNav.querySelector('[data-accessibility-toggle]')) {
        desktopNav.appendChild(createAccessibilityToggle());
    }

    if (mobileMenu && !mobileMenu.querySelector('[data-accessibility-toggle]')) {
        mobileMenu.appendChild(createAccessibilityToggle());
    }

    applyAccessibleTheme(isAccessibleThemeEnabled());
}

document.addEventListener('DOMContentLoaded', function () {
    initializeAccessibilityToggle();

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        if (
            mobileMenu &&
            mobileMenuBtn &&
            mobileMenu.classList.contains('active') &&
            !mobileMenu.contains(event.target) &&
            !mobileMenuBtn.contains(event.target)
        ) {
            mobileMenu.classList.remove('active');
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        navbar.style.boxShadow =
            window.scrollY > 50
                ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)';
    });

    // Scholarship form submit handler
    const scholarshipForm = document.getElementById('scholarshipForm');
    if (scholarshipForm) {
        scholarshipForm.addEventListener('submit', handleScholarshipSubmit);
    }

    // Contact form submit handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Load scholarships on scholarships page
    const allScholarshipsContainer = document.getElementById('all-scholarships-container');
    if (allScholarshipsContainer && getScholarshipsData().length) {
        displayAllScholarships();
    }

    animateOnScroll();
    initSessionsMarquee();
});

// Sessions marquee: smooth auto-scroll + drag-to-scroll + pause on hover
function initSessionsMarquee() {
    const container = document.querySelector('.sessions-marquee');
    if (!container) return;

    const track = container.querySelector('.sessions-marquee-track');
    if (!track) return;

    // Ensure content is long enough: duplicate already present in HTML
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let isPaused = false;
    const speed = 1.2; // pixels per RAF frame (adjusted faster for smoother cinematic scroll)
    let autoScrollEnabled = window.innerWidth > 768;

    const updateAutoScroll = () => {
        autoScrollEnabled = window.innerWidth > 768;
    };

    window.addEventListener('resize', updateAutoScroll);

    // Make sure container is scrollable by duplicating content width handling
    // Start scroll position somewhere in the first set
    // Use requestAnimationFrame for smooth continuous scroll
    function step() {
        if (autoScrollEnabled && !isPaused && !isDown) {
            container.scrollLeft += speed;
            // reset when scrolled past half (since content duplicated)
            if (container.scrollLeft >= track.scrollWidth / 2) {
                container.scrollLeft = container.scrollLeft - track.scrollWidth / 2;
            }
        }
        requestAnimationFrame(step);
    }

    // Interaction handlers
    container.addEventListener('pointerdown', (e) => {
        isDown = true;
        startX = e.clientX;
        scrollStart = container.scrollLeft;
        isPaused = true;
        container.classList.add('is-dragging');
        container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        container.scrollLeft = scrollStart - dx;
    });

    container.addEventListener('pointerup', (e) => {
        isDown = false;
        isPaused = false;
        container.classList.remove('is-dragging');
        try { container.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    container.addEventListener('pointercancel', () => {
        isDown = false;
        isPaused = false;
        container.classList.remove('is-dragging');
    });

    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { if (!isDown) isPaused = false; });

    // Initialize: set scrollLeft to 0
    container.scrollLeft = 0;
    requestAnimationFrame(step);
}

// Handle Scholarship Form Submission
function handleScholarshipSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        education: formData.get('education'),
        field: formData.get('field'),
        percentage: parseFloat(formData.get('percentage')),
        income: formData.get('income'),
        category: formData.get('category')
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Finding matches...</span>';

    setTimeout(() => {
        const matchedScholarships = filterScholarshipsByProfile(data);
        displayResults(matchedScholarships);

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;

        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 800);
}

function parseIncomeMax(value) {
    if (!value) return Infinity;

    const str = String(value).trim();

    if (str.includes('+')) {
        const n = parseInt(str.replace('+', ''), 10);
        return Number.isNaN(n) ? Infinity : n;
    }

    const parts = str.split('-');
    if (parts.length === 2) {
        const n = parseInt(parts[1], 10);
        return Number.isNaN(n) ? Infinity : n;
    }

    const single = parseInt(str, 10);
    return Number.isNaN(single) ? Infinity : single;
}

function normalizeScholarship(scholarship) {
    const eligibility = scholarship.eligibility || {};

    return {
        ...scholarship,
        classes: Array.isArray(eligibility.classes)
            ? eligibility.classes
            : Array.isArray(scholarship.education)
                ? scholarship.education
                : [],
        categories: Array.isArray(eligibility.categories)
            ? eligibility.categories
            : Array.isArray(scholarship.category)
                ? scholarship.category
                : [],
        minMarks:
            typeof eligibility.minMarks === 'number'
                ? eligibility.minMarks
                : typeof scholarship.percentage === 'number'
                    ? scholarship.percentage
                    : 0,
        maxIncome:
            typeof eligibility.maxIncome === 'number'
                ? eligibility.maxIncome
                : parseIncomeMax(scholarship.income),
        fields: Array.isArray(scholarship.field) ? scholarship.field : [],
        gender: Array.isArray(eligibility.gender) ? eligibility.gender : []
    };
}

function scoreScholarship(userData, scholarship) {
    const s = normalizeScholarship(scholarship);
    let score = 0;
    const reasons = [];

    // Hard filters
    if (s.classes.length && !s.classes.includes(userData.education)) {
        return null;
    }

    if (typeof userData.percentage === 'number' && userData.percentage < s.minMarks) {
        return null;
    }

    const userIncomeMax = parseIncomeMax(userData.income);
    if (userIncomeMax > s.maxIncome) {
        return null;
    }

    // Education
    if (s.classes.includes(userData.education)) {
        score += 30;
        reasons.push("education match");
    }

    // Field
    if (s.fields.includes(userData.field)) {
        score += 25;
        reasons.push("field exact match");
    } else if (s.fields.includes("all")) {
        score += 12;
        reasons.push("field open to all");
    } else if (s.fields.includes("other")) {
        score += 8;
        reasons.push("field broad match");
    }

    // Category
    if (s.categories.includes(userData.category)) {
        score += 20;
        reasons.push("category match");
    } else if (s.categories.includes("all")) {
        score += 8;
        reasons.push("category open");
    } else if (s.categories.includes("other")) {
        score += 5;
        reasons.push("category broad");
    }

    // Marks fit
    const marksGap = userData.percentage - s.minMarks;
    if (marksGap >= 20) {
        score += 15;
        reasons.push("strong academic fit");
    } else if (marksGap >= 10) {
        score += 10;
        reasons.push("good academic fit");
    } else {
        score += 5;
        reasons.push("eligible marks");
    }

    // Income fit
    const incomeGap = s.maxIncome - userIncomeMax;
    if (incomeGap >= 500000) {
        score += 10;
        reasons.push("comfortably within income limit");
    } else if (incomeGap >= 200000) {
        score += 7;
        reasons.push("within income limit");
    } else {
        score += 4;
        reasons.push("income just fits");
    }

    // Status bonus
    if (s.status === "Open") {
        score += 8;
    } else if (s.status === "Soon") {
        score += 3;
    }

    return {
        ...scholarship,
        normalized: s,
        matchScore: score,
        matchReasons: reasons
    };
}

function filterScholarshipsByProfile(userData) {
    return getScholarshipsData()
        .map((scholarship) => scoreScholarship(userData, scholarship))
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);
}

// Display Form Match Results
function displayResults(matchedScholarships) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');

    if (!resultsSection || !resultsContainer) return;

    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';

    if (!matchedScholarships.length) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3 style="font-size: 1.5rem; color: var(--gray); margin-bottom: 1rem;">
                    No matching scholarships found
                </h3>
                <p style="color: var(--gray);">
                    Try adjusting your criteria or check back later for new opportunities.
                </p>
            </div>
        `;
        return;
    }

    matchedScholarships.slice(0, 8).forEach((scholarship, index) => {
        const card = createScholarshipCard(scholarship, index);
        resultsContainer.appendChild(card);
    });
}

function getDisplayChips(scholarship) {
    const normalized = scholarship.normalized || normalizeScholarship(scholarship);

    return {
        minMarks: normalized.minMarks || 0,
        education: normalized.classes.join(', '),
        field: normalized.fields.join(', ')
    };
}

function getProfessionalReasons(reasons = []) {
    return reasons
        .slice(0, 3)
        .map(reason => MATCH_REASON_LABELS[reason] || reason);
}

// Create Scholarship Card
function createScholarshipCard(scholarship, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const statusClass =
        scholarship.status === 'Open'
            ? 'status-open'
            : scholarship.status === 'Closed'
                ? 'status-closed'
                : 'status-soon';

    const chips = getDisplayChips(scholarship);
    const reasons = getProfessionalReasons(scholarship.matchReasons);

    card.innerHTML = `
        <div class="result-card-header">
            <div>
                <h3 class="result-card-title">${scholarship.name}</h3>
                <div class="result-card-meta">
                    <span>💰 ${scholarship.amount}</span>
                    <span>📅 ${formatDate(scholarship.deadline)}</span>
                </div>
            </div>
            <span class="status-badge ${statusClass}">${scholarship.status}</span>
        </div>

        <p class="result-card-description">${scholarship.description}</p>

        <div class="eligibility-list">
            <span class="eligibility-tag">Minimum ${chips.minMarks}%</span>
            ${chips.education ? `<span class="eligibility-tag">${chips.education}</span>` : ''}
            ${chips.field ? `<span class="eligibility-tag">${chips.field}</span>` : ''}
        </div>

        ${typeof scholarship.matchScore === 'number' ? `
            <div class="eligibility-list" style="margin-top: 0.75rem;">
                <span class="eligibility-tag">Match score: ${scholarship.matchScore}</span>
            </div>
        ` : ''}

        ${reasons.length ? `
            <div style="margin-top: 1rem;">
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--dark); margin-bottom: 0.5rem;">
                    Why this matches you
                </p>
                <ul style="padding-left: 1.1rem; margin: 0; color: var(--gray); line-height: 1.6;">
                    ${reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <button class="view-details-btn" onclick="showScholarshipDetails(${scholarship.id})">
            View Details & Documents
        </button>
    `;

    return card;
}

// Show Scholarship Details Modal
function showScholarshipDetails(scholarshipId) {
    const scholarship = getScholarshipsData().find(s => s.id === scholarshipId);
    if (!scholarship) return;

    const normalized = normalizeScholarship(scholarship);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
        animation: fadeIn 0.3s ease-out;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 1.5rem;
        padding: 3rem;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: fadeInScale 0.3s ease-out;
    `;

    const statusClass =
        scholarship.status === 'Open'
            ? 'status-open'
            : scholarship.status === 'Closed'
                ? 'status-closed'
                : 'status-soon';

    const incomeText = Number.isFinite(normalized.maxIncome)
        ? `Up to ₹${normalized.maxIncome.toLocaleString('en-IN')}`
        : 'No upper income limit';

    modalContent.innerHTML = `
        <button onclick="this.closest('.modal-overlay').remove()" 
                style="position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--gray);">
            ×
        </button>

        <h2 style="font-size: 2rem; font-weight: 700; color: var(--dark); margin-bottom: 1rem; font-family: var(--font-poppins);">
            ${scholarship.name}
        </h2>

        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <span class="status-badge ${statusClass}">${scholarship.status}</span>
            <span style="padding: 0.5rem 1rem; background: rgba(77, 150, 255, 0.1); border-radius: 9999px; font-weight: 600; color: var(--blue);">
                ${scholarship.amount}
            </span>
            <span style="padding: 0.5rem 1rem; background: rgba(255, 107, 107, 0.1); border-radius: 9999px; font-weight: 600; color: var(--coral);">
                Due: ${formatDate(scholarship.deadline)}
            </span>
        </div>

        <p style="color: var(--gray); line-height: 1.8; margin-bottom: 2rem;">
            ${scholarship.description}
        </p>

        <div style="background: var(--light-gray); padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--dark); margin-bottom: 1rem;">
                Eligibility Criteria
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding-left: 0;">
                <li><strong>Minimum marks:</strong> ${normalized.minMarks}%</li>
                <li><strong>Education:</strong> ${normalized.classes.join(', ') || 'Not specified'}</li>
                <li><strong>Field:</strong> ${normalized.fields.join(', ') || 'Not specified'}</li>
                <li><strong>Category:</strong> ${normalized.categories.join(', ') || 'Not specified'}</li>
                <li><strong>Income:</strong> ${incomeText}</li>
            </ul>
        </div>

        <div style="background: rgba(77, 150, 255, 0.1); padding: 1.5rem; border-radius: 1rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--dark); margin-bottom: 1rem;">
                Required Documents
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding-left: 0;">
                ${(scholarship.documents || []).map(doc => `
                    <li style="display: flex; align-items: start; gap: 0.5rem;">
                        <span style="color: var(--blue); font-weight: 700; margin-top: 0.25rem;">•</span>
                        <span>${doc}</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        <button onclick="applyForScholarship(${scholarship.id})" 
                style="width: 100%; margin-top: 2rem; padding: 1rem; background: linear-gradient(135deg, var(--coral), var(--blue)); color: white; border: none; border-radius: 0.75rem; font-weight: 600; font-size: 1.125rem; cursor: pointer; transition: all 0.3s ease;">
            Apply Now
        </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Apply for Scholarship
function applyForScholarship(scholarshipId) {
    const scholarship = getScholarshipsData().find(s => s.id === scholarshipId);

    if (scholarship && scholarship.link) {
        window.open(scholarship.link, '_blank');
    } else {
        alert("Application link not available.");
    }
}
function getFilteredScholarships() {
    let filtered = getScholarshipsData();

    if (activeScholarshipGroup !== 'all') {
        filtered = filtered.filter(s =>
            s.group && String(s.group).toLowerCase().includes(activeScholarshipGroup.toLowerCase())
        );
    }

    if (scholarshipSearchTerm.trim()) {
        filtered = filtered.filter(s =>
            s.name && s.name.toLowerCase().includes(scholarshipSearchTerm.toLowerCase())
        );
    }

    return filtered;
}

function handleScholarshipSearch() {
    const searchInput = document.getElementById('scholarship-search');
    scholarshipSearchTerm = searchInput ? searchInput.value.trim() : '';
    displayScholarships(getFilteredScholarships());
}

// Scholarships Page - Default Load
function displayAllScholarships() {
    displayScholarships(getFilteredScholarships());
}

// Scholarships Page - Button Filter
function filterScholarshipsByGroup(type, btn) {
    activeScholarshipGroup = type;

    const buttons = document.querySelectorAll('.filter-buttons button');
    buttons.forEach(button => button.classList.remove('active'));

    if (btn) {
        btn.classList.add('active');
    }

    displayScholarships(getFilteredScholarships());
}

// Scholarships Page - Render Cards
function displayScholarships(data) {
    const container = document.getElementById('all-scholarships-container');
    if (!container) return;

    container.innerHTML = '';

if (!data || data.length === 0) {
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--dark);">
                No scholarships found
            </h3>
            <p style="color: var(--gray);">
                Try searching with a different scholarship name or change the filter.
            </p>
        </div>
    `;
    return;
}
    data.forEach((scholarship, index) => {
        const card = createScholarshipCard(scholarship, index);
        container.appendChild(card);
    });
}

// Contact Form Submit
function handleContactSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    fetch('http://localhost:5000/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(() => {
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.style.display = 'block';
            }
            event.target.reset();
        })
        .catch(err => {
            alert("Error sending message");
            console.log(err);
        });
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Animate on Scroll
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.feature-card, .step-item, .testimonial-card, .why-partner-card');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});
