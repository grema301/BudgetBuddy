document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    const user = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };


    if (!user.firstName || !user.lastName || !user.email || !user.password) {
        return alert('All fields are required');
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } else {
            alert(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error - please try again');
    }
});