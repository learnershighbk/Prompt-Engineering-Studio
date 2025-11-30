"use client";

import React from 'react';

interface ReactMarkdownProps {
  children: string;
  remarkPlugins?: any[];
  components?: Record<string, React.ComponentType<any>>;
  className?: string;
}

/**
 * react-markdown 모킹 컴포넌트
 * ESM 모듈 호환성 문제로 테스트 환경에서 사용
 */
function ReactMarkdown({ children, className }: ReactMarkdownProps) {
  // 마크다운 텍스트를 간단하게 파싱하여 렌더링
  const lines = children.split('\n');
  
  const renderContent = () => {
    return lines.map((line, index) => {
      // 헤더 처리
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index}>{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index}>{line.slice(4)}</h3>;
      }
      
      // 코드 블록 처리 (간단한 버전)
      if (line.startsWith('```')) {
        return null;
      }
      
      // 굵은 텍스트 처리
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      
      if (parts.length > 1) {
        return (
          <p key={index}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
            )}
          </p>
        );
      }
      
      // 빈 줄 무시
      if (line.trim() === '') {
        return null;
      }
      
      // 일반 텍스트
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className={className} data-testid="react-markdown">
      {renderContent()}
    </div>
  );
}

export default ReactMarkdown;



