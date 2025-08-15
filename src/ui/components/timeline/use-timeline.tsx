import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { TimestampItem } from './timestamp-item';

export type Group = {
  id: string;
  label?: string;
  items: Item[];
  height: number;
};

export type Item = {
  startTick: number;
  endTick: number;
  width: number | 'auto';
  height: number | 'auto';
  x: number;
  y?: number;
  element: React.ReactElement;
};

export const scaleStyle = {
  transform: 'scaleX(var(--scale-x))',
};

type TimelineOptions = {
  ticksPerSecond: number;
  tickCount: number;
  onContextMenu?: (event: MouseEvent, tick: number) => void;
};

export function useTimeline({ ticksPerSecond, tickCount, onContextMenu }: TimelineOptions) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const positionX = useRef(0);
  const panStartX = useRef(0);
  const panTempPositionX = useRef(0);
  const scale = useRef(1);
  const isDragging = useRef(false);
  const secondsPerPixel = 1;
  const pixelsPerTick = 1 / (secondsPerPixel * ticksPerSecond);
  const blockDurationInMinutes = 2;
  const blockDurationInSeconds = blockDurationInMinutes * 60;
  const blockWidth = blockDurationInSeconds / secondsPerPixel;
  const ticksPerBlock = blockDurationInSeconds * ticksPerSecond;
  const blockCount = Math.ceil(tickCount / ticksPerBlock);
  const updateCssScaleXVariable = (scale: number) => {
    wrapperRef.current?.style.setProperty('--scale-x', String(scale));
  };

  useEffect(() => {
    const timeline = timelineRef.current;
    const wrapper = wrapperRef.current;
    if (timeline === null || wrapper === null) {
      return;
    }

    const timelineWidth = Math.max(blockCount * blockWidth, wrapper.clientWidth);

    timeline.style.width = `${timelineWidth}px`;
    updateCssScaleXVariable(scale.current);
  }, [blockCount, blockWidth]);

  useEffect(() => {
    const timeline = timelineRef.current;
    const wrapper = wrapperRef.current;
    if (timeline === null || wrapper === null) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const updateTransformation = (newPositionX: number, newScale: number) => {
        timeline.style.transform = `translateX(${newPositionX}px) scaleX(${newScale})`;
        updateCssScaleXVariable(1 / newScale);
        scale.current = newScale;
        positionX.current = newPositionX;
      };

      const delta = -event.deltaY;
      const newScale = Math.max(1, delta > 0 ? scale.current * 1.2 : scale.current / 1.2);
      const maxScale = 20;
      if (newScale > maxScale) {
        return;
      }

      const timelineRect = timeline.getBoundingClientRect();
      const offsetX = (event.clientX - timelineRect.x) / scale.current;
      const scaleDifference = newScale - scale.current;
      const newPositionX = Math.min(0, positionX.current - offsetX * scaleDifference);

      updateTransformation(newPositionX, newScale);

      window.requestAnimationFrame(() => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const timelineRect = timeline.getBoundingClientRect();
        const wrapperRightOffset = wrapperRect.right - timelineRect.right;
        if (wrapperRightOffset > 0) {
          updateTransformation(newPositionX + wrapperRightOffset, newScale);
        }
      });
    };

    // Attach a listener instead of using the prop onWheel because React keep these events passive
    // See https://github.com/facebook/react/pull/19654
    timeline.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      timeline.removeEventListener('wheel', onWheel);
    };
  }, []);

  const onMouseDown = (event: React.MouseEvent) => {
    const isMainButton = event.button === 0;
    if (!isMainButton) {
      return;
    }
    isDragging.current = true;
    panStartX.current = event.clientX;
    // Note: On Windows it will not properly work if the dev tools are opened.
    // https://stackoverflow.com/a/16274104
    // eslint-disable-next-line react-hooks/react-compiler
    document.body.style.cursor = 'move';
  };

  const onMouseMove = (event: React.MouseEvent) => {
    const timeline = timelineRef.current;
    const wrapper = wrapperRef.current;
    if (timeline === null || wrapper === null || !isDragging.current) {
      return;
    }

    const offsetX = event.clientX - panStartX.current;
    const newPositionX = positionX.current + offsetX;
    const wrapperRect = wrapper.getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();
    const maxPositionX = 0;
    const minPositionX = wrapperRect.width - timelineRect.width;
    if (newPositionX > maxPositionX || newPositionX < minPositionX) {
      return;
    }

    timeline.style.transform = `translateX(${newPositionX}px) scaleX(${scale.current})`;
    panTempPositionX.current = newPositionX;
  };

  const onMouseUp = () => {
    if (isDragging.current) {
      positionX.current = panTempPositionX.current;
    }

    isDragging.current = false;
    document.body.style.cursor = 'inherit';
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isDragging.current = false;

    if (onContextMenu === undefined) {
      return;
    }

    const timeline = timelineRef.current;
    if (timeline === null) {
      return;
    }
    const timelineRectangle = timeline.getBoundingClientRect();
    const timelineX = timelineRectangle.x;
    const pixelsFromStartDate = (event.clientX - timelineX) / scale.current;
    const tick = Math.ceil(pixelsFromStartDate / pixelsPerTick);
    onContextMenu(event.nativeEvent, tick);
  };

  const buildTimestampsGroup = (): Group => {
    const items: Item[] = [];
    let blockNumber = 0;
    for (let tick = 0; tick < tickCount; tick += ticksPerBlock) {
      items.push({
        startTick: tick,
        endTick: tick,
        width: 'auto',
        height: 'auto',
        x: tick * pixelsPerTick,
        element: <TimestampItem key={tick} minutes={blockNumber * blockDurationInMinutes} />,
      });
      blockNumber++;
    }

    return {
      id: 'timestamps',
      height: 20,
      items: items,
    };
  };
  const timestampGroup = buildTimestampsGroup();

  const renderVerticalLines = () => {
    const verticalLines: ReactNode[] = [];
    for (let index = 0; index <= timestampGroup.items.length; index++) {
      const x = blockWidth * index;
      verticalLines.push(
        <div
          key={`vertical-line-${index}`}
          className="absolute h-full w-px bg-gray-600 opacity-50"
          style={{
            ...scaleStyle,
            left: x,
          }}
        />,
      );
    }

    return verticalLines;
  };

  const renderGroups = (groups: Group[]) => {
    const groupNodes: ReactNode[] = [];
    for (const group of groups) {
      let currentY = 0;

      const itemNodes: ReactNode[] = group.items.map((item, index) => {
        return (
          <div
            className="absolute h-full"
            key={`${group.id}-${item.startTick}-${item.endTick}-${index}`}
            style={{
              left: item.x,
              width: item.width ?? 'auto',
              height: item.height ?? 'auto',
              top: item.y ? currentY + item.y : currentY,
            }}
          >
            {item.element}
          </div>
        );
      });

      groupNodes.push(
        <div key={`group-${group.id}`} className="py-4 border-b border-b-gray-900 last:border-none">
          <div
            className="relative flex items-center"
            style={{
              height: group.height,
            }}
          >
            {itemNodes}
          </div>
        </div>,
      );

      currentY += group.height;
    }

    return groupNodes;
  };

  const render = (groups: Group[]) => {
    return [renderVerticalLines(), renderGroups(groups)];
  };

  return {
    wrapperProps: {
      onContextMenu: handleContextMenu,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      className: 'relative overflow-hidden w-full',
      ref: (ref: HTMLDivElement | null) => {
        if (ref && wrapperRef.current === null) {
          wrapperRef.current = ref;
        }
      },
    },
    timelineProps: {
      className: 'h-full select-none origin-left',
      ref: (ref: HTMLDivElement | null) => {
        if (ref && timelineRef.current === null) {
          timelineRef.current = ref;
        }
      },
    },
    pixelsPerTick,
    ticksPerSecond,
    timestampGroup,
    render,
  };
}
