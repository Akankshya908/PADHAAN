// Scholarships Page JavaScript

let currentFilters = {
    status: '',
    class: '',
    category: '',
    gender: ''
};

// Load and display all scholarships on scholarships listing page
function loadScholarships(filters = {}) {
    const grid = document.getElementById('scholarships-grid');
    if (!grid || !Array.isArray(scholarships)) return;

    const filteredScholarships = scholarships.filter((scholarship) => {
        const eligibility = scholarship.eligibility || {};

        // Filter by status
        if (filters.status && scholarship.status !== filters.status) {
            return false;
        }

        // Filter by class
        if (
            filters.class &&
            (!Array.isArray(eligibility.classes) || !eligibility.classes.includes(filters.class))
        ) {
            return false;
        }

        // Filter by category
        if (
            filters.category &&
            (!Array.isArray(eligibility.categories) || !eligibility.categories.includes(filters.category))
        ) {
            return false;
        }

        // Filter by gender
        if (
            filters.gender &&
            Array.isArray(eligibility.gender) &&
            !eligibility.gender.includes(filters.gender)
        ) {
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
    filteredScholarships.forEach((scholarship) => {
        html += createScholarshipCardForList(scholarship);
    });

    grid.innerHTML = html;
}

// Matching function for scholarship form
function filterScholarships(userData) {
    if (!Array.isArray(scholarships)) return [];

    return scholarships.filter((scholarship) => {
        const eligibility = scholarship.eligibility || {};

        const scholarshipClasses = Array.isArray(eligibility.classes) ? eligibility.classes : [];
        const scholarshipCategories = Array.isArray(eligibility.categories) ? eligibility.categories : [];
        const scholarshipFields = Array.isArray(scholarship.field) ? scholarship.field : [];

        // Education
        if (userData.education && scholarshipClasses.length > 0) {
            if (!scholarshipClasses.includes(userData.education)) {
                return false;
            }
        }

        // Category
        if (userData.category && scholarshipCategories.length > 0) {
            if (!scholarshipCategories.includes(userData.category)) {
                return false;
            }
        }

        // Percentage
        if (
            typeof eligibility.minMarks === 'number' &&
            typeof userData.percentage === 'number' &&
            userData.percentage < eligibility.minMarks
        ) {
            return false;
        }

        // Income
        if (userData.income && typeof eligibility.maxIncome === 'number') {
            const incomeParts = String(userData.income).split('-');
            let userMaxIncome = 10000000;

            if (userData.income.includes('+')) {
                const baseValue = parseInt(userData.income.replace('+', ''), 10);
                userMaxIncome = isNaN(baseValue) ? 10000000 : baseValue;
            } else if (incomeParts.length > 1) {
                const parsedMax = parseInt(incomeParts[1], 10);
                userMaxIncome = isNaN(parsedMax) ? 10000000 : parsedMax;
            }

            if (userMaxIncome > eligibility.maxIncome) {
                return false;
            }
        }

        // Field
        if (userData.field && scholarshipFields.length > 0) {
            if (
                !scholarshipFields.includes(userData.field) &&
                !scholarshipFields.includes('all') &&
                !scholarshipFields.includes('other')
            ) {
                return false;
            }
        }

        return true;
    });
}

// Create scholarship card for listing page
function createScholarshipCardForList(scholarship) {
    const statusClass =
        scholarship.status === 'Open'
            ? 'status-open'
            : scholarship.status === 'Closed'
            ? 'status-closed'
            : 'status-soon';

    const eligibility = scholarship.eligibility || {};
    const minMarks = eligibility.minMarks ?? 'N/A';
    const maxIncome = eligibility.maxIncome ?? 0;
    const categories = Array.isArray(eligibility.categories) ? eligibility.categories.join(', ') : 'N/A';
    const classes = Array.isArray(eligibility.classes) ? eligibility.classes.join(', ') : 'N/A';

    const eligibilityTags = [
        `Min ${minMarks}% marks`,
        `Income ≤ ₹${(maxIncome / 100000).toFixed(1)}L`,
        categories,
        classes
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
                    <strong>${Array.isArray(scholarship.benefits) ? scholarship.benefits.length : 0}</strong> benefits
                    •
                    <strong>${Array.isArray(scholarship.documents) ? scholarship.documents.length : 0}</strong> documents required
                </div>
                <a href="scholarship-detail.html?id=${scholarship.id}" class="view-details-btn">View Details</a>
            </div>
        </div>
    `;
}

// Apply filters
function applyFilters() {
    currentFilters = {
        status: document.getElementById('filterStatus')?.value || '',
        class: document.getElementById('filterClass')?.value || '',
        category: document.getElementById('filterCategory')?.value || '',
        gender: document.getElementById('filterGender')?.value || ''
    };

    loadScholarships(currentFilters);
}

// Reset filters
function resetFilters() {
    const filterStatus = document.getElementById('filterStatus');
    const filterClass = document.getElementById('filterClass');
    const filterCategory = document.getElementById('filterCategory');
    const filterGender = document.getElementById('filterGender');

    if (filterStatus) filterStatus.value = '';
    if (filterClass) filterClass.value = '';
    if (filterCategory) filterCategory.value = '';
    if (filterGender) filterGender.value = '';

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

// Initialize listing page on load
document.addEventListener('DOMContentLoaded', () => {
    loadScholarships();
});