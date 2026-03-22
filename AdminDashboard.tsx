import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc,
  doc,
  addDoc,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ExternalLink, 
  Trash2, 
  Rocket, 
  Database, 
  ShieldAlert, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  UserCheck,
  Clock,
  Target,
  Building2,
  Network,
  Radio,
  Palette,
  HeartHandshake,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
  location: string;
  signal: string;
  profitPotential: number;
  status: 'NEW_OPPORTUNITY' | 'CONTACTED' | 'CONVERTED' | 'LIQUIDATED';
  linkedinId?: string;
  timestamp: number;
}

export default function AdminDashboard({ t }: { t: (key: string) => string }) {
  const [activeTab, setActiveTab] = useState<'OPERATIONAL' | 'INVESTOR'>('OPERATIONAL');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [smokeTestStatus, setSmokeTestStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [migrationStatus, setMigrationStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS'>('IDLE');
  const [activeAgent, setActiveAgent] = useState('TAX_STRATEGIST');
  const [showBeacon, setShowBeacon] = useState(false);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const prospectsPath = 'artifacts/kaleidoland-synode/admin/data/prospects';

  useEffect(() => {
    const agents = ['TAX_STRATEGIST', 'LEGAL_COMPLIANCE', 'HIGH_TICKET_CLOSER', 'CHIEF_OF_STAFF', 'CRAWLER_LILLE'];
    let i = 0;
    const interval = setInterval(() => {
      setActiveAgent(agents[i % agents.length]);
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, prospectsPath), orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prospect));
      setProspects(data);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: Prospect['status']) => {
    try {
      await updateDoc(doc(db, prospectsPath, id), { status });
    } catch (err) {
      console.error("Failed to update prospect status:", err);
    }
  };

  const runSmokeTest = async () => {
    setSmokeTestStatus('RUNNING');
    setTimeout(() => {
      const stripeOk = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (stripeOk) {
        setSmokeTestStatus('SUCCESS');
      } else {
        setSmokeTestStatus('FAIL');
      }
    }, 2000);
  };

  const runMigration = async () => {
    setMigrationStatus('RUNNING');
    setTimeout(async () => {
      await addDoc(collection(db, prospectsPath), {
        name: "EuraTech Unicorn Alpha",
        location: "Lille, EuraTechnologies",
        signal: "Levée de fonds imminente détectée via Shadow Context.",
        profitPotential: 0.98,
        status: 'NEW_OPPORTUNITY',
        timestamp: Date.now()
      });
      setMigrationStatus('SUCCESS');
    }, 1500);
  };

  return (
    <>
      <div className="p-8 bg-[#050505] min-h-screen text-white font-sans selection:bg-[#F97316]/30">
      {/* Header & Treasury */}
      <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Boardroom_Admin</h1>
          <div className="flex gap-6 mt-4">
            <button 
              onClick={() => setActiveTab('OPERATIONAL')}
              className={`text-[11px] font-mono uppercase tracking-[0.4em] transition-all relative pb-2 ${activeTab === 'OPERATIONAL' ? 'text-[#D4AF37]' : 'text-neutral-600 hover:text-white'}`}
            >
              Kaleidoland Holding • Operational
              {activeTab === 'OPERATIONAL' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-px bg-[#D4AF37]" />}
            </button>
            <button 
              onClick={() => setActiveTab('INVESTOR')}
              className={`text-[11px] font-mono uppercase tracking-[0.4em] transition-all relative pb-2 ${activeTab === 'INVESTOR' ? 'text-blue-400' : 'text-neutral-600 hover:text-white'}`}
            >
              Investor Relations • White Paper
              {activeTab === 'INVESTOR' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-px bg-blue-400" />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-2 font-bold">Trésorerie_Consolidée (EI)</p>
          <p id="tax-credit" className="text-4xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">+24,850.00€</p>
          <div className="flex gap-3 justify-end mt-3">
            <span className="text-[9px] px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg font-mono font-bold uppercase">Abattement: 34%</span>
            <span className="text-[9px] px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg font-mono font-bold uppercase">TVA: FR_EXCL</span>
          </div>
        </div>
      </div>

      {/* LANAZRION_OS_LAUNCHER_V2.9 Layout */}
      <div className="max-w-7xl mx-auto space-y-10 mb-16">
        <header className="flex justify-between items-center bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] pointer-events-none"></div>
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-[#D4AF37] flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(249,115,22,0.3)] relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-orange-500/20"></div>
              <span className="text-3xl font-black italic text-white relative z-10">L</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-[0.2em] uppercase italic">Lanazrion_OS <span className="text-neutral-600 not-italic ml-2">v2.9_ELITE</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">System_Symbiosis_Alpha_Active</p>
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.4em] font-bold">SESSION: 22_MARCH_2026</p>
            <p className="text-[11px] text-orange-500 font-black mt-1 tracking-widest">SIREN: 993 257 070 (TERRILIUM)</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-10">
            <motion.div 
              whileHover={{ scale: 1.005 }}
              className="relative overflow-hidden bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 group hover:border-[#D4AF37]/40 transition-all duration-700 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-6xl font-black italic tracking-tighter leading-none">KALEIDOLAND</h2>
                <span className="text-[11px] bg-[#D4AF37]/10 text-[#D4AF37] px-5 py-2 rounded-full border border-[#D4AF37]/30 font-black uppercase tracking-[0.3em]">MODE_PROFIT_ELITE</span>
              </div>
              <p className="text-lg text-neutral-400 max-w-xl mb-12 leading-relaxed font-medium">
                Extraction de valeur IP pour <strong className="text-white">Alphabet Inc.</strong> Focus : Automatisation Drone-to-Cloud & Jumeaux numériques du Bassin Minier.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <button className="py-6 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-2xl active:scale-95 relative overflow-hidden group/btn">
                  <span className="relative z-10">Lancer Scan IP</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </button>
                <button className="py-6 bg-white/5 border border-white/10 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95 hover:border-white/20">Audit Scalabilité</button>
              </div>
            </motion.div>

            <div className="bg-white/[0.02] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl">
              <h3 className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.5em] mb-10">Cible_Prioritaire_Dimanche</h3>
              <div className="flex flex-col md:flex-row gap-10 items-center justify-between bg-black/60 p-10 rounded-[3rem] border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <p className="text-[12px] text-orange-500 font-mono font-black mb-3 tracking-[0.3em]">TERRIL ID: 74 & 74A</p>
                  <h4 className="text-3xl font-black italic tracking-tight">Base 11/19 — Loos-en-Gohelle</h4>
                  <p className="text-base text-neutral-500 mt-2 font-medium">Statut: <span className="text-blue-400">UNESCO</span> | Distance: 35 min (Gare Lille-Flandres)</p>
                </div>
                <button className="relative z-10 px-12 py-5 bg-orange-600 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] group-hover:bg-orange-500 transition-all shadow-2xl shadow-orange-900/40 active:scale-95">
                  Générer Mail Mairie
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-10">
            <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-orange-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <h2 className="text-4xl font-black italic mb-10 tracking-tighter">TERRILIUM</h2>
              <div className="space-y-8">
                <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/10 hover:bg-white/[0.06] transition-all group">
                  <p className="text-[11px] text-neutral-500 uppercase font-black tracking-[0.3em] mb-3 group-hover:text-orange-500 transition-colors">Deadline FDVA</p>
                  <p className="text-2xl font-mono font-black text-white">Dans 08 Jours</p>
                </div>
                <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/10 hover:bg-white/[0.06] transition-all group">
                  <p className="text-[11px] text-neutral-500 uppercase font-black tracking-[0.3em] mb-3 group-hover:text-emerald-500 transition-colors">Base Terrils</p>
                  <p className="text-2xl font-mono font-black text-white">334 Entités Mappées</p>
                </div>
              </div>
              <button className="w-full mt-12 py-6 border-2 border-orange-500/50 text-orange-500 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-2xl shadow-orange-900/20">
                Accès Matrix CSV
              </button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 rounded-[4rem] bg-gradient-to-br from-neutral-900/50 to-black border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-[#D4AF37]"></div>
              <p className="text-[11px] text-neutral-600 font-black uppercase mb-8 tracking-[0.4em]">Lanazrion_Challenge</p>
              <p className="text-lg italic text-neutral-300 leading-relaxed font-medium">
                "Clément, si ce n'est pas automatisable à 100%, c'est un hobby. Comment transforme-t-on ta marche sur le 11/19 en un actif IP passif ?"
              </p>
            </motion.div>
          </aside>
        </div>
      </div>

      {activeTab === 'OPERATIONAL' ? (
        <>
          {/* Official Entity Verification */}
          <div className="mb-16 p-12 bg-black/80 border-4 border-double border-[#D4AF37]/30 rounded-[5rem] relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <div className="w-48 h-48 rotate-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-black text-6xl italic">K</div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="text-[#D4AF37]" size={24} />
                <h2 className="text-[11px] font-mono text-[#D4AF37] tracking-[0.6em] uppercase font-black">OFFICIAL_ENTITY_VERIFIED_V2.9</h2>
              </div>
              <h3 className="text-4xl font-black text-white italic mb-10 tracking-tight">KALEIDOLAND OS / ASSET_01_ELITE</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 text-[12px] font-mono">
                <div className="space-y-4">
                  <div className="group">
                    <p className="text-neutral-600 uppercase tracking-widest text-[10px] font-bold">HOLDER:</p>
                    <p className="text-white uppercase text-lg font-black tracking-tight group-hover:text-[#D4AF37] transition-colors">Legrand Clément</p>
                  </div>
                  <div className="group">
                    <p className="text-neutral-600 uppercase tracking-widest text-[10px] font-bold">JURIDICAL_FORM:</p>
                    <p className="text-white uppercase text-lg font-black tracking-tight group-hover:text-[#D4AF37] transition-colors">Entrepreneur Individuel</p>
                  </div>
                </div>
                <div className="space-y-4 border-l border-white/10 pl-12">
                  <div className="group">
                    <p className="text-neutral-600 uppercase tracking-widest text-[10px] font-bold">SIREN:</p>
                    <p className="text-white text-lg font-black tracking-tight group-hover:text-[#D4AF37] transition-colors">102 465 952</p>
                  </div>
                  <div className="group">
                    <p className="text-neutral-600 uppercase tracking-widest text-[10px] font-bold">SCOPE:</p>
                    <p className="text-white uppercase text-lg font-black tracking-tight group-hover:text-[#D4AF37] transition-colors">7490B - Scientific & Tech</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-3xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={16} className="text-[#D4AF37]" />
                  <p className="text-[11px] text-[#D4AF37] font-black uppercase tracking-[0.3em]">Note de l'Hémisphère Droit :</p>
                </div>
                <p className="text-sm leading-relaxed text-neutral-400 font-medium italic">
                  Structure optimisée pour le rachat. Absence de dettes, agilité maximale, 
                  propriété intellectuelle 100% centralisée sur l'EI. 
                  Prêt pour audit technique (VDR Ready).
                </p>
              </div>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 bg-white/[0.02] border border-emerald-500/20 rounded-[3rem] hover:bg-emerald-500/[0.05] transition-all group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
              <div className="flex justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <TrendingUp size={14} /> Tax_Strategist
                </span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium relative z-10">Transition SAS/JEI en cours. Optimisation CIR (30%) & CII (20%) active.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 bg-white/[0.02] border border-blue-500/20 rounded-[3rem] hover:bg-blue-500/[0.05] transition-all group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
              <div className="flex justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <ShieldCheck size={14} /> Compliance_DPO
                </span>
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.8)]"></span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium relative z-10">Conformité DREAL validée. Préparation VDR (Virtual Data Room) pour Alphabet.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 bg-white/[0.02] border border-[#D4AF37]/20 rounded-[3rem] hover:bg-[#D4AF37]/05 transition-all group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
              <div className="flex justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] flex items-center gap-3">
                  <Zap size={14} /> High_Ticket_Closer
                </span>
                <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-ping shadow-[0_0_15px_rgba(212,175,55,0.8)]"></span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium relative z-10">Analyse M. Grandfils (Crédit Agricole) terminée. Pitch Financement prêt.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 bg-white/[0.02] border border-purple-500/20 rounded-[3rem] hover:bg-purple-500/[0.05] transition-all group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
              <div className="flex justify-between mb-6 relative z-10">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <UserCheck size={14} /> Chief_of_Staff
                </span>
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"></span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium relative z-10">Briefing 08h00 Lille : Stratégie verrouillée. Filtrage opérationnel OK.</p>
            </motion.div>
          </div>

      {/* Execution Flow Log */}
      <div className="bg-white/[0.02] border border-white/10 rounded-[3.5rem] p-10 mb-16 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <h3 className="text-[11px] font-black mb-10 italic flex items-center gap-3 uppercase tracking-[0.4em] text-neutral-500">
          <Clock size={18} className="text-neutral-600" /> Flux d'Exécution Autonome
        </h3>
        <div className="space-y-6 font-mono text-[12px]">
          <div className="flex gap-6 text-emerald-400 group">
            <span className="opacity-30 group-hover:opacity-100 transition-opacity">[01:45]</span>
            <span className="font-black tracking-widest">SYSTEM:</span>
            <span className="text-neutral-300">Pentest validé. Mode <span className="text-emerald-400 font-black">OMNIPRESENCE_ACTIVE</span>.</span>
          </div>
          <div className="flex gap-6 text-neutral-500 group">
            <span className="opacity-30 group-hover:opacity-100 transition-opacity">[01:46]</span>
            <span className="font-black tracking-widest">TAX_STRATEGIST:</span>
            <span className="text-neutral-400">Simulation subventions FDVA & JEP terminée. <span className="text-white font-black">+10,600€</span> identifiés.</span>
          </div>
          <div className="flex gap-6 text-[#D4AF37] group">
            <span className="opacity-30 group-hover:opacity-100 transition-opacity">[01:47]</span>
            <span className="font-black tracking-widest">CLOSER:</span>
            <span className="text-neutral-300">Veille Territoriale : Bassin Minier & EuraTech. <span className="text-[#D4AF37] font-black">12 opportunités</span> détectées.</span>
          </div>
          <div className="flex gap-6 text-blue-400 group">
            <span className="opacity-30 group-hover:opacity-100 transition-opacity">[01:48]</span>
            <span className="font-black tracking-widest">COMPLIANCE:</span>
            <span className="text-neutral-400">VDR_ALPHABET: Indexation des brevets "Symbiosis Alpha" en cours (<span className="text-blue-400 font-black">65%</span>).</span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Veille Territoriale / Crawler Lille & Bassin Minier</h2>
        <div className="flex gap-6">
          <button 
            onClick={runSmokeTest}
            disabled={smokeTestStatus === 'RUNNING'}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border shadow-2xl ${
              smokeTestStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-900/20' :
              smokeTestStatus === 'FAIL' ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-red-900/20' :
              'bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20'
            }`}
          >
            <Rocket size={16} /> {smokeTestStatus === 'RUNNING' ? 'Testing...' : 'Smoke Test'}
          </button>
          <button 
            onClick={runMigration}
            disabled={migrationStatus === 'RUNNING'}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border shadow-2xl ${
              migrationStatus === 'SUCCESS' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-blue-900/20' :
              'bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20'
            }`}
          >
            <Database size={16} /> {migrationStatus === 'RUNNING' ? 'Syncing...' : 'Data Sync'}
          </button>
        </div>
      </div>

      {smokeTestStatus === 'FAIL' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-8 bg-red-500/10 border border-red-500/30 rounded-[3rem] flex items-center gap-6 text-red-400 shadow-2xl shadow-red-900/20"
        >
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] font-black">
            CRITICAL_FAILURE: VITE_STRIPE_PUBLIC_KEY IS MISSING. ROLLBACK RECOMMENDED.
          </div>
        </motion.div>
      )}

      {/* Prospect Table */}
      <div className="overflow-x-auto bg-white/[0.01] border border-white/5 rounded-[4rem] backdrop-blur-3xl mb-16 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-neutral-600 uppercase tracking-[0.4em] font-black">
              <th className="p-10">Structure</th>
              <th className="p-10">Signal Faible</th>
              <th className="p-10">Potentiel Profit</th>
              <th className="p-10">Statut</th>
              <th className="p-10 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-24 text-center text-neutral-700 italic font-medium text-lg">
                  Aucun prospect identifié. Le crawler scanne le secteur Lille 59000...
                </td>
              </tr>
            ) : (
              prospects.map((prospect) => (
                <motion.tr 
                  key={prospect.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-all group"
                >
                  <td className="p-10">
                    <p className="font-black text-white text-lg tracking-tight">{prospect.name}</p>
                    <span className="block text-[11px] text-neutral-500 font-bold mt-1 uppercase tracking-widest">{prospect.location}</span>
                  </td>
                  <td className="p-10 text-neutral-400 font-mono text-[12px] max-w-xs leading-relaxed italic">
                    {prospect.signal}
                  </td>
                  <td className="p-10">
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-2xl tracking-tighter ${prospect.profitPotential > 0.8 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {Math.round(prospect.profitPotential * 100)}%
                      </span>
                      <div className="w-24 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${prospect.profitPotential * 100}%` }}
                          className={`h-full shadow-[0_0_10px_currentColor] ${prospect.profitPotential > 0.8 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-10">
                    <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] border shadow-lg ${
                      prospect.status === 'NEW_OPPORTUNITY' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-900/10' :
                      prospect.status === 'CONTACTED' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-yellow-900/10' :
                      prospect.status === 'CONVERTED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-900/10' :
                      'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-900/10'
                    }`}>
                      {prospect.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-10">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => updateStatus(prospect.id, 'CONTACTED')}
                        className="p-4 bg-white/[0.05] hover:bg-white/[0.1] rounded-2xl text-white transition-all hover:scale-110 active:scale-90"
                        title="Marquer comme contacté"
                      >
                        <Activity size={18} />
                      </button>
                      {prospect.linkedinId && (
                        <a 
                          href={`https://linkedin.com/in/${prospect.linkedinId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-4 bg-blue-600/10 hover:bg-blue-600/20 rounded-2xl text-blue-400 transition-all hover:scale-110 active:scale-90"
                          title="Voir LinkedIn"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      <button 
                        onClick={() => updateStatus(prospect.id, 'LIQUIDATED')}
                        className="p-4 bg-red-600/10 hover:bg-red-600/20 rounded-2xl text-red-400 transition-all hover:scale-110 active:scale-90"
                        title="Liquider l'opportunité"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Terril Database (Baserow Sync) */}
      <div className="mt-16 bg-white/[0.01] border border-emerald-500/20 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-emerald-500/[0.02]">
          <h3 className="text-[11px] font-black text-emerald-400 italic flex items-center gap-3 uppercase tracking-[0.4em]">
            <Database size={18} /> TERRIL_DATABASE (BASEROW_SYNC)
          </h3>
          <span className="text-[10px] px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono font-bold">200+ SITES INDEXÉS</span>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-[#050505] text-neutral-600 uppercase font-black tracking-widest border-b border-white/5">
              <tr>
                <th className="p-6">Terril / Site</th>
                <th className="p-6">Commune</th>
                <th className="p-6">Rareté_Index</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <tr className="hover:bg-white/[0.03] transition-all group">
                <td className="p-6">
                  <p className="font-black text-white text-base tracking-tight">Terril 74 — 11-19 de Lens Est</p>
                  <p className="text-[10px] text-neutral-600 font-mono mt-1 uppercase">UNESCO_SITE_ALPHA</p>
                </td>
                <td className="p-6 text-neutral-400 font-medium italic">Loos-en-Gohelle</td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/[0.05] h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '95%' }}
                        className="bg-emerald-500 h-full shadow-[0_0_15px_#10b981]"
                      />
                    </div>
                    <span className="text-emerald-400 font-black font-mono">95%</span>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <button className="px-6 py-2 bg-white/[0.05] text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl font-black hover:bg-[#D4AF37] hover:text-black transition-all uppercase tracking-widest text-[10px] active:scale-95">Planifier Drone</button>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.03] transition-all group">
                <td className="p-6">
                  <p className="font-black text-white text-base tracking-tight">Terril 101 — Mare à Goriaux</p>
                  <p className="text-[10px] text-neutral-600 font-mono mt-1 uppercase">PREMIUM_BIODIVERSITY</p>
                </td>
                <td className="p-6 text-neutral-400 font-medium italic">Wallers</td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/[0.05] h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="bg-emerald-500 h-full shadow-[0_0_15px_#10b981]"
                      />
                    </div>
                    <span className="text-emerald-400 font-black font-mono">82%</span>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <button className="px-6 py-2 bg-white/[0.05] text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl font-black hover:bg-[#D4AF37] hover:text-black transition-all uppercase tracking-widest text-[10px] active:scale-95">Planifier Drone</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Itinerary (Logistique Territoriale) */}
      <div className="mt-16 bg-white/[0.01] border border-blue-500/20 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/[0.02] blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="flex justify-between items-start mb-12 relative z-10">
          <div>
            <h3 className="text-sm font-black text-blue-400 italic uppercase tracking-[0.4em]">Logistique_Territoriale</h3>
            <p className="text-[11px] text-neutral-600 font-mono mt-2 font-bold">Optimisation des flux : Lille ↔ Bassin Minier</p>
          </div>
          <div className="px-6 py-2 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-[11px] text-blue-400 font-black animate-pulse flex items-center gap-3">
            <Radio size={14} /> GPS_SIGNAL: LOCKED
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 flex items-center gap-10 hover:bg-white/[0.04] transition-all group">
            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/30 shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-3xl italic font-black text-blue-500">74</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-neutral-600 uppercase font-black tracking-widest mb-2">Cible Prioritaire_Alpha</p>
              <h4 className="text-2xl font-black italic text-white tracking-tight">11-19 de Lens Est</h4>
              <div className="flex gap-6 mt-3">
                <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-2">
                  <Clock size={12} /> 45 min (TER + Marche)
                </span>
                <span className="text-[11px] text-[#D4AF37] font-mono font-bold flex items-center gap-2">
                  <Target size={12} /> POTENTIEL : ÉLEVÉ
                </span>
              </div>
            </div>
            <button className="px-10 py-5 bg-blue-600 text-white text-[12px] font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 uppercase tracking-widest">
              LANCER NAVIGATION
            </button>
          </div>
        </div>
      </div>

      {/* Cultural Intelligence (CULTURAL_STORYTELLING_ENGINE) */}
      <div className="mt-16 bg-white/[0.01] border border-purple-500/20 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/[0.02] blur-[120px] rounded-full -ml-48 -mb-48"></div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h3 className="text-sm font-black text-purple-400 italic uppercase tracking-[0.4em]">CULTURAL_STORYTELLING_ENGINE</h3>
            <p className="text-[11px] text-neutral-600 uppercase font-bold mt-2 tracking-widest">Ancrage Territorial & Références Artistiques</p>
          </div>
          <div className="px-6 py-2 bg-purple-500/10 rounded-full border border-purple-500/30 text-[11px] text-purple-400 font-black tracking-widest uppercase">
            PROMPT_INJECTION: READY
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-6">
            <label className="text-[11px] text-neutral-600 uppercase font-black tracking-[0.3em]">Sélectionner un Site_Patrimonial</label>
            <div className="relative group">
              <select className="w-full bg-black/60 border border-white/10 p-6 rounded-[2rem] text-base text-white focus:border-purple-500 outline-none appearance-none transition-all hover:border-white/20 cursor-pointer">
                <option>Loos-en-Gohelle (11/19)</option>
                <option>Rieulay (Les Argales)</option>
                <option>Oignies (9-9bis)</option>
                <option>Wallers-Arenberg</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-hover:text-purple-400 transition-colors">
                <Activity size={20} />
              </div>
            </div>
          </div>

          <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-[11px] text-purple-400 font-black mb-4 tracking-[0.3em] uppercase">PITCH_SUGGESTION_BY_LANAZRION:</p>
            <p className="text-base italic text-neutral-300 leading-relaxed font-medium">
              "Inscrivons votre projet dans la lignée de 'Racines' de Clément Lesaffre... 
              Utilisons la verticalité des terrils jumeaux pour une captation drone 
              qui dépasse le simple documentaire pour atteindre la poésie visuelle du 11/19."
            </p>
            <button className="mt-8 text-[11px] font-black text-white hover:text-purple-400 transition-all uppercase tracking-[0.3em] flex items-center gap-3 group/btn">
              → COPIER L'ARGUMENTAIRE <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Strategic Exit Radar */}
      <div className="mt-20 p-12 bg-gradient-to-r from-blue-600/[0.05] via-red-600/[0.05] to-yellow-600/[0.05] border border-white/10 rounded-[5rem] backdrop-blur-3xl mb-20 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Strategic_Exit_Radar</h2>
            <p className="text-[11px] text-neutral-600 uppercase tracking-[0.4em] mt-3 font-bold">Cible Prioritaire : <span className="text-white">Alphabet Inc. (Google)</span></p>
          </div>
          <div className="px-6 py-2.5 bg-white/[0.03] rounded-full border border-white/10 text-[11px] font-black font-mono text-blue-400 flex items-center gap-3 shadow-xl">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
            GOOGLE_V_API_CONNECTED
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="text-center group/stat">
            <p className="text-[11px] text-neutral-600 uppercase tracking-[0.4em] mb-4 font-black">Score d'Interopérabilité</p>
            <p className="text-6xl font-black text-white tracking-tighter group-hover/stat:text-blue-400 transition-all duration-500">94.2%</p>
          </div>
          <div className="text-center border-x border-white/10 group/stat">
            <p className="text-[11px] text-neutral-600 uppercase tracking-[0.4em] mb-4 font-black">Valeur de l'IP (Estimation)</p>
            <p className="text-6xl font-black text-[#D4AF37] tracking-tighter group-hover/stat:scale-110 transition-all duration-500 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]">1.2M€ - 4.5M€</p>
          </div>
          <div className="text-center group/stat">
            <p className="text-[11px] text-neutral-600 uppercase tracking-[0.4em] mb-4 font-black">Intérêt Crawler (Googlebot)</p>
            <p className="text-6xl font-black text-emerald-400 tracking-tighter group-hover/stat:animate-pulse transition-all duration-500">HIGH</p>
          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="mt-16 bg-white/[0.01] border border-[#D4AF37]/20 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/[0.05] blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h3 className="text-sm font-black text-[#D4AF37] italic uppercase tracking-[0.4em]">Investor_Relations</h3>
              <p className="text-[11px] text-neutral-600 uppercase font-bold mt-2 tracking-widest">Documentation Stratégique & White Paper</p>
            </div>
            <FileText size={24} className="text-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 flex items-center justify-between group/paper hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
                <FileText size={24} className="text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white italic tracking-tight">Lanazrion_WhitePaper_v2.9.pdf</h4>
                <p className="text-[11px] text-neutral-600 font-mono mt-1 font-bold">Dernière mise à jour : 22 Mars 2026</p>
              </div>
            </div>
            <button className="px-10 py-5 bg-[#D4AF37] text-black text-[12px] font-black rounded-2xl hover:bg-white transition-all shadow-2xl shadow-[#D4AF37]/20 active:scale-95 uppercase tracking-widest">
              CONSULTER LE PDF
            </button>
          </div>
        </div>
      )}

      {/* Terrilium Action Plan Module */}
      <div className="mt-16 bg-white/[0.01] border border-orange-500/20 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/[0.02] blur-[120px] rounded-full -ml-48 -mt-48"></div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h3 className="text-sm font-black text-orange-400 italic uppercase tracking-[0.4em]">Terrilium_Action_Plan</h3>
            <p className="text-[11px] text-neutral-600 uppercase font-bold mt-2 tracking-widest">Déploiement Opérationnel & Patrimoine</p>
          </div>
          <div className="px-6 py-2 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-[11px] text-orange-400 font-black animate-pulse">
            PHASE_01: ACQUISITION_DATA
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-xl font-black text-white italic tracking-tight">Grappes de Proximité</h4>
              <span className="text-[10px] px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full font-bold">STRATÉGIQUE</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              Segmentation des 334 terrils par pôles (Lens, Douai, Valenciennes) pour optimiser les sessions de captation drone.
            </p>
            <button className="w-full py-5 bg-white/[0.05] text-white text-[12px] font-black rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all uppercase tracking-widest">
              VOIR LA CARTE DES PÔLES
            </button>
          </div>

          <div className="p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-xl font-black text-white italic tracking-tight">Contacts Clés UNESCO</h4>
              <span className="text-[10px] px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">RELATIONS</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              Base de données automatisée des décideurs (Mission Bassin Minier, EDEN 62, CEN) pour validation des accès.
            </p>
            <button className="w-full py-5 bg-white/[0.05] text-white text-[12px] font-black rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all uppercase tracking-widest">
              ACCÉDER AU CRM ALPHA
            </button>
          </div>
        </div>
      </div>

      {/* Terril Prospection Engine */}
      <div className="mt-16 bg-white/[0.01] border border-emerald-500/20 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/[0.02] blur-[120px] rounded-full -mr-48 -mb-48"></div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h3 className="text-sm font-black text-emerald-400 italic uppercase tracking-[0.4em]">Terril_Prospection_Engine</h3>
            <p className="text-[11px] text-neutral-600 uppercase font-bold mt-2 tracking-widest">Guidage Laser pour Prospection Terrain</p>
          </div>
          <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-400 font-black flex items-center gap-3">
            <Zap size={14} className="animate-bounce" /> ENGINE: OVERDRIVE
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                <Target size={32} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white italic tracking-tight">Génération de Leads Automatisée</h4>
                <p className="text-[11px] text-neutral-600 font-mono mt-1 font-bold">Ciblage par rareté et accessibilité drone</p>
              </div>
            </div>
            <button className="px-10 py-5 bg-emerald-500 text-black text-[12px] font-black rounded-2xl hover:bg-white transition-all shadow-2xl shadow-emerald-900/40 active:scale-95 uppercase tracking-widest">
              GÉNÉRER NOUVELLE CIBLE
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-32 p-16 bg-red-950/20 border-2 border-red-500/20 rounded-[5rem] backdrop-blur-3xl mb-32 relative overflow-hidden group">
        <div className="absolute inset-0 bg-red-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black italic text-red-500 uppercase tracking-tighter leading-none">System_Rollback_Protocol</h3>
            <p className="text-[11px] text-red-400/60 uppercase tracking-[0.4em] mt-4 font-bold">Attention : Cette action est irréversible et réinitialise l'Hémisphère Droit.</p>
          </div>
          <button 
            onClick={() => setShowRollbackConfirm(true)}
            className="px-16 py-8 bg-red-600 text-white text-sm font-black rounded-[2.5rem] hover:bg-red-500 transition-all shadow-2xl shadow-red-900/40 active:scale-95 uppercase tracking-[0.3em] flex items-center gap-4 group/btn"
          >
            <AlertTriangle size={24} className="group-hover/btn:rotate-12 transition-transform" /> INITIALISER ROLLBACK
          </button>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#050505] border border-red-500/30 p-16 rounded-[4rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.2)]"
          >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mx-auto mb-10">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h2 className="text-4xl font-black italic text-white mb-6 uppercase tracking-tighter">Confirmation_Requise</h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-12">
              Êtes-vous certain de vouloir lancer le protocole [SYSTEM_REFRACTION_V27] ? 
              Toutes les données d'industrialisation seront purgées.
            </p>
            <div className="flex gap-6">
              <button 
                onClick={() => setShowRollbackConfirm(false)}
                className="flex-1 py-6 bg-white/[0.05] text-white font-black rounded-3xl border border-white/10 hover:bg-white/[0.1] transition-all uppercase tracking-widest text-[12px]"
              >
                ANNULER
              </button>
              <button 
                onClick={() => {
                  setLogs([]);
                  setShowRollbackConfirm(false);
                }}
                className="flex-1 py-6 bg-red-600 text-white font-black rounded-3xl hover:bg-red-500 transition-all shadow-2xl shadow-red-900/40 uppercase tracking-widest text-[12px]"
              >
                CONFIRMER ROLLBACK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Omnipresence Live Status */}
      <div className="fixed bottom-12 right-12 z-50">
        <div className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl group hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></span>
            <span className="text-[11px] font-black text-white uppercase tracking-widest">Lanazrion_Live</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-[#D4AF37]" />
            <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest font-mono">CPU: 12%</span>
          </div>
        </div>
      </div>
    </div>

    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      @keyframes brain-border {
        0%, 100% { border-color: rgba(212, 175, 55, 0.2); }
        50% { border-color: rgba(212, 175, 55, 0.6); }
      }
      .animate-brain-border {
        animation: brain-border 4s infinite;
      }
    `}</style>
    </>
  );
}
