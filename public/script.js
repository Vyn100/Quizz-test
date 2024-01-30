document.addEventListener('DOMContentLoaded', () => {
    const questionContainer = document.getElementById('question');
    const reponseContainer = document.getElementById('reponse');
    const resultatContainer = document.getElementById('resultat');

    let currentQuestionIndex = 0; 
    let score = 0; 

    const questions = [
        {
            question: "Quelle est la capitale de la France ?",
            reponse: ["Paris", "Lyon", "Marseille", "Bordeaux"],
            reponseCorrect: "Paris"
        },
        {
            question: "Quel est le frère de Mario ?",
            reponse: ["Luigi", "Bowser", "Peach", "Warrio"],
            reponseCorrect: "Luigi"
        },
        {
            question: "5 x 5 - 24 = ?",
            reponse: ["1", "-1", "-19", "Je sais pas"],
            reponseCorrect: "1"
        },
        // Ajoutez plus de questions ici
    ];

    function displayQuestion(questionIndex) {
        const currentQuestion = questions[questionIndex];
        questionContainer.textContent = currentQuestion.question;
        reponseContainer.innerHTML = ''; 

        currentQuestion.reponse.forEach(answer => {
            const answerElement = document.createElement('li');
            answerElement.textContent = answer;
            answerElement.addEventListener('click', () => selectAnswer(answer));
            reponseContainer.appendChild(answerElement);
        });
    }

    function selectAnswer(answer) {
        const reponseCorrect = questions[currentQuestionIndex].reponseCorrect;
        if (answer === reponseCorrect) {
            score++;
        }
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        } else {
            displayresultats();
        }
    }

    function displayresultats() {
        questionContainer.style.display = 'none';
        reponseContainer.style.display = 'none';

        resultatContainer.textContent = `Votre score est de : ${score}/${questions.length}`;
    }

    displayQuestion(currentQuestionIndex);
});
