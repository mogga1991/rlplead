'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface SearchProgressProps {
  jobId: string;
  onComplete: (result: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

interface JobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress?: {
    step: string;
    current: number;
    total: number;
    percentage: number;
    message: string;
  };
  result?: any;
  error?: string;
  duration?: number;
}

export function SearchProgress({
  jobId,
  onComplete,
  onError,
  onCancel,
}: SearchProgressProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!jobId || !polling) return;

    let pollInterval: NodeJS.Timeout;

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const status: JobStatus = await response.json();
        setJobStatus(status);

        // Handle completed state
        if (status.status === 'completed') {
          setPolling(false);
          clearInterval(pollInterval);
          onComplete(status.result);
        }

        // Handle failed state
        if (status.status === 'failed') {
          setPolling(false);
          clearInterval(pollInterval);
          onError(status.error || 'Job failed');
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        setPolling(false);
        clearInterval(pollInterval);
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Poll immediately
    pollJobStatus();

    // Then poll every second
    pollInterval = setInterval(pollJobStatus, 1000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [jobId, polling, onComplete, onError]);

  const handleCancel = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        setPolling(false);
        onCancel?.();
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  if (!jobStatus) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-fed-green-600" />
          <p className="text-sm text-gray-600">Initializing search...</p>
        </div>
      </Card>
    );
  }

  const progress = jobStatus.progress || {
    percentage: 0,
    message: 'Starting...',
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {jobStatus.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : jobStatus.status === 'failed' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-fed-green-600" />
            )}
            <h3 className="font-semibold text-gray-900">
              {jobStatus.status === 'completed'
                ? 'Search Complete'
                : jobStatus.status === 'failed'
                ? 'Search Failed'
                : 'Searching...'}
            </h3>
          </div>

          {jobStatus.status === 'waiting' || jobStatus.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              icon={X}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>

        {/* Progress Bar */}
        {jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{progress.message}</span>
                <span className="font-medium text-fed-green-700">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-fed-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Step Indicator */}
            {'step' in progress && progress.step && (
              <div className="flex gap-2">
                {['searching', 'aggregating', 'enriching', 'analyzing', 'saving'].map(
                  (step, index) => {
                    const isActive = 'step' in progress && progress.step === step;
                    const isComplete = 'step' in progress && index < getStepIndex(progress.step);

                    return (
                      <div
                        key={step}
                        className={`flex-1 h-1 rounded ${
                          isComplete
                            ? 'bg-fed-green-600'
                            : isActive
                            ? 'bg-fed-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    );
                  }
                )}
              </div>
            )}
          </>
        )}

        {/* Success Message */}
        {jobStatus.status === 'completed' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              {jobStatus.result?.leads?.length || 0} leads found from{' '}
              {jobStatus.result?.totalContracts || 0} contracts in{' '}
              {((jobStatus.duration || 0) / 1000).toFixed(1)}s
            </p>
          </div>
        )}

        {/* Error Message */}
        {jobStatus.status === 'failed' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {jobStatus.error || 'An error occurred during the search'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function getStepIndex(step: string): number {
  const steps = ['searching', 'aggregating', 'enriching', 'analyzing', 'saving'];
  return steps.indexOf(step);
}
