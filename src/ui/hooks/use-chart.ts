import { useEffect, useRef } from 'react';
import type {
  EChartsOption,
  XAXisComponentOption,
  YAXisComponentOption,
  GridComponentOption,
  TooltipComponentOption,
  BarSeriesOption,
} from 'echarts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  MarkLineComponent,
]);

type ChartOption = EChartsOption & {
  zoomEnabled?: boolean;
};

export function useChart({ option }: { option: ChartOption }) {
  const domRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (domRef.current === null) {
      return;
    }

    const currentInstance = echarts.getInstanceByDom(domRef.current);
    if (currentInstance === undefined) {
      instanceRef.current = echarts.init(domRef.current);
    }
  });

  useEffect(() => {
    if (instanceRef.current !== null) {
      instanceRef.current.setOption({
        ...option,
        textStyle: {
          fontFamily: 'Inter var',
        },
      });
    }
  }, [option]);

  useEffect(() => {
    return () => {
      instanceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      instanceRef.current?.resize();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Workaround to be able to scroll the page when scrolling from inside the chart while making the chart zoomable when
  // holding the shift key and scrolling.
  // { zoomOnMouseWheel: 'shift', preventDefaultMouseMove: false } doesn't work.
  // See issue https://github.com/apache/echarts/issues/10079
  // The workaround is to toggle the zoomLock option when the shift key is pressed.
  useEffect(() => {
    if (!option.zoomEnabled) {
      return;
    }
    const chart = instanceRef.current;
    if (!chart) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey) {
        return;
      }

      const onKeyUp = () => {
        chart.setOption({
          dataZoom: { zoomLock: true },
        });
        window.removeEventListener('keyup', onKeyUp);
      };

      window.addEventListener('keyup', onKeyUp);

      chart.setOption({
        dataZoom: { zoomLock: false },
      });
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [option]);

  return {
    ref: domRef,
    getChartInstance: () => {
      const instance = instanceRef.current;
      if (instance === null) {
        throw new Error('Echarts instance is null');
      }

      return instance;
    },
  };
}

export type ChartTextStyle = {
  width?: number;
  height: number;
  backgroundColor: {
    image: string;
  };
};
export type {
  ChartOption,
  XAXisComponentOption,
  YAXisComponentOption,
  GridComponentOption,
  TooltipComponentOption,
  BarSeriesOption,
};
