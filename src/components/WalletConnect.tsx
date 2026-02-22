import { motion } from 'framer-motion';
import { Wallet, Zap, AlertTriangle } from 'lucide-react';

interface WalletConnectProps {
  onConnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

export function WalletConnect({ onConnect, isConnecting, error }: WalletConnectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 60px rgba(99, 102, 241, 0.3)',
            '0 0 100px rgba(168, 85, 247, 0.4)',
            '0 0 60px rgba(99, 102, 241, 0.3)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
          <Wallet className="w-14 h-14 md:w-16 md:h-16 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30"
          style={{ margin: '-10px' }}
        />
      </motion.div>

      <h1 className="font-display text-3xl md:text-5xl text-white text-center mb-4">
        Cosmic Astrology
      </h1>
      <p className="text-purple-200/80 text-center max-w-md mb-8 text-sm md:text-base px-4">
        Connect your Base wallet to discover your celestial profile, claim daily fortunes,
        and find your cosmic match among the stars.
      </p>

      <motion.button
        onClick={onConnect}
        disabled={isConnecting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] min-w-[200px]"
      >
        <span className="relative z-10 flex items-center gap-3">
          {isConnecting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Zap className="w-5 h-5" />
              </motion.div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </>
          )}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        />
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl text-sm max-w-md text-center"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="mt-12 flex items-center gap-3 text-purple-300/60 text-sm">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        <span>Base Network Only</span>
      </div>
    </motion.div>
  );
}
