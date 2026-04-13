// Scholarships Page JavaScript

let currentFilters = {
    status: '',
    class: '',
    category: '',
    gender: ''
};

// Load and display all scholarships
function loadScholarships(filters = {}) {
    const grid = document.getElementById('scholarships-grid');
    if (!grid) return;
    
    let filteredScholarships = scholarships.filter(scholarship => {
        // Filter by status
        if (filters.status && scholarship.status !== filters.status) {
            return false;
        }
        
        // Filter by class
        if (filters.class && !scholarship.eligibility.classes.includes(filters.class)) {
            return false;
        }
        
        // Filter by category
        if (filters.category && !scholarship.eligibility.categories.includes(filters.category)) {
            return false;
        }
        
        // Filter by gender
        if (filters.gender && !scholarship.eligibility.gender.includes(filters.gender)) {
            return false;
        }
        
        return true;
    });
    
    if (filteredScholarships.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
                <h3 class="no-results-title">No Scholarships Found</h3>
                <p class="no-results-text">
                    Try adjusting your filters to see more scholarships.
                </p>
                <button onclick="resetFilters()" class="btn-primary">Reset Filters</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredScholarships.forEach(scholarship => {
        html += createScholarshipCardForList(scholarship);
    });
    
    grid.innerHTML = html;
}

// Create scholarship card for listing page
function createScholarshipCardForList(scholarship) {
    const statusClass = 
        scholarship.status === 'Open' ? 'status-open' : 
        scholarship.status === 'Closed' ? 'status-closed' : 
        'status-soon';
    
    const eligibilityTags = [
        `Min ${scholarship.eligibility.minMarks}% marks`,
        `Income ≤ ₹${(scholarship.eligibility.maxIncome / 100000).toFixed(1)}L`,
        scholarship.eligibility.categories.join(', '),
        scholarship.eligibility.classes.join(', ')
    ];
    
    return `
        <div class="result-card">
            <div class="result-card-header">
                <div>
                    <h4 class="result-card-title">${scholarship.name}</h4>
                    <div class="result-card-meta">
                        <span>💰 ${scholarship.amount}</span>
                        <span>📅 ${formatDate(scholarship.deadline)}</span>
                    </div>
                </div>
                <span class="status-badge ${statusClass}">${scholarship.status}</span>
            </div>
            <p class="result-card-description">${scholarship.description}</p>
            <div class="eligibility-list">
                ${eligibilityTags.map(tag => `<span class="eligibility-tag">${tag}</span>`).join('')}
            </div>
            <div class="result-card-footer">
                <div>
                    <strong>${scholarship.benefits.length}</strong> benefits • <strong>${scholarship.documents.length}</strong> documents required
                </div>
                <a href="scholarship-detail.html?id=${scholarship.id}" class="view-details-btn">View Details</a>
            </div>
        </div>
    `;
}

// Apply filters
function applyFilters() {
    currentFilters = {
        status: document.getElementById('filterStatus').value,
        class: document.getElementById('filterClass').value,
        category: document.getElementById('filterCategory').value,
        gender: document.getElementById('filterGender').value
    };
    
    loadScholarships(currentFilters);
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterClass').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterGender').value = '';
    
    currentFilters = {
        status: '',
        class: '',
        category: '',
        gender: ''
    };
    
    loadScholarships(currentFilters);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadScholarships();
});
