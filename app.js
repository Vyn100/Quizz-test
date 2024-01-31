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

// Route pour gérer la demande du fichier favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Route pour obtenir l'ID de l'utilisateur à partir de la session
app.get('/api/get-user-id', (req, res) => {

  // Vérifie si l'ID de l'utilisateur existe dans la session
  if (req.session.userId) {

    // Si l'ID de l'utilisateur existe, renvoie la réponse JSON avec l'ID
    res.json({ userId: req.session.userId });
  } else {

    // Si l'ID de l'utilisateur n'existe pas, renvoie une réponse avec un statut HTTP 401 (Non autorisé)
    res.status(401).send('Utilisateur non authentifié');
  }
});


// Route de l'accueil, redirige vers la page de connexion
app.get('/', (req, res) => {

  // Redirige l'utilisateur vers la page de connexion
  res.redirect('/login');
});


// Route GET pour la page de connexion, renvoie le fichier HTML de connexion
app.get('/login', (req, res) => {// Renvoie le fichier HTML de connexion situé dans le répertoire 'public'

  // Renvoie le fichier HTML de connexion situé dans le répertoire 'public'
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour traiter la soumission du formulaire de connexion
app.post('/login', async (req, res) => {
  try {

    // Récupère les données d'email et de mot de passe du corps de la requête
    const { email, password } = req.body;
    console.log(req.body);

    // Requête pour rechercher un utilisateur dans la base de données avec l'email donné
    const user = await db.query('SELECT * FROM Utilisateurs WHERE email = $1', [email]);

    console.log("Utilisateur trouvé :", user.rows[0]);      //! Pour débogage
    console.log("Mot de passe fourni :", password);         //! Pour débogage
    console.log("Résultat de la requête :", user.rows);     //! Pour débogage

    // Si un utilisateur est trouvé avec cet email
    if (user.rows.length > 0) {

      // Vérifie si le mot de passe fourni correspond au mot de passe haché dans la base de données
      const isValid = await bcrypt.compare(password, user.rows[0].mot_de_passe);

      if (isValid) {

        // Si le mot de passe est valide, défini l'ID de l'utilisateur dans la session
        req.session.userId = user.rows[0].id;

        // Redirige l'utilisateur vers la page du quiz
        res.redirect('/quizz');
        console.log("Connexion réussie normalement");       //! Pour débogage
      } else {

        // Si le mot de passe n'est pas valide, renvoie une réponse avec un statut HTTP 400 (Bad Request)
        res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
        console.log("Mot de passe incorrect");              //! Pour débogage
      }
    } else {

      // Si aucun utilisateur n'est trouvé avec cet email, renvoie une réponse avec un statut HTTP 400 (Bad Request)
      res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
      console.log("Utilisateur non trouvé");                //! Pour débogage
    }
  } catch (err) {

    // En cas d'erreur lors de la vérification de l'utilisateur, renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
    console.error("Erreur lors de la vérification de l'utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

// Route GET pour la page d'inscription, renvoie le fichier HTML d'inscription
app.get('/signup', (req, res) => {

  // Renvoie le fichier HTML de la page d'inscription situé dans le répertoire 'public'
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route pour traiter la soumission du formulaire d'inscription
app.post('/signup', async (req, res) => {
  try {

    // Récupère les données du formulaire (nom, email, mot de passe)
    const { name, email, password } = req.body;

    // Hache le mot de passe avant de le stocker dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insère le nouvel utilisateur dans la base de données avec le mot de passe haché
    const newUser = await db.query(
      'INSERT INTO Utilisateurs (nom, email, mot_de_passe) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    // Redirige l'utilisateur vers la page de connexion après l'inscription réussie
    res.redirect('/login');
    console.log("Ajout du nouvel utilisateur dans la base de données réussie")
  } catch (err) {

    // En cas d'erreur lors de l'inscription, affiche l'erreur dans la console
    console.error(err);

    // Renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
    res.status(500).send("Erreur lors de l'inscription.");
  }
});

// Route GET pour la page de quizz, renvoie le fichier HTML de quizz
app.get('/quizz', (req, res) => {

  // Renvoie le fichier HTML de la page de quiz situé dans le répertoire 'public'
  res.sendFile(path.join(__dirname, 'public', 'quizz.html'));
});

// Route pour obtenir la liste des utilisateurs depuis la base de données
app.get('/utilisateur', async (req, res) => {
  try {

    // Effectue une requête pour sélectionner tous les utilisateurs dans la base de données
    const result = await db.query('SELECT * FROM Utilisateurs');

    // Renvoie les données des utilisateurs sous forme de réponse JSON
    res.json(result.rows);
  } catch (err) {

    // En cas d'erreur lors de la récupération des utilisateurs, affiche l'erreur dans la console
    console.error(err);

    // Renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
    res.status(500).send('Erreur interne du serveur');
  }
});

// Route GET pour obtenir la liste des questions depuis la base de données
app.get('/api/questions', async (req, res) => {
  try {

    // Effectue une requête pour sélectionner toutes les questions dans la base de données
    const questions = await db.query('SELECT * FROM Questions');

    // Renvoie les données des questions sous forme de réponse JSON
    res.json(questions.rows);
  } catch (err) {

    // En cas d'erreur lors de la récupération des questions, affiche l'erreur dans la console
    console.error(err);

    // Renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
    res.status(500).send('Erreur serveur');
  }
});

// Route POST pour mettre à jour le score de l'utilisateur
app.post('/api/update-score', async (req, res) => {
  try {

    // Récupère les données de l'utilisateur (ID et score) depuis le corps de la requête
    const { userId, score } = req.body;

    // Effectue une requête pour obtenir le score actuel de l'utilisateur
    const result = await db.query('SELECT score FROM Utilisateurs WHERE id = $1', [userId]);
    const currentScore = result.rows[0].score;

    // Compare le nouveau score avec le score actuel
    if (score > currentScore) {

      // Si le nouveau score est supérieur, met à jour le score de l'utilisateur dans la base de données
      await db.query('UPDATE Utilisateurs SET score = $1 WHERE id = $2', [score, userId]);
      res.json({ message: 'Score mis à jour avec succès' });
    } else {

      // Si le nouveau score n'est pas supérieur, renvoie un message indiquant que le score n'a pas été mis à jour
      res.json({ message: 'Le score n\'a pas été mis à jour car il est inférieur au score actuel' });
    }
  } catch (err) {

    // En cas d'erreur lors de la mise à jour du score, affiche l'erreur dans la console
    console.error(err);

    // Renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
    res.status(500).send('Erreur lors de la mise à jour du score');
  }
});

// Route GET pour obtenir le score de l'utilisateur
app.get('/api/get-user-score', async (req, res) => {

  // Vérifie si l'utilisateur est authentifié en vérifiant la présence de l'ID de session
  if (req.session.userId) {
    try {

      // Effectue une requête pour obtenir le score de l'utilisateur à partir de son ID de session
      const result = await db.query('SELECT score FROM Utilisateurs WHERE id = $1', [req.session.userId]);
      const userScore = result.rows[0].score;

      // Renvoie le score de l'utilisateur sous forme de réponse JSON
      res.json({ score: userScore });
    } catch (err) {

      // En cas d'erreur lors de la récupération du score, affiche l'erreur dans la console
      console.error(err);

      // Renvoie une réponse avec un statut HTTP 500 (Internal Server Error)
      res.status(500).send('Erreur lors de la récupération du score');
    }
  } else {

    // Si l'utilisateur n'est pas authentifié, renvoie une réponse avec un statut HTTP 401 (Non autorisé)
    res.status(401).send('Utilisateur non authentifié');
  }
});

// Lancement du serveur sur le port spécifié
app.listen(port, () => {

  // Une fois le serveur lancé, affiche un message dans la console avec l'URL du serveur
  console.log(`Le serveur est lancé sur http://localhost:${port}`);
});
