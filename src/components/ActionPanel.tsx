import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Users, Sparkles, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ActionPanelProps {
  hasProfile: boolean;
  canClaimFortune: boolean;
  fortuneCooldown: number;
  onCreateProfile: () => Promise<void>;
  onClaimFortune: () => Promise<void>;
  onMatchAddress: (address: string) => Promise<void>;
  isLoading: { profile: boolean; fortune: boolean; match: boolean };
}

export function ActionPanel({
  hasProfile,
  canClaimFortune,
  fortuneCooldown,
  onCreateProfile,
  onClaimFortune,
  onMatchAddress,
  isLoading,
}: ActionPanelProps) {
  const [matchAddress, setMatchAddress] = useState('');
  const [matchError, setMatchError] = useState('');

  const handleMatch = async () => {
    if (!matchAddress || matchAddress.length !== 42) {
      setMatchError('Please enter a valid address');
      return;
    }
    setMatchError('');
    await onMatchAddress(matchAddress);
    setMatchAddress('');
  };

  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Create Profile Button */}
      <AnimatePresence mode="wait">
        {!hasProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-4 md:p-6 border border-purple-500/30"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-display text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Begin Your Journey
                </h3>
                <p className="text-purple-200/60 text-sm">Create your cosmic profile to unlock all features</p>
              </div>
              <motion.button
                onClick={onCreateProfile}
                disabled={isLoading.profile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 min-h-[56px] w-full md:w-auto"
              >
                {isLoading.profile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Profile
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Fortune */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-3xl p-4 md:p-6 border ${
          hasProfile
            ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30'
            : 'bg-slate-900/30 border-slate-700/30 opacity-50'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-display text-white mb-2 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Daily Fortune
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {canClaimFortune && hasProfile ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Available now!
                </span>
              ) : (
                <span className="text-amber-400/60 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {hasProfile ? `Next in ${formatCooldown(fortuneCooldown)}` : 'Create profile first'}
                </span>
              )}
            </div>
          </div>
          <motion.button
            onClick={onClaimFortune}
            disabled={!hasProfile || !canClaimFortune || isLoading.fortune}
            whileHover={{ scale: hasProfile && canClaimFortune ? 1.05 : 1 }}
            whileTap={{ scale: hasProfile && canClaimFortune ? 0.95 : 1 }}
            className={`px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 min-h-[56px] w-full md:w-auto ${
              hasProfile && canClaimFortune
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading.fortune ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sun className="w-5 h-5" />
                Claim Fortune
              </>
            )}
          </motion.button>
        </div>

        {/* Cooldown Progress */}
        {hasProfile && !canClaimFortune && (
          <div className="mt-4">
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(fortuneCooldown / 86400) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Match with Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative overflow-hidden rounded-3xl p-4 md:p-6 border ${
          hasProfile
            ? 'bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/30'
            : 'bg-slate-900/30 border-slate-700/30 opacity-50'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-3xl" />

        <div className="relative">
          <h3 className="text-lg md:text-xl font-display text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Cosmic Match
          </h3>
          <p className="text-pink-200/60 text-sm mb-4">
            {hasProfile ? 'Enter an address to check your compatibility' : 'Create profile first'}
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={matchAddress}
              onChange={(e) => setMatchAddress(e.target.value)}
              placeholder="0x..."
              disabled={!hasProfile}
              className="w-full px-4 py-4 bg-slate-800/50 border border-pink-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 disabled:opacity-50 text-sm md:text-base"
            />
            {matchError && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {matchError}
              </p>
            )}
            <motion.button
              onClick={handleMatch}
              disabled={!hasProfile || isLoading.match}
              whileHover={{ scale: hasProfile ? 1.02 : 1 }}
              whileTap={{ scale: hasProfile ? 0.98 : 1 }}
              className={`px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 min-h-[56px] ${
                hasProfile
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading.match ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Find Match
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
