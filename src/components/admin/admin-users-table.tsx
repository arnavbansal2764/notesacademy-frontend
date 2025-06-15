"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Coins, Calendar, ChevronLeft, ChevronRight, FileText, Brain, Network, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    payments: number;
    mcqResults: number;
    subjectiveResults: number;
    mindmapResults: number;
    shortNotesResults: number;
  };
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users Management
              </CardTitle>
              <CardDescription>
                {pagination.total} total users • Page {pagination.page} of {pagination.pages}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-gray-300 font-medium">User</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Coins</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Activity</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Joined</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-600/30">
                        <Coins className="h-3 w-3 mr-1" />
                        {user.coins}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {user._count.payments > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-900/30 text-green-400 border-green-600/30">
                            {user._count.payments} payments
                          </Badge>
                        )}
                        {user._count.mcqResults > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-900/30 text-blue-400 border-blue-600/30">
                            <FileText className="h-3 w-3 mr-1" />
                            {user._count.mcqResults}
                          </Badge>
                        )}
                        {user._count.subjectiveResults > 0 && (
                          <Badge variant="outline" className="text-xs bg-purple-900/30 text-purple-400 border-purple-600/30">
                            <Brain className="h-3 w-3 mr-1" />
                            {user._count.subjectiveResults}
                          </Badge>
                        )}
                        {user._count.mindmapResults > 0 && (
                          <Badge variant="outline" className="text-xs bg-indigo-900/30 text-indigo-400 border-indigo-600/30">
                            <Network className="h-3 w-3 mr-1" />
                            {user._count.mindmapResults}
                          </Badge>
                        )}
                        {user._count.shortNotesResults > 0 && (
                          <Badge variant="outline" className="text-xs bg-teal-900/30 text-teal-400 border-teal-600/30">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {user._count.shortNotesResults}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="border-slate-600 text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="border-slate-600 text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
