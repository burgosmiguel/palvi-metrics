import React, { useState, useMemo } from 'react';
import rawData from './data/metrics.json';
import { ActiveTab, DatasetKey, MetricsData } from './types';
import {
  aggregateDatasets,
  avgMetric,
  winRate,
  calcTrend,
  calcFunnel,
  detectFocus,
  formatMetricValue,
} from './utils/analytics';
import DatasetTabs from './components/DatasetTabs';
import FocusAlert from './components/FocusAlert';
import KPICard from './components/KPICard';
import TrendChart from './components/TrendChart';
import FunnelViz from './components/FunnelViz';

const data = rawData as unknown as MetricsData;
const allDataset = aggregateDatasets(data);

const App: React.FC = () => {
  const [activeKey, setActiveKey] = useState<ActiveTab>(() => {
    const saved = sessionStorage.getItem('dashboard-tab');
    return (saved as ActiveTab) || 'Todos';
  });

  const handleTabChange = (key: ActiveTab) => {
    sessionStorage.setItem('dashboard-tab', key);
    setActiveKey(key);
  };

  const dataset = useMemo(
    () => (activeKey === 'ALL' ? allDataset : data[activeKey as DatasetKey]),
    [activeKey],
  );

  const { days, metadata } = dataset;

  const metaMap = useMemo(
    () => Object.fromEntries(metadata.metrics.map(m => [m.key, m])),
    [metadata],
  );

  const last30 = useMemo(() => days.slice(-30), [days]);
  const prev30 = useMemo(() => days.slice(-60, -30), [days]);
  const last7 = useMemo(() => days.slice(-7), [days]);
  const prev7 = useMemo(() => days.slice(-14, -7), [days]);

  const focus = useMemo(() => detectFocus(dataset), [dataset]);
  const funnel = useMemo(() => calcFunnel(last30), [last30]);

  const kpis = useMemo(() => {
    const wrLast = winRate(last30);
    const wrPrev = winRate(prev30);
    const wrTrend = calcTrend(wrLast, wrPrev, 'higher_is_better');

    const rtLast = avgMetric(last7, 'avg_response_time_min');
    const rtPrev = avgMetric(prev7, 'avg_response_time_min');
    const rtTrend = calcTrend(rtLast, rtPrev, 'lower_is_better');

    const staleNow = days[days.length - 1].metrics['stale_deals'] ?? null;
    const stale30ago = days[days.length - 31]?.metrics['stale_deals'] ?? null;
    const staleTrend = calcTrend(staleNow, stale30ago, 'lower_is_better');

    const leadsLast = avgMetric(last7, 'leads_created');
    const leadsPrev = avgMetric(prev7, 'leads_created');
    const leadsTrend = calcTrend(leadsLast, leadsPrev, 'higher_is_better');

    const suppLast = avgMetric(last7, 'support_tickets_opened');
    const suppPrev = avgMetric(prev7, 'support_tickets_opened');
    const suppTrend = calcTrend(suppLast, suppPrev, 'lower_is_better');

    return [
      {
        id: 'win_rate',
        label: 'Win Rate (30d)',
        value: wrLast !== null ? wrLast * 100 : null,
        valueFormatted: wrLast !== null ? `${(wrLast * 100).toFixed(1)}` : '—',
        unit: '%',
        trend: wrTrend,
        compareLabel: wrPrev !== null ? `vs ${(wrPrev * 100).toFixed(1)}% mes anterior` : undefined,
        sparkKey: null as string | null,
      },
      {
        id: 'avg_response_time_min',
        label: 'Tiempo Resp.',
        value: rtLast,
        valueFormatted: rtLast !== null ? formatMetricValue('avg_response_time_min', rtLast) : '—',
        unit: 'min',
        trend: rtTrend,
        compareLabel: rtPrev !== null ? `vs ${rtPrev.toFixed(1)} min sem. ant.` : undefined,
        sparkKey: 'avg_response_time_min',
      },
      {
        id: 'stale_deals',
        label: 'Deals Estancados',
        value: staleNow,
        valueFormatted: staleNow !== null ? String(Math.round(staleNow)) : '—',
        unit: '',
        trend: staleTrend,
        compareLabel: stale30ago !== null ? `vs ${Math.round(stale30ago)} hace 30d` : undefined,
        sparkKey: 'stale_deals',
      },
      {
        id: 'leads_created',
        label: 'Leads/día (7d)',
        value: leadsLast,
        valueFormatted: leadsLast !== null ? leadsLast.toFixed(1) : '—',
        unit: '',
        trend: leadsTrend,
        compareLabel: leadsPrev !== null ? `vs ${leadsPrev.toFixed(1)} sem. ant.` : undefined,
        sparkKey: 'leads_created',
      },
      {
        id: 'support_tickets_opened',
        label: 'Tickets/día (7d)',
        value: suppLast,
        valueFormatted: suppLast !== null ? suppLast.toFixed(1) : '—',
        unit: '',
        trend: suppTrend,
        compareLabel: suppPrev !== null ? `vs ${suppPrev.toFixed(1)} sem. ant.` : undefined,
        sparkKey: 'support_tickets_opened',
      },
    ];
  }, [last7, last30, prev7, prev30, days]);

  const chartData30 = useMemo(
    () => last30.map(d => ({
      date: d.date.slice(5),
      responseTime: d.metrics['avg_response_time_min'] ?? null,
      staleDeals: d.metrics['stale_deals'] ?? null,
    })),
    [last30],
  );

  const lastDate = days[days.length - 1].date;
  const rtMeta = metaMap['avg_response_time_min'];
  const staleMeta = metaMap['stale_deals'];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-diamond">◆</span>
            <div>
              <span className="header-title">
                Sales Dashboard
                {activeKey === 'ALL' && (
                  <span className="header-all-badge">Consolidado</span>
                )}
              </span>
              <span className="header-date">{lastDate}</span>
            </div>
          </div>
          <DatasetTabs active={activeKey} onChange={handleTabChange} />
        </div>
      </header>

      <main className="main">
        <div className="container">
          <FocusAlert alert={focus} />

          <div className="kpi-grid">
            {kpis.map(kpi => (
              <KPICard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                valueFormatted={kpi.valueFormatted}
                unit={kpi.unit}
                trend={kpi.trend}
                compareLabel={kpi.compareLabel}
                sparkData={
                  kpi.sparkKey
                    ? last30.map(d => ({
                        v: d.metrics[kpi.sparkKey as string] ?? undefined,
                      }))
                    : undefined
                }
              />
            ))}
          </div>

          <div className="charts-row">
            <div className="card">
              <h3 className="chart-title">Tiempo de Respuesta — últimos 30 días</h3>
              <p className="chart-subtitle">{rtMeta?.description}</p>
              <TrendChart
                data={chartData30.map(d => ({ date: d.date, value: d.responseTime }))}
                color="#dc2626"
                unit="min"
              />
            </div>
            <div className="card">
              <h3 className="chart-title">Deals Estancados (+60d) — últimos 30 días</h3>
              <p className="chart-subtitle">{staleMeta?.description}</p>
              <TrendChart
                data={chartData30.map(d => ({ date: d.date, value: d.staleDeals }))}
                color="#d97706"
                unit="deals"
                area
              />
            </div>
          </div>

          <div className="card funnel-card">
            <h3 className="chart-title" style={{ marginBottom: 16 }}>
              Embudo de Conversión — últimos 30 días
            </h3>
            <FunnelViz stages={funnel} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
