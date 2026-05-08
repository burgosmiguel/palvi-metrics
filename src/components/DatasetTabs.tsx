import React from 'react';
import { ActiveTab, DatasetKey } from '../types';

const DATASETS: DatasetKey[] = ['A', 'B', 'C', 'D'];

interface Props {
  active: ActiveTab;
  onChange: (key: ActiveTab) => void;
}

const DatasetTabs: React.FC<Props> = ({ active, onChange }) => (
  <div className="dataset-tabs">
    <button
      className={`dataset-tab ${active === 'ALL' ? 'dataset-tab-all-active' : 'dataset-tab-inactive'}`}
      onClick={() => onChange('ALL')}
    >
      Todos
    </button>
    <div className="dataset-tabs-divider" />
    {DATASETS.map(ds => (
      <button
        key={ds}
        className={`dataset-tab ${ds === active ? 'dataset-tab-active' : 'dataset-tab-inactive'}`}
        onClick={() => onChange(ds)}
      >
        {ds}
      </button>
    ))}
  </div>
);

export default DatasetTabs;
