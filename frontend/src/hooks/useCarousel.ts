// frontend/src/hooks/useCarousel.ts
import { useState, useRef, useEffect, useCallback } from "react";


const getResponsiveCardCount = (): number => {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 768) return 2;
  if (window.innerWidth < 1024) return 3;
  return 4;
};



export const useCarousel = (itemCount: number, gap: number) => {
    const [visibleCards, setVisibleCards] = useState<number>(getResponsiveCardCount());

    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef<boolean>(false);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
        const newCount = getResponsiveCardCount();
        if (newCount !== visibleCards) {
            setVisibleCards(newCount);
        }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [visibleCards]);


    // Calculate precise sub-pixel width to prevent infinite scroll drift
    const getScrollPerCard = useCallback(() => {
        if (!scrollRef.current || !scrollRef.current.firstElementChild) return 0;
        return scrollRef.current.firstElementChild.getBoundingClientRect().width + gap;
    }, [gap]);



    // Snap to offset on mount or resize
    useEffect(() => {
        if (!scrollRef.current || itemCount === 0) return;
        const offset = getScrollPerCard() * visibleCards;
        scrollRef.current.scrollLeft = offset;
    }, [visibleCards, itemCount, getScrollPerCard]);

    // Execute infinite scroll
    const scrollCarousel = useCallback((direction: "left" | "right") => {
        if (!scrollRef.current || isScrollingRef.current) return;
        isScrollingRef.current = true;

        const step = getScrollPerCard();
        const current = scrollRef.current.scrollLeft;
        const target = direction === "left" ? current - step : current + step;

        scrollRef.current.scrollTo({ left: target, behavior: "smooth" });

        setTimeout(() => {
            if (!scrollRef.current) return;
            const el = scrollRef.current;
            const realEnd = step * (visibleCards + itemCount);

            if (el.scrollLeft < step * 1) {
                el.scrollLeft = el.scrollLeft + step * itemCount;
            } else if (el.scrollLeft >= realEnd - step * 0.5) {
                el.scrollLeft = el.scrollLeft - step * itemCount;
            }

            isScrollingRef.current = false;
        }, 350);
    }, [getScrollPerCard, visibleCards, itemCount]);


    return { 
        scrollRef, 
        visibleCards, 
        scrollCarousel 
    };
};