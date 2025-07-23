"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MagicSlidesAccount {
  id: string;
  accountId: string;
  email: string;
  isActive: boolean;
  currentUsage: number;
  monthlyLimit: number;
  lastResetMonth: string;
}

interface AccountsData {
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    exhaustedAccounts: number;
    disabledAccounts: number;
    totalUsage: number;
    totalCapacity: number;
    availableSlots: number;
    usagePercentage: number;
    currentMonth: string;
  };
  accounts: {
    all: MagicSlidesAccount[];
    active: MagicSlidesAccount[];
    exhausted: MagicSlidesAccount[];
    disabled: MagicSlidesAccount[];
  };
}

export default function MagicSlidesDashboard() {
  const [data, setData] = useState<AccountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewLoading, setRenewLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/magic-slides-accounts');
      if (response.ok) {
        const accountsData = await response.json();
        setData(accountsData);
      } else {
        toast.error('Failed to fetch MagicSlides accounts data');
      }
    } catch (error) {
      toast.error('Error loading MagicSlides accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewAccounts = async () => {
    setRenewLoading(true);
    try {
      const response = await fetch('/api/admin/renew-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to renew accounts');
      }
    } catch (error) {
      toast.error('Error renewing accounts');
    } finally {
      setRenewLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading MagicSlides accounts...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusBadge = (account: MagicSlidesAccount) => {
    if (!account.isActive) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Disabled</Badge>;
    }
    if (account.currentUsage >= account.monthlyLimit) {
      return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Exhausted</Badge>;
    }
    return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Month: {data.summary.currentMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">Available for use</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Account Details</h3>
        <Button 
          onClick={handleRenewAccounts}
          disabled={renewLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${renewLoading ? 'animate-spin' : ''}`} />
          {renewLoading ? 'Renewing...' : 'Renew All Accounts'}
        </Button>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>MagicSlides Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Account ID</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Usage</th>
                  <th className="text-left p-2">Progress</th>
                  <th className="text-left p-2">Last Reset</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.all.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{account.accountId}</td>
                    <td className="p-2 text-sm">{account.email}</td>
                    <td className="p-2">{getStatusBadge(account)}</td>
                    <td className="p-2 text-sm">
                      {account.currentUsage}/{account.monthlyLimit}
                    </td>
                    <td className="p-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            account.currentUsage >= account.monthlyLimit 
                              ? 'bg-red-500' 
                              : account.currentUsage > 0 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((account.currentUsage / account.monthlyLimit) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-600">{account.lastResetMonth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
