import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LeaderboardRow = ({ team, rank }: { team: Team; rank: number }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={team.avatar} />
          <AvatarFallback>{team.name[0]}</AvatarFallback>
        </Avatar>
        {rank <= 3 && (
          <div className="absolute -top-2 -right-2">
            <Badge variant={rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}>
              #{rank}
            </Badge>
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold">{team.name}</h3>
        <p className="text-sm text-gray-500">{team.members} members</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className="text-sm text-gray-500">Projects</p>
        <p className="font-semibold">{team.projects}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">XP</p>
        <p className="font-semibold">{team.xp}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">Rank</p>
        <p className="font-semibold">#{rank}</p>
      </div>
    </div>
  </motion.div>
);

export const TeamLeaderboard = () => {
  return (
    <div className="space-y-6">
      {/* Leaderboard Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Leaderboard
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
              Season 2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Top Team</h4>
                  <p className="text-2xl font-bold">Code Warriors</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Your Rank</h4>
                  <p className="text-2xl font-bold">#5</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Season Ends</h4>
                  <p className="text-2xl font-bold">15 days</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topTeams.map((team, index) => (
            <LeaderboardRow key={team.id} team={team} rank={index + 1} />
          ))}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Recent Team Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <achievement.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{achievement.team}</h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{achievement.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 