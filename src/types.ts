export interface MetricMeta {
  key: string;
  label: string;
  unit: string;
  direction: 'higher_is_better' | 'lower_is_better';
  description: string;
}

export interface DayData {
  date: string;
  metrics: Record<string, number | null>;
}

export interface DatasetMetadata {
  start_date: string;
  end_date: string;
  days: number;
  metrics: MetricMeta[];
}

export interface Dataset {
  metadata: DatasetMetadata;
  days: DayData[];
}

export type DatasetKey = 'A' | 'B' | 'C' | 'D';
export type ActiveTab = DatasetKey | 'ALL';

export interface MetricsData {
  A: Dataset;
  B: Dataset;
  C: Dataset;
  D: Dataset;
}
