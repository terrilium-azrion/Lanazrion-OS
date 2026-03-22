import React, { useState, useEffect } from 'react';
import {
  Brain,
  Layers,
  Database,
  TrendingUp,
  Trash2,
  Sparkles,
  Database as DatabaseIcon,
  ChevronRight,
  Zap
} from 'lucide-react';
import { KnowledgeNugget } from '../services/geminiService';
import { getAllNuggets, compressInformation, deleteNugget } from '../services/memoryService';

interface MemoryCompressorProps {
  onNuggetAdded?: () => void;
}

const MemoryCompressor: React.FC<MemoryCompressorProps> = ({ onNuggetAdded }) => {
  const [rawData, setRawData] = useState("");
  const [memoryBank, setMemoryBank] = useState<KnowledgeNugget[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNuggets = async () => {
    setIsLoading(true);
    const nuggets = await getAllNuggets();
    setMemoryBank(nuggets);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNuggets();
  }, []);

  const handleCompress = async () => {
    if (!rawData.trim()) return;
    setIsCompressing(true);
    try {
      const newNugget = await compressInformation(rawData);
      if (newNugget) {
        setMemoryBank(prev => [newNugget, ...prev]);
        setRawData("");
        if (onNuggetAdded) onNuggetAdded();
      }
    } catch (error) {
      console.error("Compression failed", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNugget(id);
    setMemoryBank(prev => prev.filter(n => n.id !== id));
    if (onNuggetAdded) onNuggetAdded();
  };

  return (
    <div className="bg-black text-white p-6 rounded-3xl border border-neutral-800 shadow-2xl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/40">
            <Brain className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight italic uppercase">Context_Compressor_V1</h1>
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-tighter">Optimisation de l'hippocampe numérique • Kaleidoland</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl backdrop-blur-xl">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-4 tracking-widest">Nouvelle Information brute</label>
              <textarea 
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder="Colle ici un compte-rendu, une idée ou un flux de données..."
                className="w-full h-48 bg-black/50 border border-neutral-800 rounded-2xl p-4 text-sm focus:border-blue-500/50 outline-none transition-all resize-none font-mono text-blue-100"
              />
              <button 
                onClick={handleCompress}
                disabled={isCompressing || !rawData}
                className="w-full mt-4 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-colors disabled:opacity-20 group"
              >
                {isCompressing ? <Sparkles className="animate-spin" /> : <Layers size={20} className="group-hover:rotate-12 transition-transform" />}
                <span className="uppercase tracking-tighter">
                  {isCompressing ? "CRISTALLISATION..." : "COMPRESSER EN NUGGET"}
                </span>
              </button>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-2 text-blue-400">
                <TrendingUp size={20} />
                <h3 className="font-bold text-sm uppercase tracking-tight">Efficacité Contextuelle</h3>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                En compressant tes données, nous réduisons la consommation de tokens de 85% tout en augmentant la pertinence des réponses de 40%.
              </p>
            </div>
          </div>

          {/* Memory Bank Area */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <DatabaseIcon size={14} /> Banque de Connaissances
              </h2>
              <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded-full text-neutral-500 font-mono">
                {memoryBank.length} ACTIFS
              </span>
            </div>

            <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-neutral-600 italic text-sm">
                  Synchronisation de la mémoire...
                </div>
              ) : memoryBank.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
                  <Database size={48} className="opacity-10" />
                  <p className="italic text-sm">Aucune pépite cristallisée</p>
                </div>
              ) : (
                memoryBank.map((nugget) => (
                  <div 
                    key={nugget.id} 
                    className="group bg-neutral-900/30 border border-neutral-800 hover:border-blue-500/30 p-5 rounded-2xl transition-all hover:translate-x-1"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-md border border-neutral-700 uppercase tracking-tighter">
                        {nugget.category}
                      </span>
                      <button 
                        onClick={() => handleDelete(nugget.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                      {nugget.content}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                          style={{ width: `${nugget.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-600">IMPT: {Math.round(nugget.weight * 100)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MemoryCompressor;
