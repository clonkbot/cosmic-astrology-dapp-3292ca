import { motion } from 'framer-motion';
import { Flame, Droplets, Wind, Mountain, Sparkles, Zap, Heart, Trophy } from 'lucide-react';

interface ProfileData {
  element: number;
  level: number;
  xp: number;
  energy: number;
  luckyNumber: number;
  winStreak: number;
  lastFortune: number;
}

interface ProfileCardProps {
  profile: ProfileData;
  address: string;
}

const elements = [
  { name: 'Fire', icon: Flame, color: 'from-orange-500 to-red-600', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  { name: 'Water', icon: Droplets, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { name: 'Air', icon: Wind, color: 'from-sky-400 to-indigo-500', bg: 'bg-sky-500/20', text: 'text-sky-400' },
  { name: 'Earth', icon: Mountain, color: 'from-green-500 to-emerald-600', bg: 'bg-green-500/20', text: 'text-green-400' },
];

export function ProfileCard({ profile, address }: ProfileCardProps) {
  const element = elements[profile.element] || elements[0];
  const ElementIcon = element.icon;
  const xpForNextLevel = profile.level * 100;
  const xpProgress = (profile.xp / xpForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 to-purple-900/50 border border-purple-500/20 backdrop-blur-xl"
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${element.color} opacity-10 blur-3xl`} />

      <div className="p-4 md:p-6">
        {/* Header with Element */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${element.color} flex items-center justify-center shadow-lg`}
            >
              <ElementIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </motion.div>
            <div>
              <h2 className={`text-xl md:text-2xl font-display ${element.text}`}>{element.name} Element</h2>
              <p className="text-purple-300/60 text-xs md:text-sm font-mono truncate max-w-[150px] md:max-w-[200px]">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-lg">{profile.winStreak} Streak</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatBox
            icon={<Sparkles className="w-4 h-4" />}
            label="Level"
            value={profile.level.toString()}
            color="text-purple-400"
          />
          <StatBox
            icon={<Zap className="w-4 h-4" />}
            label="Energy"
            value={profile.energy.toString()}
            color="text-yellow-400"
          />
          <StatBox
            icon={<Heart className="w-4 h-4" />}
            label="Lucky #"
            value={profile.luckyNumber.toString()}
            color="text-pink-400"
          />
          <StatBox
            icon={<Trophy className="w-4 h-4" />}
            label="XP"
            value={profile.xp.toString()}
            color="text-cyan-400"
          />
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm text-purple-300/80">
            <span>Progress to Level {profile.level + 1}</span>
            <span>{profile.xp} / {xpForNextLevel} XP</span>
          </div>
          <div className="h-2 md:h-3 bg-purple-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(xpProgress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${element.color} rounded-full`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-3 md:p-4 border border-purple-500/10">
      <div className={`flex items-center gap-2 ${color} mb-1`}>
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-display text-white">{value}</div>
    </div>
  );
}
