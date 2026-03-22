import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { callGemini } from './geminiService';

const CLUSTERS_PATH = 'artifacts/kaleidoland-synode/public/data/semantic_clusters';

export interface SubCluster {
  title: string;
  weight: number;
  links: number;
}

export interface SemanticCluster {
  id?: string;
  pillar: string;
  depth: number;
  subClusters: SubCluster[];
  authorityScore: number;
  potentialReach: string;
  timestamp: number;
  uid: string;
}

const SEO_SYSTEM_INSTRUCTION = `Tu es l'Oracle Sémantique de Kaleidoland. 
Ta mission : Générer une architecture de cluster sémantique (SEO Exponentiel) pour un concept maître.
Tu DOIS répondre au format JSON standard de Kaleidoland V5 :
- 'text' : Une analyse stratégique du potentiel de ce cluster.
- 'intent' : 'STRATEGY'.
- 'ui_mutation.entropy_score' : Le volume de recherche estimé (0-5.0).
- 'ui_mutation.theme_shift' : 'GOLD_RESERVE'.
- 'ui_mutation.action_buttons' : Liste de 4 sous-clusters au format :
  { "label": "TITRE_DU_SOUS_CLUSTER | POIDS | LIENS", "cmd": "CLUSTER_SUB_DATA" }
  Exemple : { "label": "Stratégies High-Ticket | 85 | 12", "cmd": "SEO_SUB" }`;

export const generateCluster = async (keyword: string, depth: number, uid: string): Promise<SemanticCluster | null> => {
  const prompt = `Génère un cluster sémantique pour le concept maître : "${keyword}" avec une profondeur de silo de ${depth}.`;
  
  try {
    const response = await callGemini(prompt, undefined, [], SEO_SYSTEM_INSTRUCTION);
    
    const subClusters: SubCluster[] = response.ui_mutation.action_buttons.map(btn => {
      const parts = btn.label.split(' | ');
      return {
        title: parts[0]?.trim() || "Sous-cluster",
        weight: parseInt(parts[1]) || 0,
        links: parseInt(parts[2]) || 0
      };
    });

    const newCluster: Omit<SemanticCluster, 'id'> = {
      pillar: keyword.toUpperCase(),
      depth,
      subClusters,
      authorityScore: Math.round(response.ui_mutation.entropy_score * 20), // Derived for compatibility
      potentialReach: `${Math.round(response.ui_mutation.entropy_score * 25)}k+ / mois`,
      timestamp: Date.now(),
      uid
    };

    const docRef = await addDoc(collection(db, CLUSTERS_PATH), newCluster);
    return { id: docRef.id, ...newCluster };
  } catch (error) {
    console.error("Échec de la génération du cluster sémantique:", error);
    return null;
  }
};

export const getUserClusters = async (uid: string): Promise<SemanticCluster[]> => {
  try {
    const q = query(
      collection(db, CLUSTERS_PATH),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SemanticCluster));
  } catch (error) {
    console.error("Erreur lors de la récupération des clusters:", error);
    return [];
  }
};
