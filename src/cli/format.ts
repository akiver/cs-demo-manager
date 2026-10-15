export function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return unitIndex === 0 ? `${value} ${units[0]}` : `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }

  return `${seconds}s`;
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(maxLength - 1, 0))}…`;
}

export function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Pads the cells so that the columns are aligned once the cells of a row are joined, the last column is not padded to
 * not add trailing spaces but truncated so that the rows fit in maxWidth. It's not truncated when the space left is too
 * small, values cut to a few characters would be unreadable, the rows wrap instead.
 */
export function alignColumns(rows: string[][], maxWidth = Number.POSITIVE_INFINITY) {
  const gap = 2;
  const columnCount = rows[0]?.length ?? 0;
  const widths = Array.from({ length: columnCount - 1 }, (_, index) => {
    // A row may have fewer cells than the header.
    return Math.max(...rows.map((row) => (row[index] ?? '').length)) + gap;
  });
  const lastColumnStart = widths.reduce((total, width) => total + width, 0);
  const lastColumnWidth = maxWidth - lastColumnStart;
  const minLastColumnWidth = 20;

  return rows.map((row) => {
    return row.map((cell, index) => {
      if (index < widths.length) {
        return cell.padEnd(widths[index]);
      }

      return lastColumnWidth < minLastColumnWidth ? cell : truncate(cell, lastColumnWidth);
    });
  });
}
