// Importation des modules nécessaires
const express = require('express');               // Framework Express pour Node.js
const path = require('path');                     // Module pour gérer les chemins de fichiers
const bcrypt = require('bcrypt');                 // Module de hachage de mot de passe
const db = require('./db/db');                    // Module pour interagir avec la base de données
const app = express();                            // Initialisation de l'application Express
const port = 3000;                                // Numéro de port sur lequel le serveur écoutera

// Configuration de l'application
app.use(express.json());                          // Middleware pour analyser les données JSON dans les requêtes
app.use(express.urlencoded({ extended: true }));  // Middleware pour analyser les données de formulaire URL encodé
app.use(express.static('public'));                // Middleware pour servir des fichiers statiques depuis le répertoire 'public'

// Route de l'accueil, redirige vers la page de connexion
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Route GET pour la page de connexion, renvoie le fichier HTML de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route GET pour la page d'inscription, renvoie le fichier HTML d'inscription
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
// Route GET pour la page de quizz, renvoie le fichier HTML de quizz
app.get('/quizz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quizz.html'));
});

// Route pour traiter la soumission du formulaire d'inscription
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);     // Hachage du mot de passe

    // Insérer l'utilisateur dans la base de données
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

// Route pour traiter la soumission du formulaire de connexion
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Récupération des données d'email et de mot de passe depuis le formulaire
    console.log(req.body);
    const user = await db.query('SELECT * FROM Utilisateurs WHERE email = $1', [email]); // Requête pour récupérer l'utilisateur correspondant à l'email

    console.log("Utilisateur trouvé :", user.rows[0]);
    console.log("Mot de passe fourni :", password);
    console.log("Résultat de la requête :", user.rows);
    
    if (user.rows.length > 0) {
      const isValid = await bcrypt.compare(password, user.rows[0].mot_de_passe); // Vérification du mot de passe haché

      if (isValid) {
        // Utilisateur authentifié
        // res.json({ success: true }); // Envoi d'une réponse JSON indiquant le succès
        res.redirect('/quizz');
        console.log("Connexion réussie normalement");
      } else {
        // Mot de passe incorrect
        res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
        console.log("Mot de passe incorrect");
      }
    } else {
      // Utilisateur non trouvé
      res.status(400).json({ error: "Identifiant ou mot de passe incorrect" });
      console.log("Utilisateur non trouvé");
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de l'utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});



// Route pour obtenir la liste des utilisateurs depuis la base de données
app.get('/utilisateur', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Utilisateurs');
    res.json(result.rows);          // Répond avec la liste des utilisateurs au format JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur interne du serveur');
  }
});

// Lancement du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Le serveur est lancé sur http://localhost:${port}`);
});
