import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

interface LazyWrapperProps {
    children: React.ReactNode;
    minHeight?: string;
    rootMargin?: string;
}

export default function LazyWrapper({ children, minHeight = "200px", rootMargin = "200px 0px" }: LazyWrapperProps) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
        triggerOnce: true,
        rootMargin: rootMargin
    })

    return (
        <div ref={ref} style={{ minHeight }}>
            {isVisible ? children : null}
        </div>
    )
}
