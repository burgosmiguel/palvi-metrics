import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number | null;
}

interface Props {
  data: DataPoint[];
  color: string;
  unit?: string;
  area?: boolean;
  referenceLine?: number;
  referenceLabel?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null }>;
  label?: string;
}

function CustomTooltip({ active, payload, label, unit }: TooltipProps & { unit?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  if (v === null || v === undefined) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      padding: '6px 10px',
      fontSize: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>
        {v.toFixed(1)}{unit ? ` ${unit}` : ''}
      </p>
    </div>
  );
}

const TrendChart: React.FC<Props> = ({ data, color, unit, area = false, referenceLine, referenceLabel }) => {
  const vals = data.map(d => d.value).filter((v): v is number => v !== null);
  if (vals.length === 0) return null;

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = Math.max((max - min) * 0.15, max * 0.05);
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;

  const chartData = data.map(d => ({ date: d.date, value: d.value }));

  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 10, fill: '#94a3b8' }}
        tickLine={false}
        axisLine={false}
        interval={6}
      />
      <YAxis
        domain={[yMin, yMax]}
        tick={{ fontSize: 10, fill: '#94a3b8' }}
        tickLine={false}
        axisLine={false}
        width={36}
      />
      <Tooltip content={<CustomTooltip unit={unit} />} />
      {referenceLine !== undefined && (
        <ReferenceLine
          y={referenceLine}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{ value: referenceLabel ?? '', fontSize: 10, fill: '#94a3b8', position: 'insideTopRight' }}
        />
      )}
    </>
  );

  const commonChartProps = {
    data: chartData,
    margin: { top: 4, right: 4, bottom: 0, left: 0 },
  };

  return (
    <ResponsiveContainer width="100%" height={170}>
      {area ? (
        <AreaChart {...commonChartProps}>
          {common}
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace('#', '')})`}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <LineChart {...commonChartProps}>
          {common}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default TrendChart;
