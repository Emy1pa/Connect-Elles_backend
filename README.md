# Femmes & Services - Backend

## Vue d'ensemble

Ce repository contient le backend de la plateforme "Femmes & Services", une application web conçue pour soutenir et autonomiser les femmes entrepreneurs au Maroc. Le backend est développé avec NestJS et utilise MongoDB comme base de données via Mongoose.

## Technologie

- **Framework**: [NestJS](https://nestjs.com/) - Framework Node.js progressif pour construire des applications serveur efficaces et évolutives
- **Base de données**: [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/) comme ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class-validator et class-transformer
- **Documentation API**: Swagger/OpenAPI

## Structure du projet

```
src/
├── app.module.ts               # Module principal de l'application
├── main.ts                     # Point d'entrée de l'application
├── config/                     # Configuration de l'application
│   ├── app.config.ts           # Configuration générale
│   ├── database.config.ts      # Configuration de la base de données
│   └── jwt.config.ts           # Configuration JWT
├── modules/                    # Modules fonctionnels de l'application
│   ├── auth/                   # Module d'authentification
│   ├── users/                  # Module de gestion des utilisateurs
│   ├── services/               # Module pour les échanges de services
│   ├── resources/              # Module pour les ressources et formations
│   └── mentoring/              # Module pour le mentorat et coaching
└── shared/                     # Code partagé entre modules
    ├── dto/                    # Data Transfer Objects
    ├── interfaces/             # Interfaces TypeScript
    ├── middlewares/            # Middlewares personnalisés
    ├── decorators/             # Décorateurs personnalisés
    └── filters/                # Filtres d'exception
```

## Configuration et installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

### Installation

1. Cloner le repository
   ```bash
   git clone https://github.com/Emy1pa/Connect-Elles_backend.git
   cd Connect-Elles_backend
   ```

2. Installer les dépendances
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configurer les variables d'environnement
   Créer un fichier `.env` à la racine du projet avec les variables suivantes:
   ```
   # Environnement
   NODE_ENV=development

   # Serveur
   PORT=3000
   HOST=localhost

   # Base de données
   DATABASE_URI=mongodb://localhost:27017/femmes-services

   # JWT
   JWT_SECRET=votre_secret_jwt
   JWT_EXPIRATION=8h

   # Autres configurations
   CORS_ORIGIN=http://localhost:8080
   ```

4. Lancer le serveur de développement
   ```bash
   npm run start:dev
   # ou
   yarn start:dev
   ```

### Scripts npm

- `npm run build` - Compile l'application
- `npm run start` - Démarre l'application en mode production
- `npm run start:dev` - Démarre l'application en mode développement avec hot reload
- `npm run test` - Exécute les tests unitaires
- `npm run test:e2e` - Exécute les tests end-to-end
- `npm run lint` - Vérifie le code avec ESLint

## Documentation

La documentation de l'API est générée automatiquement avec Swagger et est disponible à l'adresse `/api/docs` lorsque l'application est en cours d'exécution en mode développement.

## Tests

Le projet utilise Jest pour les tests:
- Tests unitaires: `npm run test`
- Tests end-to-end: `npm run test:e2e`
