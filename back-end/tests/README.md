# Tests SafeHaven Backend

Ce dossier contient les tests unitaires pour les fonctionnalités principales de SafeHaven.

## Fichiers de tests

- `detectionDetresse.test.js` - Tests de détection de détresse et d'urgence
- `chatbotIA.test.js` - Tests du chatbot IA et analyse des sentiments
- `moderationLogic.test.js` - Tests de modération du contenu
- `validation.test.js` - Tests de validation des données

## Ce qui est testé

### 🚨 Détection de détresse (Priorité 1)
- Détection de messages suicidaires
- Classification des niveaux de détresse (1-5)
- Analyse des mots-clés d'urgence
- Gestion des expressions de désespoir

### 🤖 Chatbot IA (Priorité 2)  
- Analyse des sentiments (positif/négatif/neutre)
- Extraction de sujets (burnout, famille, anxiété)
- Génération de recommandations
- Gestion des sessions de chat
- Configuration OpenAI

### 🛡️ Modération du contenu
- Filtrage du contenu inapproprié
- Messages d'avertissement
- Détection de contenu sensible

### ✅ Validation des données
- Format des emails et mots de passe
- Validation des noms d'utilisateur
- Contrôle du contenu des expériences

## Lancer les tests

```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## Spécificités SafeHaven

Ces tests sont adaptés à l'application SafeHaven qui se concentre sur :
- La détection précoce de la détresse psychologique
- L'accompagnement par IA empathique
- La protection des utilisateurs vulnérables
- La modération de contenu sensible

Les tests vérifient que l'application peut identifier et répondre appropriément aux situations de crise.