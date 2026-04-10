// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileMenu.classList.remove('active');
            }
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Scholarship Form Handler
    const scholarshipForm = document.getElementById('scholarshipForm');
    if (scholarshipForm) {
        scholarshipForm.addEventListener('submit', handleScholarshipSubmit);
    }
    
    // Load all scholarships on scholarships page
    const allScholarshipsContainer = document.getElementById('all-scholarships-container');
    if (allScholarshipsContainer) {
        displayAllScholarships();
    }
    
    // Animate elements on scroll
    animateOnScroll();
});

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
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Finding matches...</span>';
    
    // Simulate processing
    setTimeout(() => {
        // Filter scholarships based on criteria
        const matchedScholarships = filterScholarships(data);
        
        // Display results
        displayResults(matchedScholarships);
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        
        // Scroll to results
        document.getElementById('results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 1500);
}

// Filter Scholarships Based on User Profile
function filterScholarships(userData) {
    return scholarships.filter(scholarship => {
        // Check education level
        if (!scholarship.education.includes(userData.education)) {
            return false;
        }
        
        // Check field of study
        if (!scholarship.field.includes(userData.field)) {
            return false;
        }
        
        // Check percentage
        if (userData.percentage < scholarship.percentage) {
            return false;
        }
        
        // Check category
        if (!scholarship.category.includes(userData.category)) {
            return false;
        }
        
        // Check income (basic matching)
        const userIncomeRange = userData.income;
        if (scholarship.income !== "0-1000000+" && scholarship.income !== userIncomeRange) {
            // More flexible income matching
            const userMax = parseInt(userIncomeRange.split('-')[1] || '10000000');
            const scholarshipMax = parseInt(scholarship.income.split('-')[1] || '10000000');
            if (userMax > scholarshipMax) {
                return false;
            }
        }
        
        return true;
    });
}

// Display Results
function displayResults(matchedScholarships) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    if (matchedScholarships.length === 0) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3 style="font-size: 1.5rem; color: var(--gray); margin-bottom: 1rem;">
                    No matching scholarships found
                </h3>
                <p style="color: var(--gray);">
                    Try adjusting your criteria or check back later for new opportunities
                </p>
            </div>
        `;
        return;
    }
    
    matchedScholarships.forEach((scholarship, index) => {
        const card = createScholarshipCard(scholarship, index);
        resultsContainer.appendChild(card);
    });
}

// Create Scholarship Card
function createScholarshipCard(scholarship, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = scholarship.status === 'Open' ? 'status-open' : 
                       scholarship.status === 'Closed' ? 'status-closed' : 'status-soon';
    
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
            <span class="eligibility-tag">Min ${scholarship.percentage}%</span>
            <span class="eligibility-tag">${scholarship.education.join(', ')}</span>
            <span class="eligibility-tag">${scholarship.field.join(', ')}</span>
        </div>
        
        <button class="view-details-btn" onclick="showScholarshipDetails(${scholarship.id})">
            View Details & Documents
        </button>
    `;
    
    return card;
}

// Show Scholarship Details
function showScholarshipDetails(scholarshipId) {
    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (!scholarship) return;
    
    // Create modal overlay
    const modal = document.createElement('div');
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
    
    const statusClass = scholarship.status === 'Open' ? 'status-open' : 
                       scholarship.status === 'Closed' ? 'status-closed' : 'status-soon';
    
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
                📋 Eligibility Criteria
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--green); font-weight: 700;">✓</span>
                    <span>Minimum ${scholarship.percentage}% marks</span>
                </li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--green); font-weight: 700;">✓</span>
                    <span>Education: ${scholarship.education.join(', ')}</span>
                </li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--green); font-weight: 700;">✓</span>
                    <span>Field: ${scholarship.field.join(', ')}</span>
                </li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--green); font-weight: 700;">✓</span>
                    <span>Category: ${scholarship.category.join(', ').toUpperCase()}</span>
                </li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--green); font-weight: 700;">✓</span>
                    <span>Income: ${scholarship.income}</span>
                </li>
            </ul>
        </div>
        
        <div style="background: rgba(77, 150, 255, 0.1); padding: 1.5rem; border-radius: 1rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--dark); margin-bottom: 1rem;">
                📄 Required Documents
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                ${scholarship.documents.map(doc => `
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
    
    modal.className = 'modal-overlay';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Apply for Scholarship
function applyForScholarship(scholarshipId) {
    const scholarship = scholarships.find(s => s.id === scholarshipId);

    if (scholarship && scholarship.link) {
        window.open(scholarship.link, '_blank');
    } else {
        alert("Application link not available.");
    }
}
    // In a real application, this would redirect to the application form
    // window.open(scholarship.applicationUrl, '_blank');


// Display All Scholarships (for scholarships page)
function displayAllScholarships() {
    const container = document.getElementById('all-scholarships-container');
    if (!container) return;
    
    scholarships.forEach((scholarship, index) => {
        const card = createScholarshipCard(scholarship, index);
        container.appendChild(card);
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
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elements = document.querySelectorAll('.feature-card, .step-item, .testimonial-card, .why-partner-card');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Smooth scroll for anchor links
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
function filterScholarships(type, btn) {
    console.log("Clicked:", type);

    // Active button change
    const buttons = document.querySelectorAll('.filter-buttons button');
    buttons.forEach(button => button.classList.remove('active'));
    btn.classList.add('active');

    // Filtering (FIXED)
    const filtered = type === 'all'
        ? scholarships
        : scholarships.filter(s => s.group && s.group.includes(type));

    console.log(filtered);

    displayScholarships(filtered);
}
function displayScholarships(data) {
    const container = document.getElementById('all-scholarships-container');
    container.innerHTML = ''; // clear old data

    if (data.length === 0) {
        container.innerHTML = "<p>No scholarships found</p>";
        return;
    }

    data.forEach((scholarship, index) => {
        const card = createScholarshipCard(scholarship, index);
        container.appendChild(card);
    });
}
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
        document.getElementById('success-message').style.display = 'block';
        event.target.reset();
    })
    .catch(err => {
        alert("Error sending message");
        console.log(err);
    });
}