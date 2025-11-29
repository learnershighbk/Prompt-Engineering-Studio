"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  slug: string;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
  order: number;
  className?: string;
}

export default function LessonCard({
  slug,
  title,
  description,
  duration,
  isCompleted,
  order,
  className,
}: LessonCardProps) {
  const { t } = useLanguage();

  return (
    <Link href={`/learn/${slug}`} className="block group">
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "hover:shadow-md hover:border-primary/50",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          isCompleted && "border-green-500/30 bg-green-50/30",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  order
                )}
              </div>
              <CardTitle className="text-lg font-semibold leading-tight">
                {title}
              </CardTitle>
            </div>
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 shrink-0"
              >
                {t("learn.completed")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("learn.duration", { time: duration })}</span>
            </div>
            <ChevronRight
              className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

