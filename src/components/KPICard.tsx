import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendResult } from '../utils/analytics';

interface SparkPoint {
  v: number | undefined;
}

interface Props {
  label: string;
  value: number | null;
  valueFormatted: string;
  unit: string;
  trend: TrendResult;
  compareLabel?: string;
  sparkData?: SparkPoint[];
}

function TrendBadge({ trend }: { trend: TrendResult }) {
  if (trend.pctChange === null) {
    return <span className="trend-badge trend-neutral">—</span>;
  }
  const pct = Math.abs(trend.pctChange * 100).toFixed(1);
  const arrow = trend.pctChange > 0 ? '↑' : '↓';
  if (trend.improving === null) {
    return <span className="trend-badge trend-neutral">{arrow} {pct}%</span>;
  }
  return (
    <span className={`trend-badge ${trend.improving ? 'trend-good' : 'trend-bad'}`}>
      {arrow} {pct}%
    </span>
  );
}

const KPICard: React.FC<Props> = ({
  label,
  value,
  valueFormatted,
  unit,
  trend,
  compareLabel,
  sparkData,
}) => {
  const sparkColor =
    trend.improving === true
      ? '#16a34a'
      : trend.improving === false
      ? '#dc2626'
      : '#94a3b8';

  return (
    <div className="kpi-card card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <TrendBadge trend={trend} />
      </div>

      <div className="kpi-value">
        {value !== null ? valueFormatted : '—'}
        {value !== null && unit && (
          <span className="kpi-unit">{unit}</span>
        )}
      </div>

      {compareLabel && (
        <p className="kpi-compare">{compareLabel}</p>
      )}

      {sparkData && sparkData.length > 0 && (
        <div className="kpi-spark">
          <ResponsiveContainer width="100%" height={38}>
            <LineChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                dot={false}
                strokeWidth={1.5}
                stroke={sparkColor}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KPICard;
