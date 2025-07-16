import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle } from '@/components/ui/icons';
import { Subscription } from 'rxjs';
import { SelfDiagnosticsService } from '@/services/SelfDiagnosticsService';

const diagnosticsService = new SelfDiagnosticsService();
const PAGE_SIZE = 10;

export default function CyberDashboard() {
  const [health, setHealth] = useState(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Idle');
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const subscriptions: Subscription[] = [
      diagnosticsService.getHealthObservable().subscribe(setHealth),
      diagnosticsService.getAlertsObservable().subscribe(setAlerts),
      diagnosticsService.getFeedbackObservable().subscribe(setFeedback),
      diagnosticsService.getDiagnosticsHistory().subscribe(setHistory),
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, []);

  const pagedHistory = history.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(history.length / PAGE_SIZE);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <h2 className="text-xl font-bold mb-2">System Health</h2>
          {health ? (
            <>
              <p className="mb-1">Overall: {health.overall}%</p>
              <Progress value={health.overall} className="mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(health.components).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <p className="font-medium capitalize">{key}</p>
                    <Progress value={value} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Last Checked: {new Date(health.lastCheck).toLocaleString()}
              </p>
            </>
          ) : (
            <p>Loading system health...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Current Alerts</h2>
          {alerts.length > 0 ? (
            <ul className="space-y-1">
              {alerts.map((alert, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  <AlertTriangle />
                  {alert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No current alerts</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Feedback</h2>
          <div className="flex items-center gap-2">
            <CheckCircle2 />
            <span className="text-sm">{feedback}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardContent>
          <h2 className="text-lg font-bold mb-2">Diagnostics History</h2>
          <div className="overflow-auto max-h-64 text-sm">
            {pagedHistory.length > 0 ? (
              <ul className="space-y-2">
                {pagedHistory.map((entry, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="text-muted-foreground text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <ul className="pl-4 list-disc">
                      {entry.results.map((result, idx) => (
                        <li
                          key={idx}
                          className={`text-sm ${
                            result.status === 'error'
                              ? 'text-red-600'
                              : result.status === 'warning'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {result.message} — {result.status.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No diagnostics history available</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
