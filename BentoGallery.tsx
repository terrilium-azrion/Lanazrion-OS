import React from 'react';
import { motion } from 'framer-motion';

const images = [
  { id: 1, src: '/banniere.png', alt: 'Vision Kaleidoland', span: 'md:col-span-2 md:row-span-2' },
  { id: 2, src: '/tech.png', alt: 'Tech & Innovation', span: 'md:col-span-1 md:row-span-1' },
  { id: 3, src: '/muscle.png', alt: 'Formation & Aide', span: 'md:col-span-1 md:row-span-1' },
  { id: 4, src: '/cerveau.png', alt: 'Stratégie & Conseil', span: 'md:col-span-1 md:row-span-2' },
  { id: 5, src: '/banniere-1.png', alt: 'Accompagnement', span: 'md:col-span-2 md:row-span-1' },
  { id: 6, src: '/chatbot.png', alt: 'IA Humaine', span: 'md:col-span-1 md:row-span-1' },
];

export const BentoGallery = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24" id="gallery">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black mb-4 text-kaleido"
        >
          Nos Réalisations
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Découvrez un aperçu des projets que nous avons accompagnés, de la stratégie à la création pure.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[220px]">
        {images.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: img.id * 0.05 }}
            className={`relative overflow-hidden glass-premium group border-white/10 hover:border-solar-orange/30 transition-all duration-500 shadow-lg hover:shadow-2xl ${img.span} p-0 !rounded-3xl`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-abyssal/90 via-navy-abyssal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-solar-orange mb-2">Projet #{img.id}</span>
              <h3 className="text-white font-black text-xl leading-tight tracking-tight uppercase">{img.alt}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
