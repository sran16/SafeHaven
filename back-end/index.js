import OpenAI from "openai";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

// Initialisation de l'API OpenAI avec la nouvelle syntaxe (v4)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Interface utilisateur en ligne de commande
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Fonction pour poser une question
const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

// Fonction principale
const main = async () => {
    console.log("Bienvenue dans le chatbot IA!");

    while (true) {
        const userInput = await askQuestion("Vous: ");
        if (userInput.toLowerCase() === "exit") {
            console.log("Au revoir!");
            break;
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userInput }],
            });
            
            console.log(`Bot: ${completion.choices[0].message.content}`);
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API OpenAI:", error.message);
        }
    }

    rl.close();
};

main();
