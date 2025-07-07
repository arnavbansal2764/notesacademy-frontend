"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, User, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateUserFormProps {
  onUserCreated?: () => void;
}

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coins: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          coins: parseInt(formData.coins)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          <div>
            <div className="font-medium">{data.message}</div>
            <div className="text-sm text-gray-600 mt-1">
              <div><strong>User:</strong> {data.user.name} ({data.user.email})</div>
              <div><strong>Total Coins:</strong> {data.user.coins}</div>
              <div><strong>Status:</strong> {data.user.isNewUser ? 'New user created' : 'Existing user updated'}</div>
              {data.user.isNewUser && (
                <div className="text-green-600 font-medium">Welcome email sent!</div>
              )}
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
          }
        );
        setFormData({ name: '', email: '', coins: '' });
        onUserCreated?.();
      } else {
        toast.error(data.error || 'Failed to create user', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Network error. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create User Account
        </CardTitle>
        <CardDescription>
          Create a new user account or add coins to existing user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coins" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Coins to Add
            </Label>
            <Input
              id="coins"
              type="number"
              placeholder="Enter number of coins"
              value={formData.coins}
              onChange={(e) => handleInputChange('coins', e.target.value)}
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.name || !formData.email || !formData.coins}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
        