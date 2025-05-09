document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });

    if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData)); 
        window.location.href = '/index'; // Go to the correct page for now to home
    } else {
        alert('Login failed - ' + (await response.text()));
    }
});