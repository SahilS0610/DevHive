import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Trophy, Award, Target, Clock, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const CategoryButton = ({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant={active ? 'default' : 'outline'}
      className="flex items-center gap-2"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  </motion.div>
);

const TimeframeSelector = ({ value, onChange }: {
  value: 'weekly' | 'monthly' | 'allTime';
  onChange: (value: 'weekly' | 'monthly' | 'allTime') => void;
}) => (
  <div className="flex items-center gap-2">
    <Clock className="h-5 w-5 text-gray-500" />
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="allTime">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

const TopThreePodium = ({ winners }: { winners: LeaderboardEntry[] }) => (
  <div className="flex items-end justify-center space-x-4">
    {/* Second Place */}
    <PodiumPlace
      place={2}
      winner={winners[1]}
      height="h-32"
      delay={0.2}
    />
    
    {/* First Place */}
    <PodiumPlace
      place={1}
      winner={winners[0]}
      height="h-40"
      delay={0}
    />
    
    {/* Third Place */}
    <PodiumPlace
      place={3}
      winner={winners[2]}
      height="h-24"
      delay={0.4}
    />
  </div>
);

const PodiumPlace = ({ place, winner, height, delay }: {
  place: number;
  winner: LeaderboardEntry;
  height: string;
  delay: number;
}) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center"
  >
    <div className="mb-4">
      <Avatar
        src={winner.avatar}
        size="lg"
        className="ring-4 ring-offset-2"
        ringColor={place === 1 ? 'ring-yellow-400' : 
                  place === 2 ? 'ring-gray-300' : 
                  'ring-amber-600'}
      />
      <div className="mt-2 text-center">
        <p className="font-semibold text-gray-900">{winner.name}</p>
        <p className="text-sm text-gray-500">{winner.score} XP</p>
      </div>
    </div>
    <div className={`${height} w-24 rounded-t-lg bg-gradient-to-t
      ${place === 1 ? 'from-yellow-500 to-yellow-300' :
        place === 2 ? 'from-gray-400 to-gray-200' :
        'from-amber-700 to-amber-500'}
    `}>
      <div className="flex items-center justify-center h-full">
        <span className="text-white font-bold text-2xl">#{place}</span>
      </div>
    </div>
  </motion.div>
);

const LeaderboardEntry = ({ entry, rank, isCurrentUser }: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-4 flex items-center justify-between ${
      isCurrentUser ? 'bg-blue-50' : 'bg-white'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={entry.avatar} size="md" />
        {rank <= 3 && (
          <Badge
            variant={rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}
            className="absolute -top-2 -right-2"
          >
            #{rank}
          </Badge>
        )}
      </div>
      <div>
        <h3 className="font-semibold">{entry.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{entry.metrics.projectsCompleted} projects</span>
          <span>•</span>
          <span>{entry.metrics.skillsMastered} skills</span>
          <span>•</span>
          <span>{entry.metrics.achievementsUnlocked} achievements</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="font-semibold">{entry.score} XP</p>
        <p className="text-sm text-gray-500">Rank #{rank}</p>
      </div>
      <Progress
        value={(entry.metrics.averageProjectRating / 5) * 100}
        className="w-24"
      />
    </div>
  </motion.div>
);

export const LeaderboardView = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [category, setCategory] = useState<'overall' | 'skill' | 'projects' | 'achievements'>('overall');
  
  const { data: leaderboardData, isLoading } = useLeaderboard({
    timeframe,
    category,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DevHive Champions
          </h1>
          <p className="text-lg text-gray-600">
            Celebrating excellence in collaboration and innovation
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-4">
            <CategoryButton
              icon={Trophy}
              label="Overall"
              active={category === 'overall'}
              onClick={() => setCategory('overall')}
            />
            <CategoryButton
              icon={Target}
              label="Skills"
              active={category === 'skill'}
              onClick={() => setCategory('skill')}
            />
            <CategoryButton
              icon={Award}
              label="Projects"
              active={category === 'projects'}
              onClick={() => setCategory('projects')}
            />
            <CategoryButton
              icon={Star}
              label="Achievements"
              active={category === 'achievements'}
              onClick={() => setCategory('achievements')}
            />
          </div>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>

        {/* Top 3 Winners Podium */}
        {leaderboardData && leaderboardData.length >= 3 && (
          <div className="mb-12">
            <TopThreePodium winners={leaderboardData.slice(0, 3)} />
          </div>
        )}

        {/* Leaderboard List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {leaderboardData?.map((entry, index) => (
                  <LeaderboardEntry
                    key={entry.userId}
                    entry={entry}
                    rank={index + 1}
                    isCurrentUser={entry.userId === currentUserId}
                  />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 