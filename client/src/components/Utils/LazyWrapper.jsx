import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export default function LazyWrapper({ children, minHeight = "200px", rootMargin = "200px 0px" }) {
    const [ref, isVisible] = useIntersectionObserver({
        triggerOnce: true,
        rootMargin: rootMargin
    })

    return (
        <div ref={ref} style={{ minHeight }}>
            {isVisible ? children : null}
        </div>
    )
}
