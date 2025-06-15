"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Coins, FileText, Brain, Network, BookOpen, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminStatsCardsProps {
  stats: any;
  isLoading: boolean;
}

export default function AdminStatsCards({ stats, isLoading }: AdminStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-700 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    {
      title: 'Total Revenue',
      value: `₹${((stats.overview.totalRevenue || 0) / 100).toLocaleString()}`,
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      description: 'All-time revenue'
    },
    {
      title: 'Total Payments',
      value: stats.overview.totalPayments,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      description: 'Completed transactions'
    },
    {
      title: 'MCQ Quizzes',
      value: stats.overview.totalMCQs,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      description: 'Generated MCQ tests'
    },
    {
      title: 'Subjective Q&As',
      value: stats.overview.totalSubjective,
      icon: Brain,
      color: 'from-pink-500 to-pink-600',
      description: 'Generated questions'
    },
    {
      title: 'Mindmaps',
      value: stats.overview.totalMindmaps,
      icon: Network,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Visual mindmaps created'
    },
    {
      title: 'Short Notes',
      value: stats.overview.totalShortNotes,
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
      description: 'Condensed notes'
    },
    {
      title: 'Avg Revenue/User',
      value: `₹${stats.overview.totalUsers > 0 ? Math.round((stats.overview.totalRevenue || 0) / 100 / stats.overview.totalUsers) : 0}`,
      icon: Coins,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Revenue per user'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-400 flex items-center">
                      <Coins className="h-3 w-3 mr-1" />
                      {user.coins}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Payments</CardTitle>
            <CardDescription>Latest successful transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{payment.user.name}</p>
                    <p className="text-sm text-gray-400">{payment.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400 font-medium">
                      ₹{(payment.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
