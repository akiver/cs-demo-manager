import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { Popover, PopoverContent, PopoverTrigger } from 'csdm/ui/components/popover/popover';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { PencilIcon } from 'csdm/ui/icons/pencil-icon';
import { RangeInput } from 'csdm/ui/components/inputs/range-input';
import { EraserIcon } from 'csdm/ui/icons/eraser-icon';
import { Button } from 'csdm/ui/components/buttons/button';
import type { DrawableCanvas } from '../drawing/use-drawable-canvas';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { KeyboardKey, KeyboardKeys } from 'csdm/ui/components/keyboard-keys';
import { modifierKey } from 'csdm/ui/keyboard/keyboard-shortcut';

type ToolButtonProps = {
  isSelected: boolean;
  tooltip: ReactNode;
};

function ToolButton({
  children,
  onClick,
  isSelected,
  tooltip,
}: { children: ReactNode; onClick: () => void } & ToolButtonProps) {
  return (
    <Tooltip content={tooltip} placement="top">
      <button
        onClick={onClick}
        className={clsx(
          'flex cursor-pointer items-center justify-center rounded-4 p-4 text-gray-900 transition-colors duration-200',
          isSelected ? 'bg-gray-400' : 'bg-gray-75',
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function ColorButton({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      className={clsx(
        'size-32 cursor-pointer border-2 border-white outline-3',
        selected ? `scale-110 rounded-8 outline-blue-700 transition-all duration-200` : `rounded-4 outline-transparent`,
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );
}

type Props = {
  drawing: DrawableCanvas;
};

function DrawingPopover({ drawing }: Props) {
  const {
    drawingTool,
    setDrawingTool,
    drawingSize,
    setDrawingSize,
    drawingColor,
    setDrawingColor,
    toggleMode,
    isDrawingMode,
  } = useViewerContext();
  const colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffa500', '#800080'];

  return (
    <div className="flex w-[24rem] flex-col gap-y-16 rounded-8 bg-gray-100 p-16">
      <div className="flex gap-x-16">
        <div className="flex flex-col gap-y-16">
          <div className="flex flex-col gap-y-8">
            <p>
              <Trans>Tool</Trans>
            </p>
            <div className="flex items-center gap-x-8">
              <ToolButton
                onClick={() => setDrawingTool('pen')}
                isSelected={drawingTool === 'pen'}
                tooltip={<Trans>Pen</Trans>}
              >
                <PencilIcon className="size-32" />
              </ToolButton>
              <ToolButton
                onClick={() => setDrawingTool('eraser')}
                isSelected={drawingTool === 'eraser'}
                tooltip={<Trans>Eraser</Trans>}
              >
                <EraserIcon className="size-32" />
              </ToolButton>
            </div>
          </div>

          <div className="flex w-[11rem] flex-col gap-y-8">
            <div className="flex items-end gap-x-8">
              <RangeInput label={<Trans>Size</Trans>} min={1} max={10} onChange={setDrawingSize} value={drawingSize} />
              <p className="text-body-strong">{drawingSize}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-8">
          <p>
            <Trans>Color</Trans>
          </p>
          <div className="flex flex-wrap gap-12">
            {colors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                selected={color === drawingColor}
                onClick={() => {
                  setDrawingColor(color);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <Tooltip
          content={
            <KeyboardKeys>
              <KeyboardKey>{modifierKey}</KeyboardKey>
              <KeyboardKey>Z</KeyboardKey>
            </KeyboardKeys>
          }
          placement="top"
        >
          <Button onClick={drawing.undo}>
            <Trans>Undo</Trans>
          </Button>
        </Tooltip>
        <Tooltip
          content={
            <KeyboardKeys>
              <KeyboardKey>{modifierKey}</KeyboardKey>
              <KeyboardKey>Shift</KeyboardKey>
              <KeyboardKey>Z</KeyboardKey>
            </KeyboardKeys>
          }
          placement="top"
        >
          <Button onClick={drawing.redo}>
            <Trans>Redo</Trans>
          </Button>
        </Tooltip>
        <Tooltip
          content={
            <KeyboardKeys>
              <KeyboardKey>{modifierKey}</KeyboardKey>
              <KeyboardKey>X</KeyboardKey>
            </KeyboardKeys>
          }
          placement="top"
        >
          <Button onClick={drawing.clear}>
            <Trans>Clear</Trans>
          </Button>
        </Tooltip>
      </div>

      <div>
        <Tooltip content={<KeyboardKey>D</KeyboardKey>} placement="top">
          <Button onClick={toggleMode}>
            {isDrawingMode ? <Trans>Stop drawing</Trans> : <Trans>Start drawing</Trans>}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

export function DrawingButton({ drawing }: Props) {
  const { mode, toggleMode } = useViewerContext();

  return (
    <Popover openOnHover={true} closeDelay={300}>
      <PopoverTrigger asChild={true}>
        <PlaybackBarButton onClick={toggleMode}>
          <PencilIcon className={clsx('size-20', mode === 'drawing' && 'text-red-700')} />
        </PlaybackBarButton>
      </PopoverTrigger>

      <PopoverContent>
        <DrawingPopover drawing={drawing} />
      </PopoverContent>
    </Popover>
  );
}
