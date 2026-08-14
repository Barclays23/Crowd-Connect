// frontend/src/components/shared/Tooltip.tsx
import { type ReactNode } from "react";
import {
    RadixTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/radix-tooltip";

interface TooltipProps {
    children: ReactNode;
    content: string | ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    delayDuration?: number;
}

export function Tooltip({ 
    children, 
    content, 
    side = "top",
    delayDuration = 200 
}: TooltipProps) {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <RadixTooltip>
                <TooltipTrigger asChild>
                    <span className="inline-block">
                        {children}
                    </span>
                </TooltipTrigger>
                
                <TooltipContent side={side}>
                    {content}
                </TooltipContent>
            </RadixTooltip>
        </TooltipProvider>
    );
}