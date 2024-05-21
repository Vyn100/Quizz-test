document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('error-message');
    const adminLinkDiv = document.getElementById('admin-link');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const result = await response.json();
                errorMessageDiv.textContent = result.error;
            } else {
                const result = await response.json();
                if (result.isAdmin) {
                    adminLinkDiv.style.display = 'block';
                }
                window.location.href = '/quizz';
            }
        });
    }
});
