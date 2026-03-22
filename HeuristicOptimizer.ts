import { sentinel } from './SentinelWatcher';

interface ActionOption {
  label: string;
  action: string;
}

class HeuristicOptimizer {
  
  // Génère des options d'action contextuelles
  generateBentoCards(entropy: number, messageCount: number) {
    const cards = [];

    // Si la conversation est longue ou complexe (haute entropie), on propose de synthétiser
    if (entropy > 2.5 || messageCount > 10) {
      cards.push({ label: "Résumer l'échange", action: "summarize_all" });
    }

    // Si on vient de commencer (basse entropie, peu de messages)
    if (messageCount <= 2) {
      cards.push({ label: "Afficher le Dashboard", action: "open_dashboard" });
    }

    // Bouton toujours présent pour le protocole Profit
    cards.push({ label: "Est-ce scalable ?", action: "check_scalability" });

    return cards;
  }
}

export const optimizer = new HeuristicOptimizer();
