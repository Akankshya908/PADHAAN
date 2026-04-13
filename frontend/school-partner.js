// School Partnership Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const partnershipForm = document.getElementById('partnershipForm');
    
    if (partnershipForm) {
        partnershipForm.addEventListener('submit', handlePartnershipSubmit);
        
        // Add real-time validation
        addFormValidation(partnershipForm);
    }
});

// Handle Partnership Form Submission
function handlePartnershipSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validatePartnershipForm(event.target)) {
        return;
    }
    
    const formData = new FormData(event.target);
    const data = {
        schoolName: formData.get('schoolName'),
        schoolType: formData.get('schoolType'),
        affiliation: formData.get('affiliation'),
        studentCount: formData.get('studentCount'),
        schoolAddress: formData.get('schoolAddress'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        schoolWebsite: formData.get('schoolWebsite'),
        contactName: formData.get('contactName'),
        designation: formData.get('designation'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        altPhone: formData.get('altPhone'),
        preferredTime: formData.get('preferredTime'),
        partnershipReason: formData.get('partnershipReason'),
        specialRequirements: formData.get('specialRequirements'),
        consent: formData.get('consent')
    };
    
    // Show loading state
    const submitBtn = document.getElementById('submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Submitting...</span>';
    
    // Simulate form submission
    setTimeout(() => {
        // Log data (in real app, this would be sent to server)
        console.log('Partnership Request Data:', data);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        event.target.reset();
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        
        // Scroll to success message
        document.getElementById('partner-success-message').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Hide success message after 10 seconds
        setTimeout(() => {
            hideSuccessMessage();
        }, 10000);
        
    }, 2000);
}

// Validate Partnership Form
function validatePartnershipForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showFieldError(field, 'This field is required');
        } else {
            clearFieldError(field);
        }
    });
    
    // Validate pincode
    const pincode = form.querySelector('#pincode');
    if (pincode && pincode.value) {
        if (!/^[0-9]{6}$/.test(pincode.value)) {
            isValid = false;
            showFieldError(pincode, 'Please enter a valid 6-digit pincode');
        }
    }
    
    // Validate email
    const email = form.querySelector('#contact-email');
    if (email && email.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            isValid = false;
            showFieldError(email, 'Please enter a valid email address');
        }
    }
    
    // Validate phone
    const phone = form.querySelector('#contact-phone');
    if (phone && phone.value) {
        if (!/^[0-9+\s-]{10,15}$/.test(phone.value)) {
            isValid = false;
            showFieldError(phone, 'Please enter a valid phone number');
        }
    }
    
    // Validate student count
    const studentCount = form.querySelector('#student-count');
    if (studentCount && studentCount.value) {
        if (parseInt(studentCount.value) < 1) {
            isValid = false;
            showFieldError(studentCount, 'Student count must be at least 1');
        }
    }
    
    // Validate consent checkbox
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
        isValid = false;
        alert('Please agree to the terms and conditions before submitting');
    }
    
    return isValid;
}

// Show Field Error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#FF6B6B';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #FF6B6B;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: fadeInUp 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}

// Clear Field Error
function clearFieldError(field) {
    field.style.borderColor = '';
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Add Form Validation (Real-time)
function addFormValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                showFieldError(this, 'This field is required');
            } else {
                clearFieldError(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError(this);
            }
        });
    });
    
    // Pincode validation
    const pincode = form.querySelector('#pincode');
    if (pincode) {
        pincode.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 6);
        });
        
        pincode.addEventListener('blur', function() {
            if (this.value && !/^[0-9]{6}$/.test(this.value)) {
                showFieldError(this, 'Please enter a valid 6-digit pincode');
            }
        });
    }
    
    // Email validation
    const email = form.querySelector('#contact-email');
    if (email) {
        email.addEventListener('blur', function() {
            if (this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                showFieldError(this, 'Please enter a valid email address');
            }
        });
    }
    
    // Phone validation
    const phone = form.querySelector('#contact-phone');
    if (phone) {
        phone.addEventListener('blur', function() {
            if (this.value && !/^[0-9+\s-]{10,15}$/.test(this.value)) {
                showFieldError(this, 'Please enter a valid phone number');
            }
        });
    }
}

// Show Success Message
function showSuccessMessage() {
    const successMessage = document.getElementById('partner-success-message');
    if (successMessage) {
        successMessage.style.display = 'flex';
    }
}

// Hide Success Message
function hideSuccessMessage() {
    const successMessage = document.getElementById('partner-success-message');
    if (successMessage) {
        successMessage.style.display = 'none';
    }
}

// Auto-capitalize school name
document.addEventListener('DOMContentLoaded', function() {
    const schoolNameInput = document.getElementById('school-name');
    if (schoolNameInput) {
        schoolNameInput.addEventListener('input', function() {
            // Capitalize first letter of each word
            this.value = this.value.replace(/\b\w/g, char => char.toUpperCase());
        });
    }
    
    const contactNameInput = document.getElementById('contact-name');
    if (contactNameInput) {
        contactNameInput.addEventListener('input', function() {
            // Capitalize first letter of each word
            this.value = this.value.replace(/\b\w/g, char => char.toUpperCase());
        });
    }
    
    // Format phone numbers
    const phoneInputs = document.querySelectorAll('#contact-phone, #alt-phone');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove any non-digit, non-plus, non-hyphen, non-space characters
            this.value = this.value.replace(/[^0-9+\s-]/g, '');
        });
    });
});

// Prevent form submission on Enter key (except in textarea)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnershipForm');
    if (form) {
        form.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
                event.preventDefault();
                return false;
            }
        });
    }
});

// Character counter for textareas
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('.form-textarea');
    
    textareas.forEach(textarea => {
        const maxLength = 500;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--gray);
            margin-top: 0.25rem;
        `;
        counter.textContent = `0 / ${maxLength} characters`;
        
        textarea.parentElement.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length} / ${maxLength} characters`;
            
            if (length > maxLength) {
                counter.style.color = '#FF6B6B';
            } else if (length > maxLength * 0.9) {
                counter.style.color = '#FFA500';
            } else {
                counter.style.color = 'var(--gray)';
            }
        });
    });
});
