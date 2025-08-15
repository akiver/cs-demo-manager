import React, { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

function estimateSize() {
  return 58;
}

type Props<ItemType> = {
  items: ItemType[];
  renderItem: (item: ItemType) => ReactNode;
};

export function VirtualListResults<ItemType>({ items, renderItem }: Props<ItemType>) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { getVirtualItems, getTotalSize } = useVirtualizer({
    count: items.length,
    getScrollElement: () => {
      return wrapperRef.current;
    },
    estimateSize,
    overscan: 10,
  });

  const virtualItems = getVirtualItems();
  const totalSize = getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;
  const containerStyle: React.CSSProperties = {
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
  };

  return (
    <div className="size-full overflow-y-auto pr-4" ref={wrapperRef}>
      {wrapperRef.current && (
        <div style={containerStyle} className="flex flex-col gap-y-8">
          {virtualItems.map((item) => {
            return renderItem(items[item.index]);
          })}
        </div>
      )}
    </div>
  );
}
