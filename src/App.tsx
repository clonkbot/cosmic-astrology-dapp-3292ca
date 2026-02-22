import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sparkles, Moon } from 'lucide-react';

import { StarField } from './components/StarField';
import { WalletConnect } from './components/WalletConnect';
import { ProfileCard } from './components/ProfileCard';
import { ActionPanel } from './components/ActionPanel';
import { MatchResults } from './components/MatchResults';
import { ActivityFeed } from './components/ActivityFeed';
import { NetworkBadge } from './components/NetworkBadge';
import { useWeb3 } from './hooks/useWeb3';

interface ProfileData {
  element: number;
  level: number;
  xp: number;
  energy: number;
  luckyNumber: number;
  winStreak: number;
  lastFortune: number;
}

function App() {
  const {
    address,
    chainId,
    isConnecting,
    isCorrectNetwork,
    error: web3Error,
    connect,
    disconnect,
    switchToBase,
    getProfile,
    checkHasProfile,
    createProfile: createProfileOnChain,
    claimDailyFortune: claimFortuneOnChain,
    matchWithAddress: matchOnChain,
    setError,
  } = useWeb3();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [fortuneCooldown, setFortuneCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState({
    profile: false,
    fortune: false,
    match: false,
    data: false,
  });

  // Convex mutations & queries
  const upsertSession = useMutation(api.wallet.upsertSession);
  const logActivity = useMutation(api.wallet.logActivity);
  const saveMatchResult = useMutation(api.wallet.saveMatchResult);
  const matchResults = useQuery(api.wallet.getMatchResults, address ? { walletAddress: address } : 'skip');
  const recentActivity = useQuery(api.wallet.getRecentActivity);

  // Calculate if fortune can be claimed (24h cooldown)
  const canClaimFortune = profile ? (Date.now() / 1000 - profile.lastFortune) >= 86400 : false;

  // Update cooldown timer
  useEffect(() => {
    if (!profile) return;

    const updateCooldown = () => {
      const elapsed = Math.floor(Date.now() / 1000 - profile.lastFortune);
      const remaining = Math.max(0, 86400 - elapsed);
      setFortuneCooldown(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  // Fetch profile data from chain
  const refreshProfile = useCallback(async () => {
    if (!address || !isCorrectNetwork) return;

    setIsLoading(prev => ({ ...prev, data: true }));
    try {
      const hasProf = await checkHasProfile(address);
      setHasProfile(hasProf);

      if (hasProf) {
        const profileData = await getProfile(address);
        if (profileData) {
          setProfile(profileData);
          // Cache in Convex
          await upsertSession({
            walletAddress: address,
            hasProfile: true,
            cachedElement: profileData.element,
            cachedLevel: profileData.level,
            cachedXp: profileData.xp,
            cachedEnergy: profileData.energy,
            cachedLuckyNumber: profileData.luckyNumber,
            cachedWinStreak: profileData.winStreak,
            cachedLastFortune: profileData.lastFortune,
          });
        }
      } else {
        setProfile(null);
        await upsertSession({
          walletAddress: address,
          hasProfile: false,
        });
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, data: false }));
    }
  }, [address, isCorrectNetwork, checkHasProfile, getProfile, upsertSession]);

  // Refresh when connected
  useEffect(() => {
    if (address && isCorrectNetwork) {
      refreshProfile();
    }
  }, [address, isCorrectNetwork, refreshProfile]);

  // Create profile handler
  const handleCreateProfile = async () => {
    if (!address) return;

    setIsLoading(prev => ({ ...prev, profile: true }));
    setError(null);

    try {
      const success = await createProfileOnChain();
      if (success) {
        await logActivity({
          walletAddress: address,
          action: 'profile_created',
          details: 'Created cosmic profile',
        });
        await refreshProfile();
      }
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Claim fortune handler
  const handleClaimFortune = async () => {
    if (!address || !hasProfile) return;

    setIsLoading(prev => ({ ...prev, fortune: true }));
    setError(null);

    try {
      const success = await claimFortuneOnChain();
      if (success) {
        await logActivity({
          walletAddress: address,
          action: 'fortune_claimed',
          details: 'Claimed daily fortune',
        });
        await refreshProfile();
      }
    } finally {
      setIsLoading(prev => ({ ...prev, fortune: false }));
    }
  };

  // Match handler
  const handleMatchAddress = async (otherAddress: string) => {
    if (!address || !hasProfile) return;

    setIsLoading(prev => ({ ...prev, match: true }));
    setError(null);

    try {
      const compatibility = await matchOnChain(otherAddress);
      if (compatibility !== null) {
        await saveMatchResult({
          walletAddress: address,
          matchedWith: otherAddress,
          compatibility,
        });
        await logActivity({
          walletAddress: address,
          action: 'match_found',
          details: `Matched with ${otherAddress.slice(0, 6)}...${otherAddress.slice(-4)} (${compatibility}%)`,
        });
      }
    } finally {
      setIsLoading(prev => ({ ...prev, match: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a051e] text-white overflow-x-hidden">
      <StarField />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Moon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl text-white">Cosmic Astrology</h1>
              <p className="text-purple-300/60 text-xs md:text-sm">On-chain zodiac magic</p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {address && (
              <>
                <NetworkBadge
                  chainId={chainId}
                  isCorrectNetwork={isCorrectNetwork}
                  onSwitchNetwork={switchToBase}
                />
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={disconnect}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-purple-500/20 rounded-xl text-purple-300 text-sm transition-colors min-h-[40px]"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </motion.button>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!address ? (
            <WalletConnect
              onConnect={connect}
              isConnecting={isConnecting}
              error={web3Error}
            />
          ) : !isCorrectNetwork ? (
            <motion.div
              key="wrong-network"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-amber-400" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white mb-4">Wrong Network</h2>
              <p className="text-purple-200/60 mb-6 text-sm md:text-base">Please switch to Base mainnet to continue</p>
              <motion.button
                onClick={switchToBase}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-semibold min-h-[56px]"
              >
                Switch to Base
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {/* Left Column - Profile & Actions */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {hasProfile && profile && (
                  <ProfileCard profile={profile} address={address} />
                )}

                <ActionPanel
                  hasProfile={hasProfile}
                  canClaimFortune={canClaimFortune}
                  fortuneCooldown={fortuneCooldown}
                  onCreateProfile={handleCreateProfile}
                  onClaimFortune={handleClaimFortune}
                  onMatchAddress={handleMatchAddress}
                  isLoading={isLoading}
                />

                {web3Error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                  >
                    {web3Error}
                  </motion.div>
                )}
              </div>

              {/* Right Column - Match Results & Activity */}
              <div className="space-y-4 md:space-y-6">
                {matchResults && matchResults.length > 0 && (
                  <MatchResults results={matchResults} />
                )}
                {recentActivity && recentActivity.length > 0 && (
                  <ActivityFeed activities={recentActivity} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 md:mt-20 py-6 border-t border-purple-500/10 text-center">
          <p className="text-purple-300/40 text-xs md:text-sm">
            Requested by{' '}
            <a href="https://twitter.com/jianke2" className="hover:text-purple-300 transition-colors">
              @jianke2
            </a>
            {' '}·{' '}
            Built by{' '}
            <a href="https://twitter.com/clonkbot" className="hover:text-purple-300 transition-colors">
              @clonkbot
            </a>
          </p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .font-display {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
        }

        body {
          font-family: 'Outfit', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;
