"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading skeleton for generic data loading
 */
export function SkeletonLoader({
  count = 3,
  variant = "card",
}: {
  count?: number;
  variant?: "card" | "table" | "chart";
}) {
  if (variant === "chart") {
    return (
      <div className="w-full h-80 bg-gradient-to-r from-skeleton to-skeleton-light animate-pulse rounded-lg" />
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1 h-12 bg-gradient-to-r from-skeleton to-skeleton-light animate-pulse rounded" />
            <div className="w-20 h-12 bg-gradient-to-r from-skeleton to-skeleton-light animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-card rounded-lg border border-border">
          <div className="h-4 bg-gradient-to-r from-skeleton to-skeleton-light animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gradient-to-r from-skeleton to-skeleton-light animate-pulse rounded w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Centered loading spinner with message
 */
export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: {
  message?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      {message && (
        <p className="text-sm text-muted-text font-medium text-center">{message}</p>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      {Icon && (
        <div className="text-muted-text mb-2">
          {typeof Icon === "function" ? (
            <Icon className="w-12 h-12" />
          ) : (
            <div className="w-12 h-12">{Icon}</div>
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-text text-center max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Error state component
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 border border-destructive/30 rounded-lg bg-destructive/5">
      <div className="text-destructive mb-2">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-text text-center max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Retry error boundary
 */
export function RetryableError({
  error,
  onRetry,
}: {
  error?: string;
  onRetry: () => void;
}) {
  return (
    <ErrorState
      title="Failed to load data"
      description={error || "An error occurred while fetching data. Please try again."}
      action={{
        label: "Retry",
        onClick: onRetry,
      }}
    />
  );
}

/**
 * Data loading wrapper
 */
export function DataLoader({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <RetryableError error={error.message} onRetry={onRetry || (() => {})} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle || "No data found"}
        description={emptyDescription}
      />
    );
  }

  return <>{children}</>;
}
