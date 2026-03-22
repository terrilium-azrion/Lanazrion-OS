import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

interface VIPAlertProps {
  alert: {
    company_name: string;
    zone: string;
    score: number;
    pitch: string;
    details?: string;
  } | null;
  onClose: () => void;
  onViewPitch: () => void;
  t: (key: string) => string;
}

export default function VIPAlert({ alert, onClose, onViewPitch, t }: VIPAlertProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div 
          initial={{ y: -100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: -100, x: '-50%', opacity: 0 }}
          className="fixed top-10 left-1/2 w-[90%] max-w-sm z-[100]"
        >
          <div className="bg-black/80 backdrop-blur-2xl border-2 border-yellow-500/50 p-5 rounded-[2.5rem] shadow-[0_0_40px_rgba(212,175,55,0.3)] relative overflow-hidden">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl border border-yellow-500/50 bg-neutral-900 flex items-center justify-center">
                  <ShieldAlert className="text-yellow-500" size={24} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-mono text-yellow-500 uppercase tracking-[0.2em] font-bold">{t('vip_alert_title')}</h4>
                <p className="text-sm font-black text-white italic tracking-tight">
                  Cible {Math.round(alert.score * 100)}% détectée : {alert.company_name}
                </p>
                <p className="text-[9px] text-neutral-400 mt-1">
                  {alert.zone} • Secteur SaaS • Scalabilité Totale
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 relative z-10">
              <button 
                onClick={onViewPitch}
                className="flex-1 py-2 bg-white text-black text-[10px] font-black rounded-xl hover:bg-yellow-500 transition-all uppercase tracking-widest"
              >
                {t('view_pitch')}
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-2 bg-neutral-800 text-white text-[10px] font-black rounded-xl uppercase tracking-widest"
              >
                {t('ignore')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
