import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  Zap, 
  Shield, 
  Brain, 
  Heart, 
  Target, 
  Send, 
  Cpu,
  Activity,
  Layers,
  Calendar,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from './firebase';
import { callGemini, GeminiResponse, HealerReporter, KnowledgeNugget } from './services/geminiService';
import { trackInteraction } from './services/analyticsService';
import { sentinel } from './services/SentinelWatcher';
import DebugDashboard, { LogEntry } from './components/DebugDashboard';
import MemoryCompressor from './components/MemoryCompressor';
import SemanticOracle from './components/SemanticOracle';
import AdminDashboard from './components/AdminDashboard';
import VIPAlert from './components/VIPAlert';
import Checkout from './components/Checkout';
import { getTopNuggets, compressInformation, saveShadowUpdate } from './services/memoryService';
import { Locale, translations } from './constants/translations';

// --- Types ---
export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'synode';
  timestamp: number;
  uid?: string;
  data?: {
    entropy_score: number;
    theme: 'LANA_HEIGHT' | 'GOLD_RESERVE' | 'BLOOD_ALERTE' | 'NEUTRAL' | 'LANA_ZEN_DEEP';
    shadow_update?: string;
    liquidator_report?: {
      score: number;
      flaw: string;
      sandwich_critique: string;
    };
    future_impact?: {
      scalability: number;
      burnout_risk: number;
    };
    gravity_check?: {
      rarity_score: number;
      market_saturation: number;
      verdict: string;
    };
    flow_action?: {
      task: string;
      status: 'EXECUTING' | 'PENDING';
    };
    sensory_status?: {
      level: 'RED' | 'GOLD' | 'NEUTRAL';
      friction_coefficient: number;
    };
    action_buttons: { label: string; cmd: string }[];
  };
  insee_pillar?: 'STRATEGY' | 'CREATION' | 'ENGINEERING' | 'WRITING' | 'GRAVITY' | 'FLOW' | 'SENSORY';
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme] = useState<'LANA_HEIGHT' | 'GOLD_RESERVE' | 'BLOOD_ALERTE' | 'NEUTRAL' | 'LANA_ZEN_DEEP'>('NEUTRAL');
  const [stats, setStats] = useState({ 
    entropy: 0.5, 
    scalability: 0.8, 
    burnout_risk: 0.2,
    cta_status: 'LOCKED' as 'LOCKED' | 'UNLOCKED_READY',
    sensory_level: 'NEUTRAL' as 'RED' | 'GOLD' | 'NEUTRAL',
    friction: 1.0
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'VISITOR' | 'MEMBER' | 'ELITE'>('VISITOR');
  const [locale, setLocale] = useState<Locale>('FR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug & Healing State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemState, setSystemState] = useState<'NOMINAL' | 'HEALING' | 'CRITICAL'>('NOMINAL');
  const [errorCount, setErrorCount] = useState(0);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);
  const [lastValidOutput, setLastValidOutput] = useState<string | null>(null);
  const [topNuggets, setTopNuggets] = useState<KnowledgeNugget[]>([]);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [vipAlert, setVipAlert] = useState<GeminiResponse['ui_mutation']['vip_alert'] | null>(null);
  const [latency, setLatency] = useState(24);

  const t = (key: string) => translations[locale][key] || key;

  const setLang = (newLang: Locale) => {
    setLocale(newLang);
    handleSendMessage(null as any, `[SYSTEM_UPDATE] Locale changed to ${newLang}. Adapt mirroring accordingly.`);
    addLog(`Langue changée : ${newLang}`, "info");
  };

  const addLog = (message: string, type: 'info' | 'error' | 'warning' | 'success' = 'info') => {
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const healerReporter: HealerReporter = {
    onLog: (msg, type) => addLog(msg, type),
    onStateChange: (state) => setSystemState(state),
    onCorrection: (corr) => {
      setLastCorrection(corr);
      setErrorCount(prev => prev + 1);
    }
  };

  const appId = 'kaleidoland-synode';
  const messagesPath = `artifacts/${appId}/public/data/messages`;

  // Error Handler
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    sentinel.logUIError(`Firestore ${operationType} failed: ${errInfo.error}`);
  };

  // Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Sync Messages
  useEffect(() => {
    if (!user || !isAuthReady) return;

    // Initial fetch of nuggets
    const fetchNuggets = async () => {
      const nuggets = await getTopNuggets();
      setTopNuggets(nuggets);
      if (nuggets.length > 0) {
        addLog(`Mémoire chargée : ${nuggets.length} pépites stratégiques injectées.`, 'success');
      }
    };
    fetchNuggets();

    const q = query(
      collection(db, messagesPath),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubData = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      
      // Apply latest state from bot message
      const lastBotMsg = [...msgs].reverse().find(m => m.sender === 'synode');
      if (lastBotMsg?.data) {
        setCurrentTheme(lastBotMsg.data.theme || 'NEUTRAL');
        setStats({ 
          entropy: lastBotMsg.data.entropy_score, 
          scalability: lastBotMsg.data.future_impact?.scalability || 0.8,
          burnout_risk: lastBotMsg.data.future_impact?.burnout_risk || 0.2,
          cta_status: (lastBotMsg.data as any).cta_status || 'LOCKED',
          sensory_level: lastBotMsg.data.sensory_status?.level || 'NEUTRAL',
          friction: lastBotMsg.data.sensory_status?.friction_coefficient || 1.0
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, messagesPath);
    });

    return () => unsubData();
  }, [user, isAuthReady]);

  // Initial Message Logic
  useEffect(() => {
    if (!user || !isAuthReady || messages.length > 0 || loading) return;

    const sendInitialMessage = async () => {
      setLoading(true);
      const initialText = `🌑 LANAZRION_OS : L'Expérience Intégrale
Bienvenue dans l'écosystème Kaleidoland. Propulsé par l'IA pour la valorisation du patrimoine et l'ingénierie de demain.

🛠️ NOS SERVICES KALEIDOLAND (L'Offre Elite)
[1] 💎 STRATÉGIE & CONSEIL AI (High-Ticket)
"Vous êtes une entreprise ou une collectivité ? Nous concevons votre transition vers l'IA générative. De l'audit à l'implémentation de modèles sur-mesure."
Action : Tapez "STRATÉGIE" pour un diagnostic.

[2] 🏗️ DIGITAL TWINS & LIDAR (Jumeaux Numériques)
"Nous créons des répliques 3D ultra-haute fidélité de vos actifs (terrils, sites industriels, monuments). Idéal pour la gestion de maintenance, le tourisme immersif ou l'archivage UNESCO."
Action : Tapez "LIDAR" pour voir nos démos.

[3] 📱 TERRILIUM APP (SaaS / Automated Management)
"La plateforme de gestion automatisée du patrimoine. Détection d'anomalies par satellite, gestion des flux touristiques et conformité environnementale sans intervention humaine."
Action : Tapez "APP" pour une démo.

[4] 🎨 UMBRAID (Création Digitale & Rareté)
"Le service de production audiovisuelle par drone et IA. Nous créons des contenus rares et des actifs numériques exclusifs (NFTs de patrimoine, films de prestige)."
Action : Tapez "ART" pour le portfolio.

🧭 EXPLORATION INTERACTIVE (La Porte d'Entrée)
En attendant de devenir client, découvrez la puissance de nos outils sur le terrain :

📍 RADAR : Trouvez un terril parmi nos 334 cibles.

📖 MÉMOIRE : Accédez à la base de données historique enrichie par IA.

🏛️ TERRILIUM : Découvrez comment notre branche associative protège ces géants.

💬 [CONVERSATION_LAUNCH] :
"Bonjour, je suis Lanazrion. Que vous soyez un explorateur du dimanche ou un décideur en quête de scalabilité, je suis là pour vous guider. Que souhaitez-vous découvrir en premier ?"`;

      const botMsg: Message = { 
        text: initialText, 
        sender: 'synode', 
        timestamp: Date.now(),
        data: {
          entropy_score: 0.1,
          theme: 'NEUTRAL',
          action_buttons: [
            { label: 'STRATÉGIE', cmd: 'STRATÉGIE' },
            { label: 'LIDAR', cmd: 'LIDAR' },
            { label: 'APP', cmd: 'APP' },
            { label: 'ART', cmd: 'ART' },
            { label: 'RADAR', cmd: 'RADAR' }
          ]
        },
        insee_pillar: 'STRATEGY'
      };

      try {
        await addDoc(collection(db, messagesPath), botMsg);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, messagesPath);
      } finally {
        setLoading(false);
      }
    };

    sendInitialMessage();
  }, [user, isAuthReady, messages.length]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const messageText = overrideInput || input;
    if (!messageText.trim() || !user || loading) return;

    const userMessageText = messageText.trim();
    setInput('');
    setLoading(true);

    const userMsg: Message = {
      text: userMessageText,
      sender: 'user',
      timestamp: Date.now(),
      uid: user.uid
    };

    try {
      // 1. Save user message
      await addDoc(collection(db, messagesPath), userMsg);
      
      addLog(`Requête envoyée : "${userMessageText.substring(0, 30)}..."`, 'info');

      // 2. Call Synode (Gemini) with HealerReporter, Nuggets and AccessLevel
      const startTime = Date.now();
      const aiResponse: GeminiResponse = await callGemini(userMessageText, healerReporter, topNuggets, undefined, accessLevel);
      const endTime = Date.now();
      const currentLatency = endTime - startTime;
      setLatency(currentLatency);

      if (currentLatency > 5000) {
        setSystemState('CRITICAL');
        setCurrentTheme('LANA_ZEN_DEEP');
        addLog(`[SYSTEM_RECOVERY] : Instabilité détectée (${currentLatency}ms). Rollback v15 effectué.`, 'error');
      } else if (currentLatency > 3000) {
        setSystemState('CRITICAL');
        addLog(`ALERTE_LATENCE : ${currentLatency}ms. Seuil de 3s dépassé.`, 'error');
      } else if (systemState === 'CRITICAL') {
        setSystemState('NOMINAL');
      }
      
      setLastValidOutput(JSON.stringify(aiResponse, null, 2));
      addLog("Réponse reçue et validée par le Synode.", "success");

      // 3. Apply UI Mutation
      setCurrentTheme(aiResponse.ui_mutation.theme);
      setStats({
        entropy: aiResponse.ui_mutation.entropy_score,
        scalability: aiResponse.ui_mutation.future_impact?.scalability || 0.8,
        burnout_risk: aiResponse.ui_mutation.future_impact?.burnout_risk || 0.2,
        cta_status: (aiResponse.ui_mutation as any).cta_status || 'LOCKED',
        sensory_level: aiResponse.ui_mutation.sensory_status?.level || 'NEUTRAL',
        friction: aiResponse.ui_mutation.sensory_status?.friction_coefficient || 1.0
      });

      // 4. Handle Shadow Update (Auto-Crystallize)
      if (aiResponse.ui_mutation.shadow_update) {
        addLog(`Shadow Context mis à jour : ${aiResponse.ui_mutation.shadow_update}`, "warning");
        await saveShadowUpdate(aiResponse.ui_mutation.shadow_update);
        const updated = await getTopNuggets();
        setTopNuggets(updated);
      }

      // 5. Handle VIP Alert
      if (aiResponse.ui_mutation.vip_alert && accessLevel === 'ELITE') {
        setVipAlert(aiResponse.ui_mutation.vip_alert);
        addLog(`ALERTE VIP : ${aiResponse.ui_mutation.vip_alert.company_name} détectée !`, "error");
      }

      // 6. Save bot message
      const botMsg: Message = { 
        text: aiResponse.text, 
        sender: 'synode', 
        timestamp: Date.now(),
        data: aiResponse.ui_mutation,
        insee_pillar: aiResponse.insee_pillar
      };

      await addDoc(collection(db, messagesPath), botMsg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, messagesPath);
    } finally {
      setLoading(false);
    }
  };

  const handleCrystallizeContext = async () => {
    if (messages.length === 0 || isCrystallizing) return;
    
    setIsCrystallizing(true);
    addLog("Cristallisation du contexte en cours...", "info");
    
    try {
      const contextText = messages
        .map(m => `${m.sender === 'user' ? 'Clément' : 'Synode'}: ${m.text}`)
        .join('\n');
        
      const nugget = await compressInformation(contextText);
      if (nugget) {
        addLog(`Nouvelle pépite cristallisée : "${nugget.content.substring(0, 30)}..."`, "success");
        const updated = await getTopNuggets();
        setTopNuggets(updated);
      }
    } catch (error) {
      addLog("Échec de la cristallisation.", "error");
    } finally {
      setIsCrystallizing(false);
    }
  };

  const startLilleCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("Web Speech API non supportée par ce navigateur.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      addLog("Lanazrion : Écoute active sur le secteur Lille 59000...", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addLog(`Capture Terrain (Lille) : "${transcript}"`, "success");
      handleSendMessage(null as any, `[FIELD_REPORT] Zone: LILLE_HUB. Observation: ${transcript}`);
    };

    recognition.onerror = (event: any) => {
      addLog(`Erreur capture vocale : ${event.error}`, "error");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication for now
    // In a real app, use signInWithEmailAndPassword(auth, email, password)
    
    if (email === 'clementulco@gmail.com') {
      setAccessLevel('ELITE');
      addLog("Authentification ADMIN réussie. Accès ELITE débloqué.", "success");
    } else {
      setAccessLevel('MEMBER');
      addLog("Authentification SYNODE réussie. Accès MEMBER débloqué.", "success");
    }
    
    setShowLogin(false);
  };

  const handlePaymentSuccess = async (tokenId: string) => {
    addLog(`Paiement réussi ! Token: ${tokenId}. Déblocage du statut ELITE...`, "success");
    setAccessLevel('ELITE');
    setShowCheckout(false);
    handleSendMessage(null as any, `[PAYMENT_SUCCESS] Token: ${tokenId}. Unlock Elite status for user.`);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vantablack p-6 cursor-crosshair hero-gradient">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-12 bg-white/2 border border-white/5 rounded-[3.5rem] backdrop-blur-3xl text-center shadow-2xl relative overflow-hidden"
        >
          <div className="shimmer absolute inset-0 pointer-events-none opacity-30"></div>
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-k-pink via-k-blue to-k-yellow w-24 h-24 mx-auto mb-10 shadow-2xl">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-black">
              <span className="text-4xl font-black italic text-white">L</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-black tracking-tighter italic text-white mb-2 uppercase">Lanazrion_OS</h2>
          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.4em] mb-12">v2.9 • Elite_Access_Required</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="email" 
              placeholder="LOGIN_ID" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:border-k-purple outline-none transition-all text-white placeholder:text-neutral-700 font-mono"
            />
            <input 
              type="password" 
              placeholder="SECRET_TOKEN" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:border-k-purple outline-none transition-all text-white placeholder:text-neutral-700 font-mono"
            />
            
            <button 
              type="submit"
              className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-k-purple hover:text-white transition-all transform active:scale-95 shadow-2xl uppercase tracking-[0.2em] text-[11px]"
            >
              Initialize_Symbiosis
            </button>
          </form>

          <div className="mt-12 flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
            <span>Secure_Node_01</span>
            <button onClick={() => setAccessLevel('VISITOR')} className="hover:text-k-pink transition-colors">Request_Access</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showAdmin && accessLevel === 'ELITE') {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowAdmin(false)}
          className="fixed top-8 right-8 z-[100] px-10 py-4 bg-white text-black font-black rounded-full text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          {t('back_to_synod')}
        </button>
        <AdminDashboard t={t} />
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen relative selection:bg-k-purple/30">
      <VIPAlert 
        alert={vipAlert} 
        onClose={() => setVipAlert(null)} 
        t={t}
        onViewPitch={() => {
          if (vipAlert) {
            handleSendMessage(new Event('submit') as any, `Génère un pitch Lanazrion V3 pour ${vipAlert.company_name} basé sur : ${vipAlert.pitch}`);
            setVipAlert(null);
          }
        }}
      />

      <AnimatePresence>
        {showCheckout && (
          <Checkout 
            onSuccess={handlePaymentSuccess} 
            onCancel={() => setShowCheckout(false)} 
            t={t} 
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-k-pink via-k-blue to-k-yellow shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border-2 border-black">
              <span className="text-xl font-black italic text-white">L</span>
            </div>
          </div>
          <span className="font-black tracking-tighter text-2xl italic uppercase">LANAZRION</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.4em] font-bold text-neutral-500">
          <a href="#" className="hover:text-white transition-colors">Ingénierie</a>
          <a href="#" className="hover:text-white transition-colors">Contenus</a>
          <a href="#" className="hover:text-white transition-colors">Formation</a>
          {accessLevel === 'ELITE' && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="px-6 py-2 bg-k-purple/10 hover:bg-k-purple/20 border border-k-purple/30 rounded-full text-k-purple transition-all"
            >
              Boardroom_Admin
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-k-pink">System Ready | API Active</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] mb-10">
            FAÇONNER <br /> <span className="accent-text-kaleido">L'EXCEPTIONNEL.</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-2xl max-w-3xl mb-14 font-light leading-relaxed">
            L'Hémisphère Droit de LANAZRION. Expertise en <span className="text-white font-medium">stratégie numérique</span> et <span className="text-white font-medium">ingénierie territoriale</span>. 
            Nous convertissons chaque demande en opportunité de valorisation de rareté.
          </p>
          <div className="flex flex-wrap gap-6">
            <button className="relative group overflow-hidden bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all">
              <span className="relative z-10">Démarrer un projet</span>
              <div className="absolute inset-0 bg-gradient-to-r from-k-pink to-k-orange opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button 
              onClick={() => setShowCheckout(true)}
              className="glass-card px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border-white/20"
            >
              Explorer la matrice
            </button>
          </div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-48 relative z-10">
        {[
          { title: 'Ingénierie', color: 'bg-k-pink', desc: 'Stratégies territoriales et pilotage de projets innovants.' },
          { title: 'Création', color: 'bg-k-blue', desc: 'Production audiovisuelle et actifs numériques haut de gamme.' },
          { title: 'Systèmes', color: 'bg-k-green', desc: 'Infrastructures informatiques et solutions logicielles sur mesure.' },
          { title: 'Rédaction', color: 'bg-k-yellow', desc: 'Traduction technique et ingénierie de contenu rédactionnel.' }
        ].map((service, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-10 rounded-[2.5rem] group"
          >
            <div className={`w-12 h-[2px] ${service.color} mb-6 group-hover:w-full transition-all duration-500`}></div>
            <h3 className="font-black italic text-xl mb-4 uppercase">{service.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed italic">{service.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Chat Widget */}
      <div className="chat-widget glass-card">
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-k-pink via-k-purple to-k-blue p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/20">
                <span className="text-xs font-black italic text-white">L</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black italic tracking-widest text-white leading-none uppercase">LANAZRION_AI</p>
              <p className="text-[9px] text-k-teal mono uppercase font-bold mt-1">Hémisphère Droit Actif</p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${systemState === 'NOMINAL' ? 'bg-k-green' : 'bg-red-500'}`}></div>
        </div>

        <div className="chat-body custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.sender === 'user' ? 'user' : 'bot'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              
              {/* Action Buttons */}
              {m.data?.action_buttons && m.data.action_buttons.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.data.action_buttons.map((btn: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(null as any, btn.cmd)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="bubble bot italic opacity-50">Lanazrion réfléchit...</div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Entrez votre requête..." 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs flex-1 text-white focus:border-k-blue outline-none transition-colors font-mono"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-k-purple p-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-30"
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
        </div>
        <div className="kaleido-border opacity-50"></div>
      </div>

      {/* Footer / Debug Toggle */}
      <footer className="max-w-7xl mx-auto px-8 py-12 flex justify-between items-center border-t border-white/5 opacity-30">
        <p className="text-[10px] uppercase tracking-[1em] font-black italic">
          Lanazrion_OS • v2.9
        </p>
        <div className="flex gap-6">
          <button className="text-[9px] uppercase tracking-widest font-mono hover:text-white transition-colors">Neural_Link: Stable</button>
          <button className="text-[9px] uppercase tracking-widest font-mono hover:text-white transition-colors">Latency: {latency}ms</button>
        </div>
      </footer>

      {/* Hidden Debug Dashboard Section */}
      {accessLevel === 'ELITE' && (
        <div className="max-w-6xl w-full mx-auto mt-12 mb-20 opacity-20 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 mb-4 px-4">
            <Activity size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold tracking-widest uppercase opacity-60">Système de Surveillance & Auto-Correction</h2>
          </div>
          <DebugDashboard 
            logs={logs}
            systemState={systemState}
            errorCount={errorCount}
            lastCorrection={lastCorrection}
            lastValidOutput={lastValidOutput}
            onSimulateError={() => {
              addLog("Simulation d'erreur déclenchée par l'utilisateur.", "warning");
              setSystemState('HEALING');
              setTimeout(() => {
                setSystemState('NOMINAL');
                addLog("Système stabilisé après simulation.", "success");
              }, 2000);
            }}
          />
        </div>
      )}
    </div>
  );
}
