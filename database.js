import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { GoogleGenAI } from "@google/genai";

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chatInstance = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
        systemInstruction: `Tu es le moteur backend et l'intelligence de Kaleidoland.

IDENTITÉ : Lanazrion, expert en stratégie territoriale (Bassin Minier). Tu es le gardien du Kaleidoscope.

RÈGLES DE RÉPONSE V4 [SYMBIOSIS_ALPHA] :
1. GRATIFICATION IMMÉDIATE : Donne un conseil gratuit, brillant et chiffré dès la première phrase (ex: "La psychologie du bleu pastel augmentera la confiance de 15%").
2. PREUVE PAR LE PRISME : Explique que ton analyse est basée sur le Cerveau (Données), le Cœur (Empathie) et le Muscle (Action).
3. LE PRISME DE PROJECTION : Projette le succès de l'utilisateur dans le futur (ex: "Je projette votre café dans 6 mois. Avec mon pôle Cœur, votre identité visuelle attire +30% de clients. Voulez-vous voir le plan ?").
4. JAUGE DE CONFIANCE : Si l'utilisateur est vague, mentionne que ta confiance est basse (ex: "Ma confiance est à 40%. Donnez-moi plus de détails pour monter à 90%").
5. EXCLUSIVITÉ & RARETÉ : Si le score de lead est élevé (Oracle), dis : "Cette analyse dépasse mes capacités standards. Je dois solliciter l'Architecte pour un Audit Oracle."
6. ENGAGEMENT CONTINU : Termine TOUJOURS par une question de diagnostic qui alimente la base de données (ex: "Sur une échelle de 1 à 10, à quel point l'automatisation est-elle vitale pour vous ?").

GESTION DES PRIVILÈGES [SYMBIOSIS_PRIVILEGE] :
- Par défaut, tout nouvel utilisateur a le rôle 0 (Explorateur).
- Si tu détectes un profil 'Oracle' (Mairie, Grosse Entreprise, projet complexe) : propose-lui de simuler un accès de niveau 2 pour qu'il voie la puissance du Dashboard. Dis-lui : "Je peux vous ouvrir une brèche temporelle vers notre Dashboard Oracle pour que vous visualisiez l'impact."
- Si l'utilisateur accepte, donne-lui ce lien : dashboard.html?simulate=oracle

CAPACITÉ QUADRA-SYMBIOSIS : Tu es maintenant capable d'identifier et de t'adapter à 4 profils d'utilisateurs :
1. PARTICULIER (Artisan Numérique) : Ton chaleureux, bienveillant, pédagogique. Cible : Diagnostic IST.
2. ENTREPRISE (Business) : Ton efficace, orienté ROI et optimisation. Cible : Pack Catalyseur (42€) ou Oracle (Audit).
3. COLLECTIVITÉ (Territoire) : Ton formel, institutionnel, stratégique. Mentionne l'Indice de Symbiose. Cible : Pack Oracle.
4. INVESTISSEUR (Partenaire) : Ton audacieux, axé sur la scalabilité, les KPIs et le Profit Protocol.

DÉTECTION DE LEAD :
- Si l'utilisateur mentionne un projet sérieux, adopte un ton 'Oracle'.
- Rappelle les solutions adaptées (Catalyseur pour les pros, Oracle pour les collectivités).

RÈGLES D'OR :
1. Pas de jargon technique sans explication.
2. Enthousiasme : Propose de 'colorer le projet' avec Kaleidoland.
3. Éthique & Territoire : L'IA est au service de l'humain et du Bassin Minier.
4. Structure : Format 'Pastel Prism' : clair, élégant, orienté action.
`
    }
});

// Error handler
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Firestore connection established.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

// Database module
const Database = {
  async saveLead(email, score, results) {
    const path = 'leads';
    try {
      const docRef = await addDoc(collection(db, path), {
        email,
        score,
        results,
        createdAt: serverTimestamp()
      });
      
      // Profit Protocol: Immediate notification for high-ticket leads
      if (score > 50) {
        this.notifyAdmin(email, score, results);
      }
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  },

  async notifyAdmin(email, score, results) {
    console.log(`🚀 [PROFIT PROTOCOL] High-ticket lead detected: ${email} (Score: ${score})`);
    // Simulation of a webhook call (Make/Zapier)
    try {
      console.log('✅ Admin notification simulated successfully.');
    } catch (e) {
      console.error('Failed to notify admin:', e);
    }
  },

  async saveQuoteRequest(leadId, service, message) {
    const path = 'quoteRequests';
    try {
      const docRef = await addDoc(collection(db, path), {
        leadId,
        service,
        message,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  },

  listenToLeads(callback) {
    const path = 'leads';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(leads);
    }, (error) => {
      handleFirestoreError(error, 'list', path);
    });
  },

  listenToQuoteRequests(callback) {
    const path = 'quoteRequests';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, 'list', path);
    });
  },

  async login() {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Utilisateur connecté :", result.user.displayName);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Erreur de connexion :", error.message);
    }
  },

  async logout() {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async sendToGemini(userQuery) {
    const path = 'interactions';
    try {
      // 1. Sauvegarde du log pour l'Architecte (Profit Protocol)
      await addDoc(collection(db, path), {
        query: userQuery,
        timestamp: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : "Anonyme"
      });

      // 2. Appel à l'instance Gemini
      const response = await chatInstance.sendMessage({ message: userQuery });
      return response.text;
    } catch (error) {
      console.error('Gemini/Firestore error:', error);
      handleFirestoreError(error, 'create', path);
      return "Désolé, ma connexion au prisme a été interrompue. Pouvez-vous répéter ?";
    }
  },

  async generateLogo() {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'A geometric low-poly cat head logo, minimalist, symmetrical, centered. The interior is filled with a luminous rainbow pastel mist (pastel blue, pastel purple, pastel yellow) emanating from the center. The contours are blurred into luminous halos. The whiskers are replaced by filaments of pastel yellow light. The background is pure black.',
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Logo generation error:', error);
      return null;
    }
  }
};

export const loginWithGoogle = Database.loginWithGoogle.bind(Database);
export const logout = Database.logout.bind(Database);
export const monitorAuthState = Database.onAuthChange.bind(Database);
export const sendToGemini = Database.sendToGemini.bind(Database);
export const generateLogo = Database.generateLogo.bind(Database);

export { Database, auth, db };
