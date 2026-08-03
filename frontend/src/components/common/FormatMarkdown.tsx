// frontend/src/components/common/FormatMarkdown.tsx

import React from "react";

interface FormatMarkdownProps {
    text: string;
}

export const FormatMarkdown: React.FC<FormatMarkdownProps> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <div className="whitespace-pre-wrap leading-relaxed text-sm text-(--text-secondary)">
            {parts.map((part, index) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                        <strong key={index} className="font-semibold text-(--heading-primary)">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};