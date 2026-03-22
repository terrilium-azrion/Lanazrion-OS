import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Shield, Brain, RefreshCw, X, Terminal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { sentinel } from '../services/SentinelWatcher';

interface DiagnosticPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entropyHistory: number[];
  aiThoughts: string[];
  onForceRefresh: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  isOpen,
  onClose,
  entropyHistory,
  aiThoughts,
  onForceRefresh
}) => {
  const [repairLogs, setRepairLogs] = useState(sentinel.getMetrics().repairLogs);

  useEffect(() => {
    const interval = setInterval(() => {
      setRepairLogs([...sentinel.getMetrics().repairLogs]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const chartData = entropyHistory.map((val, i) => ({ value: val, index: i }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-20 right-6 w-80 sm:w-96 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[70vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-bottom border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-solar-orange" />
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Vital Signs Monitor</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Entropy Sparkline */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-tighter text-white/40 flex items-center gap-1">
                <Activity size={10} /> Entropy Stream
              </h3>
              <span className="text-[10px] font-mono text-solar-orange">
                {entropyHistory[entropyHistory.length - 1]?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="h-16 w-full bg-white/5 rounded-lg overflow-hidden border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF6321" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                  <YAxis hide domain={[0, 5]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Repair Stream */}
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-tighter text-white/40 flex items-center gap-1">
              <Shield size={10} /> Repair Stream (Sentinel)
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {repairLogs.length === 0 ? (
                <div className="text-[9px] font-mono text-white/20 italic">No repairs logged...</div>
              ) : (
                repairLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[9px] font-mono leading-tight border-l border-white/10 pl-2 py-1">
                    <span className="text-white/30">[{log.timestamp}]</span>
                    <span className="text-white/80">{log.action}</span>
                    <span className="text-solar-orange/80">[{log.status}]</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AI Thoughts */}
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-tighter text-white/40 flex items-center gap-1">
              <Brain size={10} /> AI Thoughts (ROI Engine)
            </h3>
            <div className="space-y-2">
              {aiThoughts.length === 0 ? (
                <div className="text-[9px] font-mono text-white/20 italic">Awaiting reasoning...</div>
              ) : (
                aiThoughts.slice(-3).reverse().map((thought, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-mono text-white/60 leading-relaxed">
                    <div className="flex items-center gap-1 mb-1 text-white/20">
                      <Terminal size={8} />
                      <span>DECISION_LOG_{aiThoughts.length - i}</span>
                    </div>
                    {thought}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <button
            onClick={onForceRefresh}
            className="w-full py-2 bg-solar-orange hover:bg-solar-orange/80 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,99,33,0.3)]"
          >
            <RefreshCw size={12} />
            Force UI Re-Analysis
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
