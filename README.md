# Calculateur FTP ⚡

Application web (PWA) qui calcule ta puissance cible en watts à partir de ta FTP et d'un pourcentage d'intensité, avec les 7 zones d'entraînement (modèle Coggan) qui s'ajustent automatiquement à ta FTP.

Fonctionne hors-ligne une fois installée — pratique en déplacement.

## Mettre en ligne avec GitHub Pages

1. Crée un nouveau repository sur GitHub (public).
2. Mets-y les fichiers de ce dossier tels quels, à la racine du repo :
   ```
   index.html
   manifest.json
   service-worker.js
   icons/icon-192.png
   icons/icon-512.png
   icons/icon-maskable-512.png
   ```
3. Dans le repo GitHub : **Settings → Pages**.
4. Sous "Build and deployment", choisis **Source : Deploy from a branch**.
5. Choisis la branche `main` et le dossier `/ (root)`, puis **Save**.
6. Après une minute ou deux, ton app est en ligne à l'adresse :
   `https://<ton-pseudo-github>.github.io/<nom-du-repo>/`

## Installer l'app sur ton téléphone (PWA)

**Android (Chrome) :**
Ouvre le lien → menu ⋮ → "Ajouter à l'écran d'accueil" (ou une bannière d'installation apparaît automatiquement).

**iPhone (Safari) :**
Ouvre le lien → bouton Partager (carré avec flèche) → "Sur l'écran d'accueil".

Une fois installée, l'icône ⚡ apparaît comme une vraie app et fonctionne même sans connexion internet (grâce au service worker qui met tout en cache).

## Mettre à jour l'app après une modification

1. Modifie `index.html` (ou les autres fichiers).
2. Ouvre `service-worker.js` et incrémente le numéro de version en haut du fichier :
   ```js
   const CACHE_NAME = 'ftp-calc-v3';   // → passe à v4, v5, etc. à chaque déploiement
   ```
3. Pousse (`push`) les changements sur GitHub.

Pourquoi c'est nécessaire : le navigateur ne redétecte une mise à jour du service worker que si son contenu a changé. Changer le numéro de version suffit à déclencher ça.

Une fois le nouveau service worker détecté, il :
- récupère en priorité les nouveaux fichiers **depuis le réseau** (pas depuis l'ancien cache) pour la page principale et le manifest,
- prend le contrôle immédiatement (pas besoin de fermer/rouvrir l'app deux fois),
- déclenche un rechargement automatique de la page pour afficher la nouvelle version.

Les icônes (qui changent rarement) restent servies depuis le cache pour un chargement rapide, avec une mise à jour silencieuse en arrière-plan si elles changent aussi.

## Pourquoi je vois encore la barre d'adresse ?

C'est normal si tu ouvres le lien **dans le navigateur** (Chrome, Safari...) : un onglet de navigateur garde toujours sa barre d'adresse, PWA ou pas.

La barre d'adresse ne disparaît que lorsque tu lances l'app **depuis l'icône sur ton écran d'accueil**, après l'avoir installée avec "Ajouter à l'écran d'accueil". Là, elle s'ouvre en plein écran, sans interface de navigateur — c'est le mode "standalone" défini dans `manifest.json`.

Donc : ouvre d'abord le lien une fois pour l'installer, puis lance l'app uniquement via son icône ensuite.

## Modifier l'app

Tout le code est dans `index.html` (un seul fichier autonome : HTML, CSS et JavaScript).
Si tu modifies `index.html`, pense à changer `CACHE_NAME` dans `service-worker.js` (ex: `ftp-calc-v2`) pour forcer la mise à jour du cache chez les utilisateurs qui ont déjà installé l'app.
