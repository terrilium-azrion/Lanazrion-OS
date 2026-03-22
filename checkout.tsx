import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

interface CheckoutFormProps {
  onSuccess: (tokenId: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

const CheckoutForm = ({ onSuccess, onCancel, t }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      setError(error.message || 'Payment error');
      setProcessing(false);
    } else {
      onSuccess(token.id);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-1 bg-gradient-to-br from-yellow-500/50 to-transparent rounded-[3rem] shadow-2xl">
      <div className="bg-[#080808] p-10 rounded-[2.8rem] border border-white/5 relative">
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{t('checkout_title')}</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">{t('checkout_subtitle')}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-yellow-500">{t('price_elite')}</span>
            <span className="text-xs text-neutral-500 block">{t('per_month')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black/50 p-6 rounded-2xl border border-white/10 text-white shadow-inner">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    '::placeholder': {
                      color: '#444444',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-[9px] text-neutral-600 uppercase font-mono mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t('ssl_active')}
          </div>

          <button
            disabled={!stripe || processing}
            className="w-full py-6 bg-yellow-500 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-yellow-500/20 uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
          >
            {processing ? '...' : t('activate_scalability')}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 opacity-20 grayscale">
          <ShieldCheck size={16} />
          <span className="text-[8px] uppercase tracking-[0.3em]">Lanazrion Secure Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default function Checkout({ onSuccess, onCancel, t }: CheckoutFormProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-xl"
      >
        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} t={t} />
        </Elements>
      </motion.div>
    </div>
  );
}
