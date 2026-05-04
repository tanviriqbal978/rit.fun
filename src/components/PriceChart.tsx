import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { COLORS } from '../constants';

export function PriceChart({ data }: { data: any[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: COLORS.textSecondary,
      },
      grid: {
        vertLines: { color: COLORS.border },
        horzLines: { color: COLORS.border },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderVisible: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: COLORS.success,
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: COLORS.success,
      wickDownColor: '#ef4444',
    });

    if (data && data.length > 0) {
      series.setData(data);
    } else {
        // Mock data for initial view if no trades
        series.setData([
            { time: '2024-01-01', open: 0.0000001, high: 0.00000015, low: 0.0000001, close: 0.00000012 },
            { time: '2024-01-02', open: 0.00000012, high: 0.0000002, low: 0.00000012, close: 0.00000018 },
        ]);
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
}
