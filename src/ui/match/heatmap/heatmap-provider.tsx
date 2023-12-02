import type { Map } from 'csdm/common/types/map';
import type { HeatmapPoint } from 'csdm/ui/shared/heatmap-renderer';
import { HeatmapRenderer } from 'csdm/ui/shared/heatmap-renderer';
import { getScaledCoordinateX } from 'csdm/ui/maps/get-scaled-coordinate-x';
import { getScaledCoordinateY } from 'csdm/ui/maps/get-scaled-coordinate-y';
import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';
import React, { useEffect, useRef, useState } from 'react';
import { HeatmapContext, type HeatmapDrawOptions } from './heatmap-context';
import type { HeatmapFilter, HeatmapOptions } from 'csdm/common/types/heatmap-options';
import { useHeatmapState } from './use-heatmap-state';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useCurrentMatchChecksum } from '../use-current-match-checksum';
import type { Point } from 'csdm/common/types/point';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { drawDone, fetchPointsSuccess } from './heatmap-actions';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  map: Map;
  radarImage: HTMLImageElement;
  children: React.ReactNode;
};

export function HeatmapProvider({ map, radarImage, children }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const _ = useI18n();
  const checksum = useCurrentMatchChecksum();
  const [canvasSize, setCanvasSize] = useState(MAP_RADAR_SIZE);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapRendererRef = useRef<HeatmapRenderer | null>(null);
  const { radius, blur, alpha, event, rounds, sides, steamIds, teamNames } = useHeatmapState();
  const points = useRef<Point[]>([]);
  const initialDrawDone = useRef(false);

  const draw = (options?: Partial<HeatmapDrawOptions>) => {
    const radar = radarCanvasRef.current;
    if (radar === null) {
      throw new Error('Radar canvas is not initialized');
    }

    const heatmapRenderer = heatmapRendererRef.current;
    if (heatmapRenderer === null) {
      throw new Error('Heatmap is not initialized');
    }

    const context = radar.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(radarImage, 0, 0, radar.width, radar.height);

    const scaledPoints: HeatmapPoint[] = points.current.map((point) => {
      return [getScaledCoordinateX(map, radar.width, point.x), getScaledCoordinateY(map, radar.width, point.y), 1];
    });
    const newAlpha = options?.alpha ?? alpha;
    const newRadius = options?.radius ?? radius;
    const newBlur = options?.blur ?? blur;
    heatmapRenderer.setAlpha(newAlpha);
    heatmapRenderer.setRadius(newRadius, newBlur);
    heatmapRenderer.setPoints(scaledPoints);
    heatmapRenderer.draw();
    dispatch(drawDone({ blur: newBlur, alpha: newAlpha, radius: newRadius }));
  };

  const fetchPointsAndDraw = async (options?: Partial<HeatmapFilter>) => {
    try {
      const filter: HeatmapFilter = {
        event: options?.event ?? event,
        rounds: options?.rounds ?? rounds,
        sides: options?.sides ?? sides,
        teamNames: options?.teamNames ?? teamNames,
        steamIds: options?.steamIds ?? steamIds,
      };
      const heatmapOptions: HeatmapOptions = {
        checksum,
        map,
        ...filter,
      };
      points.current = await client.send({
        name: RendererClientMessageName.FetchHeatmapPoints,
        payload: heatmapOptions,
      });
      dispatch(fetchPointsSuccess(filter));

      draw();
    } catch (error) {
      showToast({
        content: _({
          id: 'errorOccurred',
          message: 'An error occurred',
        }),
        id: 'generate-heatmap-error',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (!initialDrawDone.current) {
      fetchPointsAndDraw();
      initialDrawDone.current = true;
    }
  });

  const buildImageBase64 = () => {
    const radarCanvas = radarCanvasRef.current;
    if (radarCanvas === null) {
      throw new Error('Radar canvas is not initialized');
    }
    const heatmapCanvas = heatmapCanvasRef.current;
    if (heatmapCanvas === null) {
      throw new Error('Heatmap canvas is not initialized');
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(radarCanvas, 0, 0);
    context.drawImage(heatmapCanvas, 0, 0);

    return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  };

  const setRadarCanvas = (canvas: HTMLCanvasElement) => {
    radarCanvasRef.current = canvas;
  };

  const setHeatmapCanvas = (canvas: HTMLCanvasElement) => {
    if (heatmapCanvasRef.current === null) {
      heatmapCanvasRef.current = canvas;
    }
    if (heatmapRendererRef.current === null) {
      heatmapRendererRef.current = new HeatmapRenderer(canvas);
    }
  };

  return (
    <HeatmapContext.Provider
      value={{
        canvasSize,
        setCanvasSize: (size: number) => {
          setCanvasSize(size);
          draw();
        },
        setRadarCanvas,
        setHeatmapCanvas,
        buildImageBase64,
        fetchPointsAndDraw,
        draw,
        alpha,
        blur,
        radius,
        event,
        rounds,
        sides,
        teamNames,
        steamIds,
      }}
    >
      {children}
    </HeatmapContext.Provider>
  );
}
