import { Dataset, DayData, MetricsData } from '../types';

const AVG_METRICS = new Set([
  'avg_response_time_min',
  'avg_deal_cycle_days',
  'support_avg_resolution_hours',
]);

export function aggregateDatasets(data: MetricsData): Dataset {
  const datasets = [data.A, data.B, data.C, data.D];
  const ref = data.A;
  const metricKeys = ref.metadata.metrics.map(m => m.key);

  const days: DayData[] = ref.days.map(refDay => {
    const daySlices = datasets.map(
      ds => ds.days.find(d => d.date === refDay.date),
    );
    const metrics: Record<string, number | null> = {};

    for (const key of metricKeys) {
      const vals = daySlices
        .map(d => d?.metrics[key] ?? null)
        .filter((v): v is number => v !== null);

      if (vals.length === 0) {
        metrics[key] = null;
      } else if (AVG_METRICS.has(key)) {
        metrics[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
      } else {
        metrics[key] = vals.reduce((a, b) => a + b, 0);
      }
    }

    return { date: refDay.date, metrics };
  });

  return { metadata: ref.metadata, days };
}

export function avgMetric(days: DayData[], key: string): number | null {
  const vals = days
    .map(d => d.metrics[key])
    .filter((v): v is number => v !== null && v !== undefined && !isNaN(Number(v)));
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

export function sumMetric(days: DayData[], key: string): number {
  return days.reduce((acc, d) => {
    const v = d.metrics[key];
    return acc + (v !== null && v !== undefined ? v : 0);
  }, 0);
}

export function winRate(days: DayData[]): number | null {
  const won = sumMetric(days, 'deals_won');
  const lost = sumMetric(days, 'deals_lost');
  const total = won + lost;
  return total > 0 ? won / total : null;
}

export interface TrendResult {
  pctChange: number | null;
  improving: boolean | null;
}

export function calcTrend(
  current: number | null,
  previous: number | null,
  direction: 'higher_is_better' | 'lower_is_better',
): TrendResult {
  if (current === null || previous === null || previous === 0) {
    return { pctChange: null, improving: null };
  }
  const pctChange = (current - previous) / Math.abs(previous);
  const threshold = 0.02;
  if (Math.abs(pctChange) < threshold) {
    return { pctChange, improving: null };
  }
  const improving = direction === 'higher_is_better' ? pctChange > 0 : pctChange < 0;
  return { pctChange, improving };
}

export interface FunnelStage {
  label: string;
  value: number;
  convRate: number | null;
}

export function calcFunnel(days: DayData[]): FunnelStage[] {
  const traffic = sumMetric(days, 'traffic');
  const leads = sumMetric(days, 'leads_created');
  const qualified = sumMetric(days, 'leads_qualified');
  const deals = sumMetric(days, 'deals_created');
  const won = sumMetric(days, 'deals_won');

  return [
    { label: 'Visitas', value: traffic, convRate: null },
    { label: 'Leads', value: leads, convRate: traffic > 0 ? leads / traffic : null },
    { label: 'Calificados', value: qualified, convRate: leads > 0 ? qualified / leads : null },
    { label: 'Deals', value: deals, convRate: qualified > 0 ? deals / qualified : null },
    { label: 'Ganados', value: won, convRate: deals > 0 ? won / deals : null },
  ];
}

export function formatMetricValue(key: string, value: number): string {
  if (key === 'avg_response_time_min') return `${value.toFixed(1)}`;
  if (key === 'avg_deal_cycle_days') return `${value.toFixed(1)}`;
  if (key === 'support_avg_resolution_hours') return `${value.toFixed(1)}`;
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  if (value % 1 === 0) return value.toLocaleString();
  return value.toFixed(1);
}

export interface FocusAlert {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'good';
}

function pctDiff(a: number | null, b: number | null): number {
  if (a === null || b === null || b === 0) return 0;
  return (a - b) / Math.abs(b);
}

export function detectFocus(dataset: Dataset): FocusAlert {
  const { days } = dataset;
  const last7 = days.slice(-7);
  const prev7 = days.slice(-14, -7);
  const last30 = days.slice(-30);
  const prev30 = days.slice(-60, -30);

  const rtChange = pctDiff(
    avgMetric(last7, 'avg_response_time_min'),
    avgMetric(prev7, 'avg_response_time_min'),
  );
  const staleChange = pctDiff(
    avgMetric(last7, 'stale_deals'),
    avgMetric(prev7, 'stale_deals'),
  );
  const leadsChange = pctDiff(
    avgMetric(last7, 'leads_created'),
    avgMetric(prev7, 'leads_created'),
  );
  const suppChange = pctDiff(
    avgMetric(last7, 'support_tickets_opened'),
    avgMetric(prev7, 'support_tickets_opened'),
  );
  const wrChange = pctDiff(winRate(last30), winRate(prev30));
  const wrLast = winRate(last30);
  const wrPrev = winRate(prev30);

  const issues: Array<{ score: number; alert: FocusAlert }> = [];

  if (rtChange > 0.12) {
    const rtNow = avgMetric(last7, 'avg_response_time_min');
    issues.push({
      score: rtChange * 3,
      alert: {
        title: 'Tiempo de respuesta crítico',
        description: `Tu equipo tarda ${rtNow?.toFixed(0)} min en responder a nuevos leads — ${(rtChange * 100).toFixed(0)}% más que la semana pasada. En B2B, respuestas lentas pierden deals antes de la primera llamada. Definí hoy un protocolo: los primeros 15 minutos desde que llega el lead son críticos.`,
        severity: rtChange > 0.20 ? 'critical' : 'warning',
      },
    });
  }

  if (staleChange > 0.10) {
    const staleNow = avgMetric(last7, 'stale_deals');
    issues.push({
      score: staleChange * 2.5,
      alert: {
        title: 'Pipeline empantanado',
        description: `${staleNow?.toFixed(0)} deals llevan más de 60 días sin cerrar — ${(staleChange * 100).toFixed(0)}% más que la semana pasada. Cada deal estancado bloquea capacidad y distorsiona el forecast. Revisá hoy el top 10 y decidí: próximo paso concreto o descarte.`,
        severity: staleChange > 0.25 ? 'critical' : 'warning',
      },
    });
  }

  if (wrChange < -0.10) {
    issues.push({
      score: Math.abs(wrChange) * 2,
      alert: {
        title: 'Tasa de cierre cayendo',
        description: `Win rate del último mes: ${wrLast !== null ? (wrLast * 100).toFixed(1) : '—'}% vs ${wrPrev !== null ? (wrPrev * 100).toFixed(1) : '—'}% del mes anterior. Analizá las últimas 5 propuestas perdidas — ¿objeción de precio, competencia o timing?`,
        severity: 'warning',
      },
    });
  }

  if (leadsChange < -0.15) {
    issues.push({
      score: Math.abs(leadsChange) * 1.5,
      alert: {
        title: 'Flujo de leads cayendo',
        description: `Los nuevos leads cayeron ${Math.abs(leadsChange * 100).toFixed(0)}% esta semana vs la anterior. El tope del funnel se está cerrando — coordiná hoy con marketing para activar una campaña o revisar el canal orgánico.`,
        severity: 'warning',
      },
    });
  }

  if (suppChange > 0.20) {
    issues.push({
      score: suppChange * 1.2,
      alert: {
        title: 'Soporte bajo presión',
        description: `Los tickets de soporte aumentaron ${(suppChange * 100).toFixed(0)}% esta semana. Clientes con problemas no renuevan. Identificá si hay un bug recurrente o un gap en onboarding antes de que impacte retención.`,
        severity: 'warning',
      },
    });
  }

  if (issues.length === 0) {
    if (wrChange > 0.08) {
      return {
        title: 'Win rate en alza — buen momento',
        description: `Win rate subió a ${wrLast !== null ? (wrLast * 100).toFixed(1) : '—'}% en el último mes (era ${wrPrev !== null ? (wrPrev * 100).toFixed(1) : '—'}%). El pipeline está cerrando bien. Aprovechá el momentum: revisá qué está funcionando en los deals ganados y replicalo.`,
        severity: 'good',
      };
    }
    return {
      title: 'Métricas estables',
      description: 'Sin alertas críticas esta semana. Enfocate en calificar leads rápido, mantener el tiempo de respuesta bajo y revisar deals que lleven más de 30 días abiertos.',
      severity: 'good',
    };
  }

  issues.sort((a, b) => b.score - a.score);
  return issues[0].alert;
}
