'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useLanguage();

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: t('countdown_days') },
    { value: timeLeft.hours, label: t('countdown_hours') },
    { value: timeLeft.minutes, label: t('countdown_minutes') },
    { value: timeLeft.seconds, label: t('countdown_seconds') },
  ];

  return (
    <div className="flex items-start justify-center" style={{ gap: '50px' }}>
      {units.map((unit, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gap: '5px' }}>
          <span
            className="text-white font-bold text-center"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '30px',
              lineHeight: '36px',
              letterSpacing: '0.4px',
            }}
          >
            {String(unit.value).padStart(2, '0')}
          </span>
          <span
            className="text-white text-center"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
            }}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
