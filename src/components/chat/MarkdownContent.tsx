import { ReactNode } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  // Parse and render markdown-like formatting
  const parseContent = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    let key = 0;

    // Split by lines to handle bullet points
    const lines = text.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        // Only add line break if not at start/end and previous line wasn't empty
        if (lineIndex > 0 && lineIndex < lines.length - 1 && lines[lineIndex - 1].trim() !== '') {
          parts.push(<div key={`spacer-${key++}`} className="h-2" />);
        }
        return;
      }

      // Check for indentation (nested bullets)
      const indentMatch = line.match(/^(\s+)(\*|\-)\s+(.+)$/);
      const noIndentMatch = line.match(/^(\*|\-)\s+(.+)$/);
      
      if (indentMatch) {
        // Nested bullet point (indented)
        const indentLevel = indentMatch[1].length;
        const bulletContent = indentMatch[3];
        const processedContent = processInlineFormatting(bulletContent, key);
        key += processedContent.length;
        
        parts.push(
          <div 
            key={`bullet-nested-${key++}`} 
            className="flex items-start gap-2 my-1"
            style={{ marginLeft: `${Math.min(indentLevel * 0.5, 2)}rem` }}
          >
            <span className="text-foreground/70 mt-1.5 flex-shrink-0 text-xs">◦</span>
            <span className="flex-1">{processedContent}</span>
          </div>
        );
      } else if (noIndentMatch) {
        // Top-level bullet point
        const bulletContent = noIndentMatch[2];
        const processedContent = processInlineFormatting(bulletContent, key);
        key += processedContent.length;
        
        parts.push(
          <div key={`bullet-${key++}`} className="flex items-start gap-2 my-1.5">
            <span className="text-foreground mt-1.5 flex-shrink-0 font-medium">•</span>
            <div className="flex-1">{processedContent}</div>
          </div>
        );
      } else {
        // Regular paragraph
        const processedContent = processInlineFormatting(line.trim(), key);
        key += processedContent.length;
        
        parts.push(
          <p key={`para-${key++}`} className="my-1.5 leading-relaxed">
            {processedContent}
          </p>
        );
      }
    });

    return parts;
  };

  const processInlineFormatting = (text: string, startKey: number): ReactNode[] => {
    const parts: ReactNode[] = [];
    let key = startKey;
    let lastIndex = 0;
    const matches: Array<{ type: 'bold' | 'code'; start: number; end: number; content: string }> = [];

    // Find all bold matches
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      });
    }

    // Find all code matches
    const codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(text)) !== null) {
      matches.push({
        type: 'code',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      });
    }

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Build parts
    matches.forEach((match) => {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.start)}
          </span>
        );
      }

      // Add formatted content
      if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold">
            {match.content}
          </strong>
        );
      } else if (match.type === 'code') {
        parts.push(
          <code key={`code-${key++}`} className="px-1.5 py-0.5 rounded bg-muted/50 text-sm font-mono">
            {match.content}
          </code>
        );
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key={`text-${key++}`}>{text}</span>];
  };

    return (
      <div className="markdown-content space-y-0.5">
        {parseContent(content)}
      </div>
    );
}
