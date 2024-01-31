// Attend que le document HTML soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // Récupère l'élément du formulaire de connexion
    const loginForm = document.getElementById('loginForm');

    // Récupère l'élément pour afficher les messages d'erreur
    const errorMessageDiv = document.getElementById('error-message');

    // Ajoute un écouteur d'événements pour le soumission du formulaire
    loginForm.addEventListener('submit', async function (event) {

        // Empêche le comportement par défaut du formulaire qui rechargerait la page
        event.preventDefault();

        // Récupère les valeurs des champs email et password
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Effectue une requête POST vers le serveur pour vérifier les informations de connexion
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Si la réponse n'est pas OK (statut 200), affiche le message d'erreur
        if (!response.ok) {
            const result = await response.json();
            errorMessageDiv.textContent = result.error;
        } else {

            // Si la connexion réussit, redirige l'utilisateur vers la page du quiz
            window.location.href = '/quizz';
        }
    });
});
