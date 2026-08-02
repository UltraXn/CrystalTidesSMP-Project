import { Suspense, useMemo } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import Loader from '../UI/Loader'

interface LazyWrapperProps {
    children?: React.ReactNode;
    render?: () => React.ReactNode;
    minHeight?: string;
    rootMargin?: string;
    /** Custom skeleton fallback shown while the lazy component loads. Falls back to <Loader /> if not provided. */
    fallback?: React.ReactNode;
}

export default function LazyWrapper({ children, render, minHeight = "200px", rootMargin = "50px 0px", fallback }: LazyWrapperProps) {
    const observerOptions = useMemo(() => ({
        triggerOnce: true,
        rootMargin: rootMargin
    }), [rootMargin]);

    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>(observerOptions)

    return (
        <div ref={ref} style={{ minHeight }}>
            {isVisible ? (
                <Suspense fallback={fallback || <Loader />}>
                    {render ? render() : children}
                </Suspense>
            ) : null}
        </div>
    )
}

