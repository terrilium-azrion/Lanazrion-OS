import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from './database.js';

/**
 * Fonction pour créer un pont de données vers l'Architecte [GEMINI_LINK]
 * @param {Object} userData - Informations sur l'utilisateur (email, score)
 * @param {Array} messageHistory - Historique des messages de la conversation
 */
export async function sendToArchitect(userData, messageHistory) {
    const path = 'architect_bridge';
    const payload = {
        timestamp: new Date().toISOString(),
        user: userData.email || "Anonyme",
        context: sessionStorage.getItem('KLD_diag') || "Aucun diagnostic",
        history: messageHistory,
        priority: (userData.score && userData.score > 50) ? "URGENT_ORACLE" : "STANDARD"
    };

    // Envoi vers Firestore pour consultation immédiate par l'architecte
    try {
        await addDoc(collection(db, path), payload);
        console.log("Pont établi. Message transmis au Cerveau Central.");
    } catch (e) {
        handleFirestoreError(e, 'create', path);
    }
}
