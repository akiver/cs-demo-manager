import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

type Props = {
  startSeconds: number;
  endSeconds: number;
  maxDurationSeconds: number;
  bombPlantSeconds?: number | null;
  onChange: (startSeconds: number, endSeconds: number) => void;
};

type PresetButton = {
  label: React.ReactNode;
  startSeconds: number;
  endSeconds: number;
};

function formatTime(seconds: number): string {
  const roundedSeconds = Math.round(seconds);
  const mins = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}

export function TimeRangeSlider({ startSeconds, endSeconds, maxDurationSeconds, bombPlantSeconds, onChange }: Props) {
  const { t } = useLingui();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const [localStart, setLocalStart] = useState(startSeconds);
  const [localEnd, setLocalEnd] = useState(Math.min(endSeconds, maxDurationSeconds));

  useEffect(() => {
    setLocalStart(startSeconds);
    setLocalEnd(Math.min(endSeconds, maxDurationSeconds));
  }, [startSeconds, endSeconds, maxDurationSeconds]);

  const clampedMax = Math.max(maxDurationSeconds, 1);

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) {
        return 0;
      }
      const rect = track.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(fraction * clampedMax);
    },
    [clampedMax],
  );

  const handleMouseDown = useCallback(
    (handle: 'start' | 'end') => (event: React.MouseEvent) => {
      event.preventDefault();
      setDragging(handle);
    },
    [],
  );

  useEffect(() => {
    if (dragging === null) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const seconds = getPositionFromEvent(event.clientX);
      if (dragging === 'start') {
        setLocalStart(Math.min(seconds, localEnd));
      } else {
        setLocalEnd(Math.max(seconds, localStart));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      // Fire onChange only on mouse-up to avoid excessive queries
      onChange(localStart, localEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, localStart, localEnd, getPositionFromEvent, onChange]);

  const startPercent = (localStart / clampedMax) * 100;
  const endPercent = (localEnd / clampedMax) * 100;

  const presets: PresetButton[] = [
    {
      label: <Trans context="Heatmap time preset">Full Round</Trans>,
      startSeconds: 0,
      endSeconds: clampedMax,
    },
    {
      label: <Trans context="Heatmap time preset">First 20s</Trans>,
      startSeconds: 0,
      endSeconds: Math.min(20, clampedMax),
    },
    {
      label: <Trans context="Heatmap time preset">Last 20s</Trans>,
      startSeconds: Math.max(clampedMax - 20, 0),
      endSeconds: clampedMax,
    },
  ];

  if (bombPlantSeconds !== undefined && bombPlantSeconds !== null && bombPlantSeconds > 0) {
    presets.push(
      {
        label: <Trans context="Heatmap time preset">Pre-plant</Trans>,
        startSeconds: 0,
        endSeconds: bombPlantSeconds,
      },
      {
        label: <Trans context="Heatmap time preset">Post-plant</Trans>,
        startSeconds: bombPlantSeconds,
        endSeconds: clampedMax,
      },
    );
  }

  const handlePresetClick = (preset: PresetButton) => {
    const newStart = Math.max(0, Math.min(preset.startSeconds, clampedMax));
    const newEnd = Math.max(newStart, Math.min(preset.endSeconds, clampedMax));
    setLocalStart(newStart);
    setLocalEnd(newEnd);
    onChange(newStart, newEnd);
  };

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans context="Heatmap filter label">Time Range</Trans>
      </p>
      <div className="flex items-center justify-between text-caption text-gray-600">
        <span>{formatTime(localStart)}</span>
        <span>{formatTime(localEnd)}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-8 cursor-pointer rounded-4 bg-gray-300"
        title={t({ context: 'Heatmap time slider', message: 'Drag handles to select time range' })}
      >
        {/* Bomb plant marker (shown when a single round is selected) */}
        {bombPlantSeconds !== undefined &&
          bombPlantSeconds !== null &&
          bombPlantSeconds > 0 &&
          (() => {
            const percent = (bombPlantSeconds / clampedMax) * 100;
            const formattedTime = formatTime(bombPlantSeconds);
            return percent > 0 && percent < 100 ? (
              <div
                className="absolute -top-4 h-16 w-[2px] bg-orange-600"
                style={{ left: `${percent}%` }}
                title={t({
                  context: 'Heatmap time marker',
                  message: `Bomb planted (${formattedTime})`,
                })}
              />
            ) : null;
          })()}
        {/* Selected range highlight */}
        <div
          className="absolute h-full rounded-4 bg-blue-400"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />
        {/* Start handle */}
        <div
          className="absolute top-1/2 z-10 size-16 -translate-1/2 cursor-grab rounded-full border-2 border-blue-600 bg-gray-50 active:cursor-grabbing"
          style={{ left: `${startPercent}%` }}
          onMouseDown={handleMouseDown('start')}
          role="slider"
          aria-label={t({ context: 'Heatmap time slider', message: 'Start time' })}
          aria-valuemin={0}
          aria-valuemax={clampedMax}
          aria-valuenow={localStart}
          tabIndex={0}
        />
        {/* End handle */}
        <div
          className="absolute top-1/2 z-10 size-16 -translate-1/2 cursor-grab rounded-full border-2 border-blue-600 bg-gray-50 active:cursor-grabbing"
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleMouseDown('end')}
          role="slider"
          aria-label={t({ context: 'Heatmap time slider', message: 'End time' })}
          aria-valuemin={0}
          aria-valuemax={clampedMax}
          aria-valuenow={localEnd}
          tabIndex={0}
        />
      </div>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-4">
        {presets.map((preset, index) => {
          return (
            <button
              key={index}
              className="cursor-default rounded-4 border border-gray-400 bg-gray-50 px-8 py-4 text-caption select-none hover:bg-gray-100 hover:text-gray-900"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
