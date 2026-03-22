import React from 'react';
import { Terminal, ShieldCheck, Activity, Zap, AlertTriangle, RefreshCw, Bug } from 'lucide-react';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
}

interface DebugDashboardProps {
  logs: LogEntry[];
  systemState: 'NOMINAL' | 'HEALING' | 'CRITICAL';
  errorCount: number;
  lastCorrection: string | null;
  lastValidOutput: string | null;
  onSimulateError?: () => void;
}

const DebugDashboard: React.FC<DebugDashboardProps> = ({ 
  logs, 
  systemState, 
  errorCount, 
  lastCorrection,
  lastValidOutput,
  onSimulateError 
}) => {
  return (
    <div className="bg-slate-950 text-slate-200 p-4 font-mono text-sm border-t border-slate-800">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            SYMBIOSIS_ALPHA : Healer Engine
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest">Surveillance active et auto-réparation des flux AI</p>
        </div>
        {onSimulateError && (
          <button 
            onClick={onSimulateError}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 text-xs"
          >
            <Zap size={14} />
            Lancer Test Résilience
          </button>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${systemState === 'NOMINAL' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'} flex items-center justify-between`}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">État du Healer</p>
            <p className={`text-lg font-bold mt-1 ${systemState === 'NOMINAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {systemState}
            </p>
          </div>
          <div className="p-2 bg-slate-900 rounded-lg">
            {systemState === 'NOMINAL' ? <ShieldCheck className="text-emerald-500" /> : <AlertTriangle className="text-amber-500 animate-pulse" />}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Tentatives de Réparation</p>
            <p className="text-lg font-bold mt-1 text-blue-400">{errorCount} / 3</p>
          </div>
          <div className="p-2 bg-slate-900 rounded-lg">
            <RefreshCw className="text-blue-500" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Modèle Actif</p>
            <p className="text-lg font-bold mt-1 text-purple-400">Gemini 3 Flash</p>
          </div>
          <div className="p-2 bg-slate-900 rounded-lg">
            <Zap className="text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal de Debug */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col h-[400px]">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-slate-400" />
              <span className="font-bold uppercase tracking-widest text-[10px]">System Logs</span>
            </div>
            {onSimulateError && (
              <button 
                onClick={onSimulateError}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] transition-colors uppercase tracking-widest"
              >
                Simuler Erreur
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[11px]">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                <span className="text-slate-600">[{log.timestamp}]</span>
                <span className={`
                  ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                  ${log.type === 'warning' ? 'text-amber-400' : ''}
                  ${log.type === 'success' ? 'text-emerald-400' : ''}
                  ${log.type === 'info' ? 'text-blue-300' : ''}
                `}>
                  {log.message}
                </span>
              </div>
            ))}
            {logs.length === 0 && <div className="text-slate-600 italic">En attente de données...</div>}
          </div>
        </div>

        {/* Last Response Preview */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col h-[400px]">
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Dernier Output Valide</span>
          </div>
          <div className="flex-1 overflow-auto p-4 text-[11px]">
            {lastValidOutput ? (
              <pre className="text-emerald-300 whitespace-pre-wrap">{lastValidOutput}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <AlertTriangle size={32} className="opacity-20" />
                <p className="italic">Aucune donnée en cache</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panneau d'Auto-Amélioration (Optional/Bottom) */}
      <div className="mt-6 bg-slate-900/30 rounded-xl border border-slate-800/50 p-4">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Bug size={16} className="text-purple-400" />
            <h2 className="font-bold text-purple-400 uppercase tracking-tighter">Noyau d'Auto-Optimisation</h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1 font-bold">DERNIÈRE ANALYSE STRUCTURELLE</p>
              <p className="text-xs text-slate-300 italic">
                {lastCorrection || "Aucune anomalie majeure détectée lors des 24 dernières heures."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-bold">PROCHAINES AMÉLIORATIONS PLANIFIÉES</p>
              {[
                { label: "Compression de Payload JSON", progress: 85 },
                { label: "Réduction Latence Inference", progress: 40 },
                { label: "Durcissement Schéma Security", progress: 100 },
              ].map((task, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>{task.label}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200 leading-tight">
                  Attention : Le mode SENTINEL_OVERDRIVE limite actuellement l'auto-déploiement direct sans validation humaine (Clément).
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DebugDashboard;
