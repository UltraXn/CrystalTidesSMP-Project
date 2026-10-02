import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./TypingBubbles.css";

interface Bubble {
  id: number;
  left: number;
  size: number;
}

export default function TypingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const handleKeyPress = () => {
      const id = Date.now() + Math.random();
      const left = Math.random() * 100; // Random horizontal position
      const size = Math.random() * 20 + 10; // Random size between 10px and 30px

      const newBubble = {
        id,
        left,
        size,
      };

      setBubbles((prev) => [...prev, newBubble]);

      // Remove bubble after animation
      const timer = setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
        timers.delete(timer);
      }, 2000);
      timers.add(timer);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return createPortal(
    <div className="typing-bubbles-container" aria-hidden="true">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="typing-bubble"
          style={{
            left: `${bubble.left}vw`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
