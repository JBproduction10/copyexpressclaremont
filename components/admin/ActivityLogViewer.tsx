/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
//components/admin
'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityLog {
  _id: string;
  username: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: any;
  createdAt: string;
}

interface ActivityLogViewerProps {
  token: string;
}

export const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ token }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activity-logs?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-600';
      case 'update': return 'text-blue-600';
      case 'delete': return 'text-red-600';
      case 'export': return 'text-purple-600';
      case 'import': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div>Loading logs...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.username}</span>
                  <span className={`text-sm font-semibold ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-600">
                    {log.targetType}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                {Object.keys(log.details).length > 0 && (
                  <pre className="text-xs mt-2 p-2 bg-white rounded border">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};