'use client';

import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Parse the target number from formatted string like "82.6K", "1.2M", "24/7"
  const parseTarget = (val) => {
    const str = String(val);
    // Handle special cases like "24/7"
    if (str.includes('/')) return { target: null, display: str };
    
    const match = str.match(/^([\d,.]+)\s*([KMkm]?)$/);
    if (!match) return { target: null, display: str };
    
    const num = parseFloat(match[1].replace(',', ''));
    const unit = match[2].toUpperCase();
    return { target: num, unit, display: str };
  };

  const { target, unit, display } = parseTarget(value);

  // IntersectionObserver to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  // Animate the count
  useEffect(() => {
    if (!started || target === null) return;

    const startTime = performance.now();
    const startVal = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startVal + (target - startVal) * eased;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [started, target, duration]);

  // Format the displayed number
  const formatCount = () => {
    if (target === null) return display; // Special values like "24/7"
    
    if (!started) return '0' + (unit || '');

    // If target has decimals (like 82.6K)
    if (target % 1 !== 0) {
      return count.toFixed(1) + (unit || '');
    }
    return Math.round(count).toLocaleString() + (unit || '');
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatCount()}{suffix}
    </span>
  );
}
