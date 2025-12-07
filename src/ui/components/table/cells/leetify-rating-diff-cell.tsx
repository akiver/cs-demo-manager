import React from 'react';
import type { CellProps } from '../table-types';

type Props = CellProps<{ leetifyRating: number | null }>;

export function LeetifyRatingDiffCell({ data }: Props) {
  const diff = data.leetifyRating;
  if (diff === null) {
    return null;
  }

  const text = diff > 0 ? `+${diff}` : diff.toString();

  const getColor = () => {
    if (diff > 5) {
      return '#7bdbbc'; // great
    }

    if (diff > 2) {
      return '#addb85'; // good
    }

    if (diff > -2) {
      return '#bebebe'; // average
    }

    if (diff > -5) {
      return '#fdd97c'; // subpar
    }

    return '#fd947c'; // poor
  };

  return (
    <span
      className="selectable"
      style={{
        color: getColor(),
      }}
    >
      {text}
    </span>
  );
}
