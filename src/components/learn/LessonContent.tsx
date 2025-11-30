"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Example {
  title: string;
  prompt: string;
  description: string;
}

interface LessonContentProps {
  content: string;
  examples?: Example[];
  className?: string;
  onTryExample?: (prompt: string) => void;
}

export default function LessonContent({
  content,
  examples = [],
  className,
  onTryExample,
}: LessonContentProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre: ({ children }) => (
              <div className="relative group">
                <pre className="overflow-x-auto rounded-lg bg-secondary p-4 text-sm">
                  {children}
                </pre>
              </div>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="rounded bg-secondary px-1.5 py-0.5 text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {examples.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">예제</h3>
          </div>
          <div className="space-y-4">
            {examples.map((example, index) => (
              <ExampleCard
                key={index}
                example={example}
                onTry={onTryExample}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface ExampleCardProps {
  example: Example;
  onTry?: (prompt: string) => void;
}

function ExampleCard({ example, onTry }: ExampleCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(example.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [example.prompt]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{example.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{example.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <pre className="rounded-lg bg-secondary p-4 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {example.prompt}
          </pre>
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  {t("common.copied")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  {t("common.copy")}
                </>
              )}
            </Button>
          </div>
        </div>
        {onTry && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTry(example.prompt)}
            className="w-full"
          >
            실습에서 사용하기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


