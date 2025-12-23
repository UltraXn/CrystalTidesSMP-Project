import { useEffect, useRef } from 'react'
import anime from 'animejs'

export default function HeroParticles() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Configuration
        const numParticles = 30
        const colors = ['#89D9D1', '#168C80', '#0C5952', '#ffffff']

        // Create particles
        const particles = []
        for (let i = 0; i < numParticles; i++) {
            const el = document.createElement('div')
            el.classList.add('particle')

            // Random initial properties
            const size = Math.random() * 8 + 2 // 2px to 10px
            const color = colors[Math.floor(Math.random() * colors.length)]

            el.style.width = `${size}px`
            el.style.height = `${size}px`
            el.style.backgroundColor = color
            el.style.position = 'absolute'
            el.style.borderRadius = '50%'
            el.style.opacity = String(Math.random() * 0.5 + 0.1) // 0.1 to 0.6
            el.style.left = `${Math.random() * 100}%`
            el.style.top = `${Math.random() * 100}%`
            // Simple blur for "light/bubble" effect
            el.style.filter = `blur(${Math.random() * 2}px)`

            container.appendChild(el)
            particles.push(el)
        }

        // Animate particles
        const animation = anime({
            targets: particles,
            translateX: () => anime.random(-100, 100),
            translateY: () => anime.random(-100, 100),
            scale: () => [0.5, 1.5],
            opacity: () => [0.1, 0.6],
            easing: 'easeInOutSine',
            duration: () => anime.random(3000, 8000),
            delay: () => anime.random(0, 2000),
            direction: 'alternate',
            loop: true
        })

        return () => {
            animation.pause()
            // Cleanup particles
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild)
                }
            }
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="hero-particles"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 1, // Between background (-1) and content (2)
                pointerEvents: 'none' // Click through
            }}
        />
    )
}
