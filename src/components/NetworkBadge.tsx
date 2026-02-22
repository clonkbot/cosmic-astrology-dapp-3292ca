import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface NetworkBadgeProps {
  chainId: number | null;
  isCorrectNetwork: boolean;
  onSwitchNetwork: () => void;
}

export function NetworkBadge({ chainId, isCorrectNetwork, onSwitchNetwork }: NetworkBadgeProps) {
  const getNetworkName = (id: number | null) => {
    if (!id) return 'Not Connected';
    if (id === 8453) return 'Base';
    if (id === 1) return 'Ethereum';
    if (id === 137) return 'Polygon';
    return `Chain ${id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
          isCorrectNetwork
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {isCorrectNetwork ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        {getNetworkName(chainId)}
      </div>

      {!isCorrectNetwork && chainId && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onSwitchNetwork}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-colors min-h-[40px]"
        >
          <AlertTriangle className="w-4 h-4" />
          Switch to Base
        </motion.button>
      )}
    </motion.div>
  );
}
