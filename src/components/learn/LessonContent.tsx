"use client";

import { useState, useCallback, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Lightbulb, XCircle, CheckCircle2 } from "lucide-react";
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
  const { language } = useLanguage();
  
  const processedContent = useMemo(() => {
    let processed = content;
    
    const badExampleLabel = language === "ko" ? "나쁜 예시" : "Bad example";
    const goodExampleLabel = language === "ko" ? "좋은 예시" : "Good example";
    
    const badPattern = new RegExp(
      `(\\*\\*${badExampleLabel}:\\*\\*[\\s\\S]*?)\`\`\`([^\\n]*)\\n([\\s\\S]*?)\`\`\``,
      "g"
    );
    const goodPattern = new RegExp(
      `(\\*\\*${goodExampleLabel}:\\*\\*[\\s\\S]*?)\`\`\`([^\\n]*)\\n([\\s\\S]*?)\`\`\``,
      "g"
    );
    
    processed = processed.replace(
      badPattern,
      (match, labelPart, lang, code) => {
        return `${labelPart}\`\`\`bad-example\n${code.trim()}\n\`\`\``;
      }
    );
    
    processed = processed.replace(
      goodPattern,
      (match, labelPart, lang, code) => {
        return `${labelPart}\`\`\`good-example\n${code.trim()}\n\`\`\``;
      }
    );
    
    return processed;
  }, [content, language]);

  return (
    <div className={cn("space-y-8", className)}>
      <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-7 prose-p:mb-4 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-4 prose-li:text-gray-700 prose-li:leading-7 prose-code:text-white prose-pre:bg-gray-900">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children, ...props }) => {
              const text = String(children);
              const badExampleLabel = language === "ko" ? "나쁜 예시" : "Bad example";
              const goodExampleLabel = language === "ko" ? "좋은 예시" : "Good example";
              
              if (text.includes(`**${badExampleLabel}:**`) || text.includes(`**${goodExampleLabel}:**`)) {
                return null;
              }
              
              return <p {...props}>{children}</p>;
            },
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              
              if (isInline) {
                return (
                  <code
                    className="rounded bg-gray-100 text-gray-800 px-1.5 py-0.5 text-sm font-mono border border-gray-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              
              const match = /language-(\w+)/.exec(className || '');
              const languageClass = match ? match[1] : '';
              
              const isBadExample = languageClass === 'bad-example';
              const isGoodExample = languageClass === 'good-example';
              
              if (isBadExample || isGoodExample) {
                return (
                  <div className="relative group my-6">
                    <div className={cn(
                      "rounded-lg border-2 p-5 shadow-sm",
                      isBadExample 
                        ? "bg-red-50 border-red-200" 
                        : "bg-green-50 border-green-200"
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        {isBadExample ? (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-900">
                              {language === "ko" ? "나쁜 예시" : "Bad Example"}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">
                              {language === "ko" ? "좋은 예시" : "Good Example"}
                            </span>
                          </>
                        )}
                      </div>
                      <pre className={cn(
                        "overflow-x-auto rounded-md p-4 text-sm font-mono leading-relaxed",
                        "bg-gray-900 !text-white",
                        isBadExample
                          ? "border border-red-300"
                          : "border border-green-300"
                      )}>
                        <code className={cn("!text-white", className)} {...props} style={{ color: 'white' }}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  </div>
                );
              }
              
              return (
                <code className={cn("text-gray-800", className)} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => {
              const codeElement = children as React.ReactElement;
              const codeProps = codeElement?.props || {};
              const className = codeProps.className || '';
              const match = /language-(\w+)/.exec(className);
              const languageClass = match ? match[1] : '';
              
              const isBadExample = languageClass === 'bad-example';
              const isGoodExample = languageClass === 'good-example';
              
              if (isBadExample || isGoodExample) {
                return <>{children}</>;
              }
              
              return (
                <div className="relative group my-4">
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-5 text-sm font-mono leading-relaxed shadow-md border border-gray-800">
                    {children}
                  </pre>
                </div>
              );
            },
            h2: ({ children, ...props }) => (
              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-5 pb-2 border-b border-gray-200" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4" {...props}>
                {children}
              </h3>
            ),
            ul: ({ children, ...props }) => (
              <ul className="my-5 space-y-2 list-disc list-inside text-gray-700" {...props}>
                {children}
              </ul>
            ),
            li: ({ children, ...props }) => (
              <li className="leading-7 text-gray-700" {...props}>
                {children}
              </li>
            ),
            strong: ({ children, ...props }) => (
              <strong className="font-semibold text-gray-900" {...props}>
                {children}
              </strong>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </article>

      {examples.length > 0 && (
        <section className="space-y-4 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {language === "ko" ? "예제" : "Examples"}
            </h3>
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
  const { t, language } = useLanguage();
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
    <Card className="border-2 border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">{example.title}</CardTitle>
        <p className="text-sm text-gray-600 mt-1">{example.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-sm whitespace-pre-wrap font-mono overflow-x-auto border border-gray-800 shadow-inner">
            {example.prompt}
          </pre>
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 bg-white/90 hover:bg-white text-gray-700 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
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
            className="w-full border-2 hover:bg-gray-50"
          >
            {language === "ko" ? "실습에서 사용하기" : "Use in Practice"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


