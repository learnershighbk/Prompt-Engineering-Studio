"use client";

import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Copy, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResponseViewerProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export default function ResponseViewer({
  content,
  isStreaming,
  className,
}: ResponseViewerProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [content]);

  const isEmpty = !content && !isStreaming;
  
  // 디버깅용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("ResponseViewer props:", { 
        contentLength: content?.length || 0, 
        isStreaming, 
        isEmpty,
        hasContent: !!content
      });
    }
  }, [content, isStreaming, isEmpty]);

  const hasHeightClass = className?.includes("h-full") || className?.includes("min-h-") || className?.includes("h-");
  
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border-2 border-border bg-card shadow-sm",
        !hasHeightClass && "min-h-[200px]",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">AI 응답</span>
          {isStreaming && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-xs text-muted-foreground">
                {t("playground.streaming")}
              </span>
            </span>
          )}
        </div>
        {content && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={isStreaming}
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
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 pb-12 bg-card">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground max-w-[250px]">
              {t("playground.emptyResponse")}
            </p>
          </div>
        ) : (
          <div className="prose prose-gray dark:prose-invert prose-sm max-w-none pb-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => (
                  <pre className="overflow-x-auto rounded-lg bg-secondary p-4 text-sm">
                    {children}
                  </pre>
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
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-foreground animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}


