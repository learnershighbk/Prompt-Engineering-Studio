"use client";

import { useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, RotateCcw } from "lucide-react";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}

export default function PromptEditor({
  value,
  onChange,
  onSubmit,
  isLoading,
  maxLength = 4000,
  placeholder,
  className,
}: PromptEditorProps) {
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleReset = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  const charCount = value.length;
  const isOverLimit = charCount > maxLength;
  const isValid = charCount > 0 && !isOverLimit;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 flex flex-col min-h-0">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("playground.inputPlaceholder")}
          disabled={isLoading}
          className={cn(
            "flex-1 min-h-[200px] resize-none text-base leading-relaxed",
            isOverLimit && "border-destructive focus-visible:ring-destructive"
          )}
          aria-label={t("playground.inputPlaceholder")}
          aria-invalid={isOverLimit}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              "font-mono",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {t("playground.charCount", { current: charCount, max: maxLength })}
          </span>
          <span className="text-xs text-muted-foreground">
            Ctrl/Cmd + Enter
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            disabled={isLoading || value.length === 0}
            className="flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("common.reset")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !isValid}
            className="flex-1"
            size="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t("playground.executeButton")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

