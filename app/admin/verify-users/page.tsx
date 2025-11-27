/* eslint-disable react/no-unescaped-entities */
// app/admin/verify-users/page.tsx
'use client';

import React from 'react';
import { UserVerificationTool } from '@/components/admin/UserVerificationTool';

export default function VerifyUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Email Verification</h1>
          <p className="text-gray-600 mt-2">
            Manage email verification for users who registered before the email verification system was added.
          </p>
        </div>

        <UserVerificationTool />

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>View all users and their verification status below</li>
            <li>Click "Verify" next to any unverified user to activate their account</li>
            <li>Or enter an email address and click "Verify User"</li>
            <li>Verified users can immediately login</li>
            <li>This tool is for existing users only - new registrations require email verification</li>
          </ol>
        </div>
      </div>
    </div>
  );
}