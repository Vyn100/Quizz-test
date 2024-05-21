document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    loadUsers();

    document.getElementById('add-question-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = document.getElementById('question').value;
        const reponse_correcte = document.getElementById('reponse-correcte').value;
        const fausse_reponse_un = document.getElementById('fausse-reponse-1').value;
        const fausse_reponse_deux = document.getElementById('fausse-reponse-2').value;
        const fausse_reponse_trois = document.getElementById('fausse-reponse-3').value;

        await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois })
        });

        loadQuestions();
    });

    document.getElementById('edit-question-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-question-id').value;
        const question = document.getElementById('edit-question').value;
        const reponse_correcte = document.getElementById('edit-reponse-correcte').value;
        const fausse_reponse_un = document.getElementById('edit-fausse-reponse-1').value;
        const fausse_reponse_deux = document.getElementById('edit-fausse-reponse-2').value;
        const fausse_reponse_trois = document.getElementById('edit-fausse-reponse-3').value;

        await fetch(`/api/questions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois })
        });

        closeModal();
        loadQuestions();
    });

    const modal = document.getElementById('edit-modal');
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => {
        closeModal();
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
});

async function loadQuestions() {
    const response = await fetch('/api/questions');
    const questions = await response.json();
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';

    questions.forEach(question => {
        const li = document.createElement('li');
        li.textContent = `Question: ${question.question}, Réponses: ${question.reponse_correcte}, ${question.fausse_reponse_un}, ${question.fausse_reponse_deux}, ${question.fausse_reponse_trois}`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Modifier';
        editButton.addEventListener('click', () => {
            openModal(question);
        });
        li.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', async () => {
            await fetch(`/api/questions/${question.id}`, {
                method: 'DELETE'
            });
            loadQuestions();
        });
        li.appendChild(deleteButton);

        questionsList.appendChild(li);
    });
}

function openModal(question) {
    document.getElementById('edit-question-id').value = question.id;
    document.getElementById('edit-question').value = question.question;
    document.getElementById('edit-reponse-correcte').value = question.reponse_correcte;
    document.getElementById('edit-fausse-reponse-1').value = question.fausse_reponse_un;
    document.getElementById('edit-fausse-reponse-2').value = question.fausse_reponse_deux;
    document.getElementById('edit-fausse-reponse-3').value = question.fausse_reponse_trois;
    document.getElementById('edit-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function loadUsers() {
    const response = await fetch('/api/utilisateurs');
    const utilisateurs = await response.json();
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    utilisateurs.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `Nom: ${user.nom}, Email: ${user.email}, Score: ${user.score}`;

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Remise à 0 du score';
        resetButton.addEventListener('click', async () => {
            await fetch(`/api/utilisateurs/${user.id}/reset-score`, {
                method: 'PUT'
            });
            loadUsers();
        });
        li.appendChild(resetButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', async () => {
            await fetch(`/api/utilisateurs/${user.id}`, {
                method: 'DELETE'
            });
            loadUsers();
        });
        li.appendChild(deleteButton);

        usersList.appendChild(li);
    });
}
