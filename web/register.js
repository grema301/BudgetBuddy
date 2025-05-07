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
    console.log(user);
    try {
        const response = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        console.log(response.headers.get('content-type'));
        const result = await response.json();
        
        console.log(result);
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