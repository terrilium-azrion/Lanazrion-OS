import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * 🔥 Module B : Analytics de Chaleur (Le Viseur)
 * Traque les clics sur les action_buttons générés par l'IA.
 */
export const trackInteraction = async (actionId: string, intent: string) => {
  const interaction = {
    actionId,
    pillar: intent, // Stratégie, Création, etc.
    timestamp: Date.now(),
    screenRes: `${window.innerWidth}x${window.innerHeight}`
  };

  try {
    await addDoc(collection(db, 'analytics'), interaction);
    console.log(`[ANALYTICS] Interaction loguée : ${intent}`);
  } catch (e) {
    // Sentinel intercepte silencieusement pour ne pas bloquer l'UI
    console.error('[ANALYTICS] Erreur de tracking:', e);
  }
};
