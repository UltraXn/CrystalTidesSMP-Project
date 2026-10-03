import { secureRandom } from '../../utils/random';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './TypingBubbles.css';

interface Bubble {
  id: number;
  left: number;
  size: number;
}

function BubbleItem({ bubble, onExpire }: { bubble: Bubble; onExpire: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onExpire(bubble.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [bubble.id, onExpire]);

  return (
    <div
      className="typing-bubble"
      onAnimationEnd={() => onExpire(bubble.id)}
      style={{
        left: `${bubble.left}vw`,
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
      }}
    />
  );
}

function createRandomBubble(): Bubble {
  return {
    id: Date.now() + secureRandom(),
    left: secureRandom() * 100,
    size: secureRandom() * 20 + 10,
  };
}

export default function TypingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const onKeyDown = () => {
      setBubbles((prev) => [...prev, createRandomBubble()]);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleExpire = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return createPortal(
    <div className="typing-bubbles-container" aria-hidden="true">
      {bubbles.map((bubble) => (
        <BubbleItem key={bubble.id} bubble={bubble} onExpire={handleExpire} />
      ))}
    </div>,
    document.body,
  );
}
