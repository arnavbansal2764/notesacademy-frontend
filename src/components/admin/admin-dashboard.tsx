"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, CreditCard, BarChart3, UserPlus, RefreshCw, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminUsersTable from './admin-users-table';
import AdminPaymentsTable from './admin-payments-table';
import AdminStatsCards from './admin-stats-cards';
import CreateUserForm from './create-user-form';
import MagicSlidesDashboard from './magic-slides-dashboard';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'payments') fetchPayments();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to fetch statistics');
      }
    } catch (error) {
      toast.error('Error fetching statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast.error('Failed to fetch payments');
      }
    } catch (error) {
      toast.error('Error fetching payments');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const refreshData = () => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'payments') fetchPayments();
  };

  const handleUserCreated = () => {
    refreshData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'magic-slides', label: 'MagicSlides', icon: Activity },
    { id: 'create-user', label: 'Create User', icon: UserPlus }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminStatsCards stats={stats} isLoading={isLoading} />;
      case 'users':
        return <AdminUsersTable />;
      case 'payments':
        return <AdminPaymentsTable />;
      case 'magic-slides':
        return <MagicSlidesDashboard />;
      case 'create-user':
        return <CreateUserForm onUserCreated={handleUserCreated} />;
      default:
        return <AdminStatsCards stats={stats} isLoading={isLoading} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">NotesAcademy Management Panel</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <AdminStatsCards stats={stats} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTable />
            </TabsContent>

            <TabsContent value="payments">
              <AdminPaymentsTable />
            </TabsContent>

            <TabsContent value="magic-slides">
              <MagicSlidesDashboard />
            </TabsContent>

            <TabsContent value="create-user">
              <div className="flex justify-center">
                <CreateUserForm onUserCreated={handleUserCreated} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
