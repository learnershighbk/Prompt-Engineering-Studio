"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ArrowLeft, Beaker } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

interface HeaderProps {
  showBackButton?: boolean;
  showPlaygroundLink?: boolean;
  studentId?: string;
  className?: string;
}

export default function Header({
  showBackButton = false,
  showPlaygroundLink = false,
  studentId,
  className,
}: HeaderProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/learn"
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <Beaker className="h-6 w-6 text-blue-500" />
            <span>{t("common.appName")}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {studentId && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {studentId}
            </span>
          )}

          {showPlaygroundLink && (
            <Link
              href="/playground"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1"
            >
              {t("header.playground")}
            </Link>
          )}

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
