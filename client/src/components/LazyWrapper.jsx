import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

export default function LazyWrapper({ children, minHeight = "200px" }) {
    const [ref, isVisible] = useIntersectionObserver({
        triggerOnce: true,
        rootMargin: "200px 0px" // Start loading 200px before the element enters the viewport
    })

    return (
        <div ref={ref} style={{ minHeight }}>
            {isVisible ? children : null}
        </div>
    )
}
