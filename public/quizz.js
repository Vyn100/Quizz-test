let currentScore = 0;               // Variable pour stocker le score actuel
let currentQuestionIndex = 0;       // Variable pour suivre l'indice de la question actuelle
let questions = [];                 // Tableau pour stocker les questions
let userId;                         // Variable pour stocker l'ID de l'utilisateur

// Fonction asynchrone pour obtenir l'ID de l'utilisateur
async function getUserId() {
    try {
        // Effectue une requête à l'API pour obtenir l'ID de l'utilisateur
        const response = await fetch('/api/get-user-id');

        // Convertit la réponse en format JSON
        const data = await response.json();

        // Récupère l'ID de l'utilisateur à partir des données JSON
        userId = data.userId;
    } catch (error) {

        // En cas d'erreur, affiche un message d'erreur dans la console
        console.error('Erreur lors de la récupération de l’ID de l’utilisateur:', error);
    }
}

// Fonction asynchrone pour charger les questions
async function loadQuestions() {

    // Effectue une requête à l'API pour obtenir la liste des questions
    const response = await fetch('/api/questions');

    // Convertit la réponse en format JSON
    questions = await response.json();

    // Affiche la question actuelle en utilisant la fonction displayQuestion
    displayQuestion(questions[currentQuestionIndex]);
}

// Fonction pour afficher une question
function displayQuestion(question) {

    // Vérifie si la question existe
    if (!question) return;

    // Récupère les éléments HTML pour la question et les réponses
    const questionDiv = document.getElementById('question');
    const reponseUl = document.getElementById('reponse');

    // Efface le contenu précédent des réponses
    reponseUl.innerHTML = '';

    // Affiche le texte de la question dans la div dédiée
    questionDiv.textContent = question.question;

    // Crée un tableau contenant toutes les réponses possibles
    const reponses = [question.reponse_correcte, question.fausse_reponse_un, question.fausse_reponse_deux, question.fausse_reponse_trois];

    // Mélange l'ordre des réponses pour les afficher de manière aléatoire
    shuffleArray(reponses);

    // Parcourt toutes les réponses et les ajoute en tant qu'éléments de liste à la liste des réponses
    reponses.forEach(reponse => {
        const li = document.createElement('li');
        li.textContent = reponse;

        // Ajoute un écouteur d'événements pour vérifier la réponse lorsque l'utilisateur clique sur une réponse
        li.addEventListener('click', () => checkAnswer(reponse, question.reponse_correcte));
        reponseUl.appendChild(li);
    });
}

// Fonction pour mélanger un tableau aléatoirement
function shuffleArray(array) {
    // Parcourt le tableau en partant de la fin (de la dernière à la première position)
    for (let i = array.length - 1; i > 0; i--) {
        // Génère un indice aléatoire entre 0 et i inclus
        const j = Math.floor(Math.random() * (i + 1));

        // Échange les éléments d'indice i et j dans le tableau
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fonction asynchrone pour vérifier la réponse sélectionnée
async function checkAnswer(selectedAnswer, correctAnswer) {

    // Si la réponse sélectionnée est correcte
    if (selectedAnswer === correctAnswer) {

        // Incrémente le score actuel
        currentScore++;

        // Affiche le score mis à jour à l'utilisateur
        displayUserScore();

        // Passe à la question suivante en incrémentant l'index de la question actuelle
        currentQuestionIndex++;

        // Si l'index de la question actuelle est inférieur au nombre total de questions
        if (currentQuestionIndex < questions.length) {

            // Affiche la question suivante
            displayQuestion(questions[currentQuestionIndex]);
        } else {

            // Si toutes les questions ont été répondues, envoie le score et met à jour puis réinitialise le quizz
            await sendScoreAndUpdate();
            resetQuiz();
        }
    } else {
        // Si la réponse sélectionnée est incorrecte, envoie le score et réinitialise le quiz
        await sendScoreAndUpdate();
        resetQuiz();
    }
}

// Fonction asynchrone pour envoyer le score et mettre à jour
async function sendScoreAndUpdate() {
    try {

                                             // Effectue une requête POST à l'API pour mettre à jour le score
        const response = await fetch('/api/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            // Envoie les données JSON contenant l'ID de l'utilisateur et le score actuel
            body: JSON.stringify({ userId, score: currentScore })
        });

        // Vérifie si la réponse de la requête est OK
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du score');
        }

        // Met à jour l'affichage du score après la mise à jour sur le serveur
        displayUserScore();
    } catch (error) {

        // En cas d'erreur, affiche un message d'erreur dans la console
        console.error('Erreur lors de l’envoi du score:', error);
    }
}

// Fonction pour réinitialiser le quiz
function resetQuiz() {

    // Réinitialise l'index de la question actuelle à zéro
    currentQuestionIndex = 0;

    // Réinitialise le score actuel à zéro
    currentScore = 0;

    // Affiche la première question du quizz
    displayQuestion(questions[currentQuestionIndex]);
}

// Fonction asynchrone pour afficher le score de l'utilisateur
async function displayUserScore() {
    try {

        // Effectue une requête à l'API pour obtenir le score de l'utilisateur
        const response = await fetch('/api/get-user-score');

        // Vérifie si la réponse de la requête est OK
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du score');
        }

        // Convertit la réponse en format JSON
        const data = await response.json();

        // Récupère l'élément HTML où afficher le score de l'utilisateur
        const scoreDiv = document.getElementById('user-score');

        // Affiche le score de l'utilisateur dans l'élément HTML
        scoreDiv.textContent = `Votre meilleur score est : ${data.score}`;
    } catch (error) {

        // En cas d'erreur, affiche un message d'erreur dans la console
        console.error('Erreur lors de l’affichage du score:', error);
    }
}

// Attend que le document HTML soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // Charge les questions du quiz
    loadQuestions();

    // Obtient l'ID de l'utilisateur
    getUserId();

    // Affiche le score de l'utilisateur
    displayUserScore();
});
