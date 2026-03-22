import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Share2, 
  Layers, 
  Zap, 
  CheckCircle2, 
  BarChart,
  ArrowUpRight,
  Database,
  Link2,
  History
} from 'lucide-react';
import { SemanticCluster, generateCluster, getUserClusters } from '../services/seoService';

interface SemanticOracleProps {
  uid: string;
}

const SemanticOracle: React.FC<SemanticOracleProps> = ({ uid }) => {
  const [keyword, setKeyword] = useState("");
  const [depth, setDepth] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentCluster, setCurrentCluster] = useState<SemanticCluster | null>(null);
  const [history, setHistory] = useState<SemanticCluster[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (uid) {
      fetchHistory();
    }
  }, [uid]);

  const fetchHistory = async () => {
    const clusters = await getUserClusters(uid);
    setHistory(clusters);
    if (clusters.length > 0 && !currentCluster) {
      setCurrentCluster(clusters[0]);
    }
  };

  const runAnalysis = async () => {
    if (!keyword || analyzing) return;
    setAnalyzing(true);
    try {
      const cluster = await generateCluster(keyword, depth, uid);
      if (cluster) {
        setCurrentCluster(cluster);
        setHistory(prev => [cluster, ...prev].slice(0, 10));
        setKeyword("");
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#050505] text-white p-8 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Vision SYMBIOSIS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] tracking-[0.4em] uppercase">
              <Database size={14} />
              Protocol Semantic_Oracle v4.0
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent uppercase italic">
              SEO_Exponential
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <History size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Historique</p>
                <p className="text-sm font-mono font-bold">{history.length} CLUSTERS</p>
              </div>
            </button>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Indexation Globale</p>
                <p className="text-xl font-mono font-bold">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {showHistory && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {history.map((h) => (
              <button 
                key={h.id}
                onClick={() => {
                  setCurrentCluster(h);
                  setShowHistory(false);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${currentCluster?.id === h.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">{new Date(h.timestamp).toLocaleDateString()}</p>
                <p className="font-bold text-sm truncate">{h.pillar}</p>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input & Control Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full"></div>
              
              <h2 className="text-sm font-bold mb-8 uppercase tracking-widest text-neutral-400">Graine Sémantique</h2>
              
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Saisir le concept maître..."
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-neutral-700 text-emerald-100"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                  />
                  <Search className="absolute right-5 top-4 text-neutral-600" size={18} />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Profondeur de Silo</label>
                    <span className="text-xs font-mono text-emerald-400">Niveau {depth}</span>
                  </div>
                  <input 
                    type="range" min="1" max="5"
                    className="w-full accent-emerald-500 h-1 bg-white/5 rounded-full"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                  />
                </div>

                <button 
                  onClick={runAnalysis}
                  disabled={!keyword || analyzing}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    analyzing ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {analyzing ? 'CALCUL DU GRAPH...' : 'GÉNÉRER L\'AUTORITÉ'}
                  {!analyzing && <Zap size={16} fill="currentColor" />}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900/20 p-6 rounded-3xl border border-white/5">
                <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Backlinks Requis</p>
                <p className="text-2xl font-mono font-bold">{currentCluster ? Math.round(currentCluster.authorityScore * 142) : '---'}</p>
              </div>
              <div className="bg-neutral-900/20 p-6 rounded-3xl border border-white/5">
                <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">ROI Temps/Gain</p>
                <p className="text-2xl font-mono font-bold text-emerald-400">{currentCluster ? (currentCluster.authorityScore / 10).toFixed(1) : '---'}x</p>
              </div>
            </div>
          </div>

          {/* Visualization & Strategy */}
          <div className="lg:col-span-8 space-y-6">
            {!currentCluster ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center">
                <div className="bg-white/5 p-6 rounded-full mb-6">
                  <Layers size={40} className="text-neutral-700" />
                </div>
                <h3 className="text-xl font-bold text-neutral-400">En attente de data...</h3>
                <p className="text-sm text-neutral-600 mt-2 max-w-xs text-balance">
                  Entre un concept maître pour débloquer la structure de ton empire de contenu.
                </p>
              </div>
            ) : (
              <>
                {/* Cluster Map Overlay */}
                <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden min-h-[500px]">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Architecture en Grappe</h3>
                      <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20 uppercase">
                        Autorité : {currentCluster.authorityScore}%
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="bg-white text-black p-6 rounded-3xl font-black text-xl shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-12 relative uppercase">
                        {currentCluster.pillar}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        {currentCluster.subClusters.map((sub, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                              <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <p className="text-[11px] font-bold mb-1 truncate">{sub.title}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${sub.weight}%` }}></div>
                              </div>
                              <span className="text-[9px] font-mono text-neutral-500">{sub.weight}%</span>
                            </div>
                            <div className="mt-2 text-[8px] text-neutral-600 uppercase font-bold">
                              {sub.links} Liens internes
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan d'Action SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500 text-black p-8 rounded-[2.5rem] flex flex-col justify-between group cursor-pointer hover:bg-emerald-400 transition-colors">
                    <div>
                      <Share2 size={24} className="mb-4" />
                      <h4 className="font-black text-2xl tracking-tight leading-tight uppercase">Distribuer le Jus Sémantique</h4>
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-8 flex items-center gap-2">
                      Lancer le Netlinking IA <ArrowUpRight size={12} />
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-400" size={18} />
                        <span className="text-xs text-neutral-300 font-medium">Balises JSON-LD optimisées pour SGE</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-400" size={18} />
                        <span className="text-xs text-neutral-300 font-medium">Maillage interne en boucle de renforcement</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-400" size={18} />
                        <span className="text-xs text-neutral-300 font-medium">Score d'Entité {currentCluster.authorityScore}/100</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 size={14} className="text-neutral-500" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Indexation Instantanée</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400">{currentCluster.potentialReach}</span>
                        <BarChart size={18} className="text-neutral-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemanticOracle;
