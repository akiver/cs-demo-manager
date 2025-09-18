import React from 'react';
import { motion } from 'motion/react';

type Props = {
  number: number;
};

export function NumberBadge({ number }: Props) {
  if (number === 0) {
    return null;
  }

  return (
    <motion.div
      className="flex h-20 min-w-20 items-center justify-center rounded-full bg-blue-700 px-4 text-center text-white transition-[300ms]"
      animate={{ translateY: [0, -60, 0], scale: [1, 4.5, 1], transition: { duration: 0.5 } }}
    >
      <p className="text-caption">{number}</p>
    </motion.div>
  );
}
