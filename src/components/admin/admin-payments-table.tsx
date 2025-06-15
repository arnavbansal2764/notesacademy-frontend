"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CreditCard, Calendar, ChevronLeft, ChevronRight, TrendingUp, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  contactNumber?: string;
  transactionId?: string;
  orderId?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    coins: number;
  };
}

export default function AdminPaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Change default from '' to 'all'
  const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, search, statusFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        status: statusFilter === 'all' ? '' : statusFilter, // Convert 'all' to empty string for API
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPagination(prev => ({ ...prev, ...data.pagination }));
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch payments');
      }
    } catch (error) {
      toast.error('Error fetching payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      captured: { color: 'bg-green-900/30 text-green-400 border-green-600/30', label: 'Success' },
      completed: { color: 'bg-green-900/30 text-green-400 border-green-600/30', label: 'Completed' },
      succeeded: { color: 'bg-green-900/30 text-green-400 border-green-600/30', label: 'Success' },
      failed: { color: 'bg-red-900/30 text-red-400 border-red-600/30', label: 'Failed' },
      pending: { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-600/30', label: 'Pending' },
      refunded: { color: 'bg-blue-900/30 text-blue-400 border-blue-600/30', label: 'Refunded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: 'bg-gray-900/30 text-gray-400 border-gray-600/30', label: status };

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
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
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-green-900/30 to-green-800/30 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Total Revenue</p>
                <p className="text-3xl font-bold text-white">₹{(stats.totalRevenue / 100).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total Transactions</p>
                <p className="text-3xl font-bold text-white">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payments Management
              </CardTitle>
              <CardDescription>
                {pagination.total} total payments • Page {pagination.page} of {pagination.pages}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments or users..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white w-full sm:w-72"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="captured">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-gray-300 font-medium">Payment ID</th>
                  <th className="text-left p-3 text-gray-300 font-medium">User</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Method</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3">
                      <div>
                        <p className="font-mono text-sm text-white">
                          {payment.paymentId.slice(0, 12)}...
                        </p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-400">
                            Txn: {payment.transactionId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-white">{payment.user.name}</p>
                        <p className="text-sm text-gray-400">{payment.user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-white">
                        ₹{(payment.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {payment.currency.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {payment.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <div>
                          <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs">
                            {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
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
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
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
