// Importation des modules nécessaires
const express = require('express');           // Framework web pour Node.js
const path = require('path');                 // Module pour gérer les chemins de fichiers
const bcrypt = require('bcrypt');             // Module pour le hachage de mots de passe sécurisé
const db = require('./db/db');                // Module personnalisé pour la gestion de la base de données
const app = express();                        // Création d'une instance d'Express
const port = 3000;                            // Port sur lequel le serveur écoutera les requêtes
const session = require('express-session');   // Middleware pour gérer les sessions utilisateur

// Configuration du middleware express-session pour gérer les sessions utilisateur
app.use(session({
  secret: 'votre_secret',     // Clé secrète utilisée pour signer les cookies de session
  resave: false,              // Ne pas enregistrer la session à chaque requête
  saveUninitialized: true     // Enregistrer les sessions non initialisées (par exemple, les sessions anonymes)
}));

// Configuration de l'application
app.use(express.json());                          // Middleware pour analyser les données JSON dans les requêtes
app.use(express.urlencoded({ extended: true }));  // Middleware pour analyser les données de formulaire URL encodé
app.use(express.static('public'));                // Middleware pour servir des fichiers statiques depuis le répertoire 'public'

// Route pour gérer la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Erreur lors de la déconnexion');
    }
    res.redirect('/login');
  });
});

// Route pour gérer la demande du fichier favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Route pour obtenir l'ID de l'utilisateur à partir de la session
app.get('/api/get-user-id', async (req, res) => {
  if (req.session.userId) {
    try {
      const result = await db.query('SELECT is_admin FROM Utilisateurs WHERE id = $1', [req.session.userId]);
      const isAdmin = result.rows[0].is_admin;
      res.json({ userId: req.session.userId, isAdmin });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération des informations utilisateur');
    }
  } else {
    res.status(401).send('Utilisateur non authentifié');
  }
});

// Route de l'accueil, redirige vers la page de connexion
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Route GET pour la page de connexion, renvoie le fichier HTML de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour traiter la soumission du formulaire de connexion
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await db.query('SELECT * FROM Utilisateurs WHERE email = $1', [email]);

    console.log("Utilisateur trouvé :", user.rows[0]);
    console.log("Mot de passe fourni :", password);
    console.log("Résultat de la requête :", user.rows);

    if (user.rows.length > 0) {
      const isValid = await bcrypt.compare(password, user.rows[0].mot_de_passe);

      if (isValid) {
        req.session.userId = user.rows[0].id;
        res.json({ success: true, isAdmin: user.rows[0].is_admin });
      } else {
        res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
        console.log("Mot de passe incorrect");
      }
    } else {
      res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
      console.log("Utilisateur non trouvé");
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de l'utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

// Route GET pour la page d'inscription, renvoie le fichier HTML d'inscription
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route pour traiter la soumission du formulaire d'inscription
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      'INSERT INTO Utilisateurs (nom, email, mot_de_passe) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.redirect('/login');
    console.log("Ajout du nouvel utilisateur dans la base de données réussie")
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'inscription.");
  }
});

// Route GET pour la page de quizz, renvoie le fichier HTML de quizz
app.get('/quizz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quizz.html'));
});

// Route pour obtenir la liste des utilisateurs depuis la base de données
app.get('/utilisateur', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Utilisateurs');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur interne du serveur');
  }
});

// Route GET pour obtenir la liste des questions depuis la base de données
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await db.query('SELECT * FROM Questions');
    res.json(questions.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Route POST pour mettre à jour le score de l'utilisateur
app.post('/api/update-score', async (req, res) => {
  try {
    const { userId, score } = req.body;
    const result = await db.query('SELECT score FROM Utilisateurs WHERE id = $1', [userId]);
    const currentScore = result.rows[0].score;

    if (score > currentScore) {
      await db.query('UPDATE Utilisateurs SET score = $1 WHERE id = $2', [score, userId]);
      res.json({ message: 'Score mis à jour avec succès' });
    } else {
      res.json({ message: 'Le score n\'a pas été mis à jour car il est inférieur au score actuel' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la mise à jour du score');
  }
});

// Route GET pour obtenir le score de l'utilisateur
app.get('/api/get-user-score', async (req, res) => {
  if (req.session.userId) {
    try {
      const result = await db.query('SELECT score FROM Utilisateurs WHERE id = $1', [req.session.userId]);
      const userScore = result.rows[0].score;
      res.json({ score: userScore });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la récupération du score');
    }
  } else {
    res.status(401).send('Utilisateur non authentifié');
  }
});

// Route pour la page d'administration
app.get('/admin', (req, res) => {
  if (req.session.userId) {
    db.query('SELECT is_admin FROM Utilisateurs WHERE id = $1', [req.session.userId])
      .then(result => {
        if (result.rows.length > 0 && result.rows[0].is_admin) {
          res.sendFile(path.join(__dirname, 'public', 'admin.html'));
        } else {
          res.status(403).send('Accès refusé');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Erreur serveur');
      });
  } else {
    res.redirect('/login');
  }
});

// Route pour obtenir la liste des utilisateurs depuis la base de données
app.get('/api/utilisateurs', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nom, email, score FROM Utilisateurs');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur interne du serveur');
  }
});

// Route GET pour obtenir la liste des questions depuis la base de données
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await db.query('SELECT * FROM Questions');
    res.json(questions.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Route POST pour ajouter une nouvelle question
app.post('/api/questions', async (req, res) => {
  try {
    const { question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois } = req.body;
    await db.query(
      'INSERT INTO Questions (question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois) VALUES ($1, $2, $3, $4, $5)',
      [question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois]
    );
    res.status(201).send('Question ajoutée');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'ajout de la question');
  }
});

// Route DELETE pour supprimer une question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Questions WHERE id = $1', [id]);
    res.status(200).send('Question supprimée');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression de la question');
  }
});

// Route DELETE pour supprimer un utilisateur
app.delete('/api/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Utilisateurs WHERE id = $1', [id]);
    res.status(200).send('Utilisateur supprimé');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression de l\'utilisateur');
  }
});

// Route PUT pour modifier une question
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois } = req.body;
    await db.query(
      'UPDATE Questions SET question = $1, reponse_correcte = $2, fausse_reponse_un = $3, fausse_reponse_deux = $4, fausse_reponse_trois = $5 WHERE id = $6',
      [question, reponse_correcte, fausse_reponse_un, fausse_reponse_deux, fausse_reponse_trois, id]
    );
    res.status(200).send('Question modifiée');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la modification de la question');
  }
});

// Route PUT pour remettre à zéro le score d'un utilisateur
app.put('/api/utilisateurs/:id/reset-score', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE Utilisateurs SET score = 0 WHERE id = $1', [id]);
    res.status(200).send('Score remis à zéro');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la remise à zéro du score');
  }
});


// Route pour gérer la demande du fichier favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Lancement du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Le serveur est lancé sur http://localhost:${port}`);
});
