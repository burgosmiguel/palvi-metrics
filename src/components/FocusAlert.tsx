import React from 'react';
import { FocusAlert as FocusAlertType } from '../utils/analytics';

const CONFIG = {
  critical: {
    bg: '#fff1f1',
    border: '#fca5a5',
    icon: '⚠',
    eyebrow: 'Atención crítica',
    eyebrowColor: '#dc2626',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: '◉',
    eyebrow: 'Foco del día',
    eyebrowColor: '#b45309',
  },
  good: {
    bg: '#f0fdf4',
    border: '#86efac',
    icon: '✓',
    eyebrow: 'Tendencia positiva',
    eyebrowColor: '#15803d',
  },
} as const;

interface Props {
  alert: FocusAlertType;
}

const FocusAlert: React.FC<Props> = ({ alert }) => {
  const cfg = CONFIG[alert.severity];

  return (
    <div
      className="focus-alert"
      style={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
      }}
    >
      <span className="focus-alert-icon">{cfg.icon}</span>
      <div>
        <p className="focus-alert-eyebrow" style={{ color: cfg.eyebrowColor }}>
          {cfg.eyebrow}
        </p>
        <h2 className="focus-alert-title">{alert.title}</h2>
        <p className="focus-alert-desc">{alert.description}</p>
      </div>
    </div>
  );
};

export default FocusAlert;
