import { motion } from 'framer-motion';
import { Heart, Sparkles, Flame, Droplets, Wind, Mountain } from 'lucide-react';

interface MatchResult {
  _id: string;
  matchedWith: string;
  compatibility: number;
  timestamp: number;
}

interface MatchResultsProps {
  results: MatchResult[];
}

const elements = [
  { icon: Flame, color: 'text-orange-400' },
  { icon: Droplets, color: 'text-blue-400' },
  { icon: Wind, color: 'text-sky-400' },
  { icon: Mountain, color: 'text-green-400' },
];

export function MatchResults({ results }: MatchResultsProps) {
  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/90 to-pink-900/30 rounded-3xl p-4 md:p-6 border border-pink-500/20"
    >
      <h3 className="text-lg md:text-xl font-display text-white mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-pink-400" />
        Recent Matches
      </h3>

      <div className="space-y-3">
        {results.map((result, index) => {
          const ElementIcon = elements[index % 4].icon;
          const compatibility = result.compatibility;
          const isHighMatch = compatibility >= 70;

          return (
            <motion.div
              key={result._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden bg-slate-800/50 rounded-2xl p-3 md:p-4 border border-pink-500/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center ${elements[index % 4].color}`}>
                    <ElementIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-mono text-sm truncate max-w-[150px] md:max-w-[200px]">
                      {result.matchedWith.slice(0, 6)}...{result.matchedWith.slice(-4)}
                    </p>
                    <p className="text-purple-300/60 text-xs">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isHighMatch && <Sparkles className="w-4 h-4 text-yellow-400" />}
                  <div className={`text-xl md:text-2xl font-display ${
                    isHighMatch ? 'text-pink-400' : 'text-purple-300'
                  }`}>
                    {compatibility}%
                  </div>
                </div>
              </div>

              {/* Compatibility Bar */}
              <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${compatibility}%` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                  className={`h-full rounded-full ${
                    compatibility >= 80
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400'
                      : compatibility >= 60
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-slate-500 to-purple-500'
                  }`}
                />
              </div>

              {isHighMatch && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 right-0 w-20 h-20 bg-pink-500/20 blur-2xl"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
