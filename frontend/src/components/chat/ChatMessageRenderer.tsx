// frontend/src/components/chat/ChatMessageRenderer.tsx
// frontend/src/components/chat/ChatMessageRenderer.tsx
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';



interface IChatMessageRendererProps {
    content: string;
    isAiResponse: boolean;
}



export const ChatMessageRenderer: React.FC<IChatMessageRendererProps> = ({ content, isAiResponse }) => {
    // If it's a user message, just render plain text
    if (!isAiResponse) {
        return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
    }

    // Define strictly typed components for Markdown mapping
    const customComponents: Components = {
        // Style standard text
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-(--brand-primary)">{children}</strong>,
        
        // Style lists
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-snug">{children}</li>,
        
        // Add syntax highlighting for code blocks
        code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            // Check if inline code or a code block
            const isInline = !match; 
            
            if (isInline) {
                return (
                    <code className="bg-(--bg-tertiary) text-(--brand-primary) px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                    </code>
                );
            }
            
            return (
                <SyntaxHighlighter
                    style={dracula}
                    language={match?.[1]}
                    PreTag="div"
                    className="rounded-md my-2 text-sm"
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            );
        }
    };

    return (
        <div className="prose prose-sm max-w-none text-(--text-primary)">
            <ReactMarkdown components={customComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
};