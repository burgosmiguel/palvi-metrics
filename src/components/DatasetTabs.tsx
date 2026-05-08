import React from 'react';
import { DatasetKey } from '../types';

const DATASETS: DatasetKey[] = ['A', 'B', 'C', 'D'];

interface Props {
  active: DatasetKey;
  onChange: (key: DatasetKey) => void;
}

const DatasetTabs: React.FC<Props> = ({ active, onChange }) => (
  <div className="dataset-tabs">
    {DATASETS.map(ds => (
      <button
        key={ds}
        className={`dataset-tab ${ds === active ? 'dataset-tab-active' : 'dataset-tab-inactive'}`}
        onClick={() => onChange(ds)}
      >
        Dataset {ds}
      </button>
    ))}
  </div>
);

export default DatasetTabs;
