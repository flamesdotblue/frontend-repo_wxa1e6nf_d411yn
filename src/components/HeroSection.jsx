import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

export default function HeroSection({ onBegin }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Ambient gradient aura overlay - non-blocking */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="space-y-6 px-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200">
            The Living Firewall
          </h1>
          <p className="max-w-2xl mx-auto text-indigo-200/80">
            Universal Guard Trust — Futuristic spiritual security. A sentient flame that listens, discerns, and protects.
          </p>

          <motion.button
            onClick={onBegin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 rounded-full bg-white/10 px-8 py-3 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-colors"
          >
            Touch the Flame to Begin
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
