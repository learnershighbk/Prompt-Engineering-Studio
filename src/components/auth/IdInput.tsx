"use client";

import { useState, useCallback, KeyboardEvent, ChangeEvent } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";

interface IdInputProps {
  onSubmit: (studentId: string) => void;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

const ID_LENGTH = 9;

export default function IdInput({
  onSubmit,
  isLoading,
  error,
  className,
}: IdInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateInput = useCallback(
    (input: string): boolean => {
      if (input.length !== ID_LENGTH) {
        setValidationError(t("login.error"));
        return false;
      }
      if (!/^\d+$/.test(input)) {
        setValidationError(t("login.error"));
        return false;
      }
      setValidationError(null);
      return true;
    },
    [t]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "").slice(0, ID_LENGTH);
    setValue(newValue);
    if (validationError && newValue.length === ID_LENGTH) {
      validateInput(newValue);
    }
  };

  const handleSubmit = () => {
    if (validateInput(value)) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  const displayError = error || validationError;
  const isValid = value.length === ID_LENGTH && /^\d+$/.test(value);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-2">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("login.placeholder")}
          disabled={isLoading}
          aria-label={t("login.subtitle")}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? "id-error" : undefined}
          className={cn(
            "h-12 text-center text-lg tracking-widest font-mono",
            displayError && "border-destructive focus-visible:ring-destructive"
          )}
          autoComplete="off"
          autoFocus
        />
        {displayError && (
          <div
            id="id-error"
            className="flex items-center gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !isValid}
        className="w-full h-12 text-base font-medium"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("common.loading")}
          </>
        ) : (
          t("login.button")
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {value.length}/{ID_LENGTH}
      </p>
    </div>
  );
}






