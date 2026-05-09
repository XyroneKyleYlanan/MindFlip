import { useState, useEffect, useRef } from 'react';

export default function useCountdown(seconds, onTimeout) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);

  const start = () => {
    setTimeLeft(seconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setTimeLeft(seconds);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return { timeLeft, start, stop, reset };
}