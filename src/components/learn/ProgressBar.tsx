"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export default function ProgressBar({
  completed,
  total,
  className,
}: ProgressBarProps) {
  const { t } = useLanguage();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          {t("learn.progressText", { completed, total })}
        </span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("learn.progressText", { completed, total })}
      >
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


