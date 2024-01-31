let currentScore = 0;
let currentQuestionIndex = 0;
let questions = [];
let userId;

async function getUserId() {
    try {
        const response = await fetch('/api/get-user-id');
        const data = await response.json();
        userId = data.userId;
    } catch (error) {
        console.error('Erreur lors de la récupération de l’ID de l’utilisateur:', error);
    }
}

async function loadQuestions() {
    const response = await fetch('/api/questions');
    questions = await response.json();
    displayQuestion(questions[currentQuestionIndex]);
}

function displayQuestion(question) {
    if (!question) return;
    const questionDiv = document.getElementById('question');
    const reponseUl = document.getElementById('reponse');
    reponseUl.innerHTML = '';

    questionDiv.textContent = question.question;

    const reponses = [question.reponse_correcte, question.fausse_reponse_un, question.fausse_reponse_deux, question.fausse_reponse_trois];
    shuffleArray(reponses);

    reponses.forEach(reponse => {
        const li = document.createElement('li');
        li.textContent = reponse;
        li.addEventListener('click', () => checkAnswer(reponse, question.reponse_correcte));
        reponseUl.appendChild(li);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function checkAnswer(selectedAnswer, correctAnswer) {
    if (selectedAnswer === correctAnswer) {
        currentScore++;
        displayUserScore();
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            await sendScoreAndUpdate();
            resetQuiz();
        }
    } else {
        await sendScoreAndUpdate();
        resetQuiz();
    }
}

async function sendScoreAndUpdate() {
    try {
        const response = await fetch('/api/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, score: currentScore })
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du score');
        }
        displayUserScore(); // Mettre à jour l'affichage du score après la mise à jour sur le serveur
    } catch (error) {
        console.error('Erreur lors de l’envoi du score:', error);
    }
}


function resetQuiz() {
    currentQuestionIndex = 0;
    currentScore = 0;
    displayQuestion(questions[currentQuestionIndex]);
}

async function displayUserScore() {
    try {
        const response = await fetch('/api/get-user-score');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du score');
        }
        const data = await response.json();
        const scoreDiv = document.getElementById('user-score');
        scoreDiv.textContent = `Votre meilleur score est : ${data.score}`;
    } catch (error) {
        console.error('Erreur lors de l’affichage du score:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    getUserId();
    displayUserScore();
});
