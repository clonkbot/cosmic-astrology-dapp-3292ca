import { motion } from 'framer-motion';
import { Activity, Sparkles, Sun, Users, UserPlus } from 'lucide-react';

interface ActivityItem {
  _id: string;
  walletAddress: string;
  action: string;
  details: string;
  timestamp: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const actionIcons: Record<string, React.ReactNode> = {
  profile_created: <UserPlus className="w-4 h-4 text-purple-400" />,
  fortune_claimed: <Sun className="w-4 h-4 text-amber-400" />,
  match_found: <Users className="w-4 h-4 text-pink-400" />,
  level_up: <Sparkles className="w-4 h-4 text-yellow-400" />,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-indigo-900/30 rounded-3xl p-4 md:p-6 border border-indigo-500/20"
    >
      <h3 className="text-lg md:text-xl font-display text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        Live Activity
      </h3>

      <div className="space-y-2 max-h-60 md:max-h-80 overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              {actionIcons[activity.action] || <Sparkles className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{activity.details}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-purple-300/60 text-xs font-mono truncate max-w-[100px]">
                  {activity.walletAddress.slice(0, 6)}...{activity.walletAddress.slice(-4)}
                </span>
                <span className="text-slate-500 text-xs">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
