// Scholarship Detail Page JavaScript

async function loadScholarshipDetail() {
    if (window.scholarshipsReady) await window.scholarshipsReady;
    // Get scholarship ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const scholarshipId = urlParams.get('id');
    
    const detailContainer = document.getElementById('scholarship-detail');
    
    if (!scholarshipId) {
        detailContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 class="no-results-title">Scholarship Not Found</h3>
                <p class="no-results-text">The scholarship you're looking for doesn't exist.</p>
                <a href="scholarships.html" class="btn-primary">Browse Scholarships</a>
            </div>
        `;
        return;
    }
    
    const scholarship = getScholarshipById(scholarshipId);
    
    if (!scholarship) {
        detailContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 class="no-results-title">Scholarship Not Found</h3>
                <p class="no-results-text">The scholarship you're looking for doesn't exist.</p>
                <a href="scholarships.html" class="btn-primary">Browse Scholarships</a>
            </div>
        `;
        return;
    }

    const eligibility = scholarship.eligibility || {};
    const documents = Array.isArray(scholarship.documents) ? scholarship.documents : [];
    const benefits = Array.isArray(scholarship.benefits) ? scholarship.benefits : [];
    let officialLink = '';
    try {
        const parsedLink = new URL(scholarship.link);
        if (parsedLink.protocol === 'https:' || parsedLink.protocol === 'http:') officialLink = parsedLink.href;
    } catch (_) {
        officialLink = '';
    }
    
    // Update page title
    document.title = `${scholarship.name} - Padhaan`;
    
    // Get status class
    const statusClass = 
        scholarship.status === 'Open' ? 'status-open' : 
        scholarship.status === 'Closed' ? 'status-closed' : 
        'status-soon';
    
    // Build the detail page
    const html = `
        <div class="detail-card">
            <div class="detail-header">
                <h1 class="detail-title">${scholarship.name}</h1>
                <div class="detail-meta">
                    <div class="meta-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <strong>${scholarship.amount}</strong>
                    </div>
                    <div class="meta-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Deadline: ${formatDate(scholarship.deadline)}</span>
                    </div>
                    <span class="detail-status ${statusClass}">${scholarship.status}</span>
                </div>
            </div>
            
            <p class="detail-description">${scholarship.description}</p>
            
            <h3 class="detail-section-title">Eligibility Criteria</h3>
            <div class="eligibility-grid">
                <div class="eligibility-item">
                    <div class="eligibility-label">Minimum Marks</div>
                    <div class="eligibility-value">${eligibility.minMarks ?? 'Not specified'}${eligibility.minMarks !== undefined ? '%' : ''}</div>
                </div>
                <div class="eligibility-item">
                    <div class="eligibility-label">Maximum Family Income</div>
                    <div class="eligibility-value">${eligibility.maxIncome !== undefined ? `₹${Number(eligibility.maxIncome).toLocaleString('en-IN')}` : 'Not specified'}</div>
                </div>
                <div class="eligibility-item">
                    <div class="eligibility-label">Eligible Categories</div>
                    <div class="eligibility-value">${(eligibility.categories || []).join(', ') || 'All categories'}</div>
                </div>
                <div class="eligibility-item">
                    <div class="eligibility-label">Gender</div>
                    <div class="eligibility-value">${(eligibility.gender || []).join(', ') || 'All genders'}</div>
                </div>
                <div class="eligibility-item">
                    <div class="eligibility-label">States</div>
                    <div class="eligibility-value">${(eligibility.states || []).join(', ') || 'All India'}</div>
                </div>
                <div class="eligibility-item">
                    <div class="eligibility-label">Class/Course</div>
                    <div class="eligibility-value">${(eligibility.classes || []).join(', ') || 'Not specified'}</div>
                </div>
            </div>
            
            <h3 class="detail-section-title">Required Documents</h3>
            <ul class="documents-list">
                ${documents.map(doc => `
                    <li>
                        <div class="doc-icon"></div>
                        <span>${doc}</span>
                    </li>
                `).join('')}
            </ul>
            
            <h3 class="detail-section-title">Benefits</h3>
            <ul class="benefits-list">
                ${benefits.map(benefit => `
                    <li>
                        <div class="check-icon"></div>
                        <span>${benefit}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        ${scholarship.status === 'Open' ? `
            <div class="apply-section">
                <h2 class="apply-title">Ready to Apply?</h2>
                <p class="apply-text">
                    Make sure you have all the required documents ready before starting your application.
                </p>
                ${officialLink
                    ? `<a href="${officialLink}" target="_blank" rel="noopener noreferrer" class="apply-btn">Apply on the official website</a>`
                    : `<button onclick="alert('Application details are not available yet. Please check back soon.')" class="apply-btn">Application details coming soon</button>`}
            </div>
        ` : ''}
    `;
    
    detailContainer.innerHTML = html;
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadScholarshipDetail();
});
