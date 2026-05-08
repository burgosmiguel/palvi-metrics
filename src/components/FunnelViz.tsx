import React from 'react';
import { FunnelStage } from '../utils/analytics';

function formatNum(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function convRateColor(rate: number): string {
  if (rate >= 0.4) return '#15803d';
  if (rate >= 0.2) return '#92400e';
  return '#dc2626';
}

const BAR_COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

interface Props {
  stages: FunnelStage[];
}

const FunnelViz: React.FC<Props> = ({ stages }) => {
  const maxLog = Math.log(stages[0].value + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stages.map((stage, i) => {
        const widthPct = maxLog > 0
          ? (Math.log(stage.value + 1) / maxLog) * 100
          : 0;

        return (
          <React.Fragment key={stage.label}>
            {stage.convRate !== null && (
              <div className="funnel-conv-row">
                <div className="funnel-conv-label" />
                <div className="funnel-conv-line">
                  <span style={{ color: '#cbd5e1', fontSize: 16 }}>↓</span>
                  <span
                    className="funnel-conv-text"
                    style={{ color: convRateColor(stage.convRate) }}
                  >
                    {(stage.convRate * 100).toFixed(1)}% conversión
                  </span>
                </div>
              </div>
            )}

            <div className="funnel-row">
              <span className="funnel-label">{stage.label}</span>
              <div className="funnel-bar-track">
                <div
                  className="funnel-bar-fill"
                  style={{
                    width: `${widthPct}%`,
                    background: BAR_COLORS[i] ?? '#2563eb',
                    minWidth: stage.value > 0 ? 40 : 0,
                  }}
                >
                  {widthPct > 12 && (
                    <span className="funnel-bar-text">{formatNum(stage.value)}</span>
                  )}
                </div>
              </div>
              <span className="funnel-value">{formatNum(stage.value)}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FunnelViz;
