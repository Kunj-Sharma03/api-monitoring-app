
"use client";

import React from 'react';
import { Chart as ReactChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Memoized Chart component for performance
const Chart = React.memo(function Chart({
  type = "bar",
  data,
  options = {},
  className = "",
  height = 400, // default increased height
}) {
  const finalOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, // allow full height
    ...options,
  }), [options]);

  return (
    <div className={className} style={{ height }}>
      <ReactChart type={type} data={data} options={finalOptions} />
    </div>
  );
});

export default Chart;

