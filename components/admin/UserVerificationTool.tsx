/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/UserVerificationTool.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Users, Mail } from 'lucide-react';

interface User {
  email: string;
  username: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export function UserVerificationTool() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/manual-verify');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async () => {
    if (!email) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message, user: data.user });
        setEmail('');
        fetchUsers(); // Refresh user list
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: 'Failed to verify user', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerify = async (userEmail: string) => {
    setEmail(userEmail);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message, user: data.user });
        fetchUsers();
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: 'Failed to verify user' });
    } finally {
      setLoading(false);
      setEmail('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Manual Email Verification
          </CardTitle>
          <CardDescription>
            Manually verify users who haven&apos;t received or clicked their verification email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button
                onClick={handleVerify}
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify User
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <p className="font-medium">{result.message}</p>
                  {result.user && (
                    <div className="mt-2 text-sm space-y-1">
                      <p>Username: {result.user.username}</p>
                      <p>Email: {result.user.email}</p>
                      <p>Status: ✅ Verified and Active</p>
                    </div>
                  )}
                  {result.error && (
                    <p className="text-sm mt-2">Error: {result.error}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="font-semibold mb-1">⚠️ Security Note:</p>
            <p>This tool should be removed or protected in production. It bypasses email verification for administrative purposes.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users
              </CardTitle>
              <CardDescription>
                View all users and their verification status
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loadingUsers}
            >
              {loadingUsers ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.username}</p>
                      {user.isEmailVerified ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          ⚠ Unverified
                        </span>
                      )}
                      {!user.isActive && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!user.isEmailVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickVerify(user.email)}
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}