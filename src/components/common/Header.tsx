"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ArrowLeft, Beaker, LogOut, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { logout, isAuthenticated } = useAuth();

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t("header.resources")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("header.resourcesTitle")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://learnprompting.org/docs/introduction?srsltid=AfmBOoosIhhBkEoBuSnFkZs2VfkcOj2wZLzdgkhLvXqgg_WVjaIvSJ2j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("header.learnPromptingDoc")}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("header.googleGeminiGuide")}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://www.youtube.com/watch?v=7kBJerjnQTk&t=847s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("header.youtubeVideo1")}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.youtube.com/watch?v=jNNatjruXx8&t=549s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("header.youtubeVideo2")}</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("header.logout")}</span>
            </Button>
          )}

          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
