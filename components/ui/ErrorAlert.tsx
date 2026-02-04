'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorAlertProps {
  error: Error | string;
  title?: string;
  canRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * ErrorAlert Component
 * Displays user-friendly error messages with optional retry functionality
 */
export function ErrorAlert({
  error,
  title = 'Error',
  canRetry = false,
  onRetry,
  onDismiss,
  className = '',
}: ErrorAlertProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
        </div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm text-red-800">{errorMessage}</p>

          {/* Actions */}
          {(canRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {canRetry && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={RefreshCw}
                  onClick={onRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              )}

              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-red-700 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        {onDismiss && (
          <button
            type="button"
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact error message for inline display
 */
export function ErrorMessage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-red-600 ${className}`} role="alert">
      {children}
    </p>
  );
}
