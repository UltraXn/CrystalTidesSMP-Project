import { useRef, useEffect, useState, RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
    triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
    options: IntersectionOptions = {}
): [RefObject<T | null>, boolean] {
    const elementRef = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Optional: Stop observing once visible if you only want it to trigger once
                if (options.triggerOnce) {
                    observer.unobserve(entry.target);
                }
            } else if (!options.triggerOnce) {
                setIsVisible(false);
            }
        }, {
            threshold: 0.1, // Trigger when 10% is visible
            ...options
        });

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [options]);

    return [elementRef, isVisible];
}
