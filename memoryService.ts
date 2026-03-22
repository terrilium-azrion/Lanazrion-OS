import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { callGemini, KnowledgeNugget } from './geminiService';

const NUGGETS_PATH = 'artifacts/kaleidoland-synode/public/data/knowledge_nuggets';

const COMPRESSION_INSTRUCTION = `Tu es le compresseur de mémoire de Kaleidoland. 
Ta mission : Transformer un texte long en une seule phrase "Nugget" ultra-dense et exploitable. 
Tu DOIS répondre au format JSON standard de Kaleidoland (SYNODE_FULL_SPECTRUM_OS) :
- 'text' : Le nugget synthétisé (une seule phrase dense).
- 'insee_pillar' : La catégorie (STRATEGY, CREATION, ENGINEERING, WRITING, GRAVITY, FLOW, SENSORY).
- 'ui_mutation.entropy_score' : 1.0 par défaut.
- 'ui_mutation.theme' : 'NEUTRAL' par défaut.
- 'ui_mutation.liquidator_report.score' : L'importance stratégique (0-100).`;

/**
 * Récupère les 3 pépites les plus importantes (poids le plus élevé)
 */
export const getTopNuggets = async (): Promise<KnowledgeNugget[]> => {
  try {
    const q = query(
      collection(db, NUGGETS_PATH),
      orderBy('weight', 'desc'),
      limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeNugget));
  } catch (error) {
    console.error("Erreur lors de la récupération des pépites:", error);
    return [];
  }
};

/**
 * Récupère toutes les pépites (triées par date décroissante)
 */
export const getAllNuggets = async (): Promise<KnowledgeNugget[]> => {
  try {
    const q = query(
      collection(db, NUGGETS_PATH),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeNugget));
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les pépites:", error);
    return [];
  }
};

/**
 * Compresse une information brute en un "Nugget" via Gemini
 */
export const compressInformation = async (rawData: string): Promise<KnowledgeNugget | null> => {
  if (!rawData.trim()) return null;

  const prompt = `Compresse ceci en un "Nugget" stratégique ultra-dense : ${rawData}`;
  
  try {
    const response = await callGemini(prompt, undefined, [], COMPRESSION_INSTRUCTION);
    
    const newNugget: Omit<KnowledgeNugget, 'id'> = {
      content: response.text,
      category: response.insee_pillar || 'STRATEGY',
      weight: (response.ui_mutation.liquidator_report?.score || 50) / 100,
      timestamp: Date.now()
    };

    const docRef = await addDoc(collection(db, NUGGETS_PATH), newNugget);
    return { id: docRef.id, ...newNugget };
  } catch (error) {
    console.error("Échec de la cristallisation de l'information:", error);
    return null;
  }
};

/**
 * Sauvegarde un Shadow Update (provenant du protocole V6) en tant que pépite
 */
export const saveShadowUpdate = async (update: string): Promise<KnowledgeNugget | null> => {
  if (!update.trim()) return null;

  const newNugget: Omit<KnowledgeNugget, 'id'> = {
    content: update,
    category: 'STRATEGY',
    weight: 1.0, // Poids maximal pour les échecs cristallisés (ANTI_VAL_RECURSION)
    timestamp: Date.now()
  };

  try {
    const docRef = await addDoc(collection(db, NUGGETS_PATH), newNugget);
    return { id: docRef.id, ...newNugget };
  } catch (error) {
    console.error("Échec de la sauvegarde du Shadow Update:", error);
    return null;
  }
};

/**
 * Supprime une pépite
 */
export const deleteNugget = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, NUGGETS_PATH, id));
  } catch (error) {
    console.error("Erreur lors de la suppression de la pépite:", error);
  }
};
