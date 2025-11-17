import { useState, useEffect, RefObject } from 'react';

interface ObserverOptions {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
}

export const useIntersectionObserver = (
    elementRef: RefObject<HTMLElement>,
    { threshold = 0.1, root = null, rootMargin = '0px' }: ObserverOptions = {}
): boolean => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Stop observing once it's visible to avoid unnecessary checks
                    observer.unobserve(entry.target);
                }
            },
            { threshold, root, rootMargin }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [elementRef, threshold, root, rootMargin]);

    return isVisible;
};
