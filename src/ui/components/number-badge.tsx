import React, { useEffect, useState } from 'react';

type Props = {
  number: number;
};

export function NumberBadge({ number }: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let timeoutId = 0;

    if (number !== 0) {
      setAnimate(true);
      timeoutId = window.setTimeout(() => {
        setAnimate(false);
      }, 300);
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [number]);

  if (number === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center h-20 min-w-20 bg-blue-700 text-white px-4 rounded-full text-center transition-[300ms]"
      style={{
        transform: `translateY(${animate ? '-30px' : 0})`,
      }}
    >
      <p className="text-caption">{number}</p>
    </div>
  );
}
