// Login functionality for Urban AirWatch Platform

/**
 * Handle NGO login form submission
 */
function handleNGOLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orgName = formData.get('org-name');
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    console.log('NGO Login Attempt:', {
        orgName,
        email,
        remember: !!remember
    });
    
    // Simulate login process
    showLoadingState(event.target);
    
    setTimeout(() => {
        // In a real application, this would make an API call
        // For demo purposes, we'll just redirect
        window.location.href = `ngo.html?org=${encodeURIComponent(orgName)}`;
    }, 1500);
    
    return false;
}

/**
 * Handle Report form submission
 */
function handleReport(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const location = formData.get('location');
    const complaint = formData.get('complaint');

    console.log('Submitting report:', { name, email, location, complaint });

    showLoadingState(event.target);

    // Create report object
    const newReport = {
        name: name,
        email: email,
        location: location,
        complaint: complaint,
        timestamp: new Date().toISOString()
    };

    // ✅ Save to localStorage
    try {
        const existingReports = JSON.parse(localStorage.getItem('reports')) || [];
        existingReports.push(newReport);
        localStorage.setItem('reports', JSON.stringify(existingReports));
        console.log('Report saved to localStorage successfully');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('❌ Error saving report locally. Please try again.');
        resetLoadingState(event.target);
        return;
    }

    // ✅ Send data to webhook
    fetch('https://hook.eu2.make.com/0p3sjmnhwlqk3wfqd7g771q48yfo3qtt', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReport)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(() => {
        console.log('Report submitted successfully to webhook');
        alert('✅ Thank you for your report!\n\nYour submission was successful and has been forwarded to local NGOs.');
        // Redirect to NGO dashboard
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Error submitting report to webhook:', error);
        // Still redirect since we saved locally
        alert('⚠️ Report saved locally, but there was an issue with online submission.\n\nYour report will still be visible to NGOs.');
        window.location.href = 'index.html';
    });
}

/**
 * Handle Government login form submission
 */
function handleGovtLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const deptName = formData.get('dept-name');
    const govtId = formData.get('govt-id');
    const email = formData.get('govt-email');
    const password = formData.get('govt-password');
    const remember = formData.get('remember');
    
    console.log('Government Login Attempt:', {
        department: deptName,
        officialId: govtId,
        email,
        remember: !!remember
    });
    
    // Simulate login process
    showLoadingState(event.target);
    
    setTimeout(() => {
        // In a real application, this would make an API call
        // For demo purposes, we'll just redirect
        const deptNames = {
            'cpcb': 'Central Pollution Control Board',
            'spcb': 'State Pollution Control Board',
            'moef': 'Ministry of Environment',
            'niti': 'NITI Aayog',
            'ncap': 'National Clean Air Programme'
        };
        window.location.href = 'gov.html';
    }, 1500);
    
    return false;
}

/**
 * Show loading state on form submission
 */
function showLoadingState(form) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Store original HTML for potential error handling
        button.dataset.originalHtml = originalHTML;
    }
}

/**
 * Reset form loading state
 */
function resetLoadingState(form) {
    const button = form.querySelector('button[type="submit"]');
    if (button && button.dataset.originalHtml) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalHtml;
    }
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate government email domain
 */
function validateGovtEmail(email) {
    const govtDomains = ['.gov.in', '.nic.in', '.gov'];
    return govtDomains.some(domain => email.toLowerCase().endsWith(domain));
}

/**
 * Handle forgot password
 */
function handleForgotPassword(event, type) {
    event.preventDefault();
    alert(`Password reset link will be sent to your registered ${type} email address.`);
}