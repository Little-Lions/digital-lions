'use client'

import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import 'chartjs-plugin-datalabels'; // Import the datalabels plugin

// Register necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the PieChart component
const PieChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData<'pie'> | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions<'pie'> | null>(null);

  useEffect(() => {
    // This code runs only on the client-side
    const rootStyle = getComputedStyle(document.documentElement);
    const colorSuccess = rootStyle.getPropertyValue('--color-success').trim();
    const colorWarning = rootStyle.getPropertyValue('--color-warning').trim();
    const colorPrimaryBlue = rootStyle.getPropertyValue('--color-primary').trim();

    const data: ChartData<'pie'> = {
      labels: ['11/12', '<10/12', '12/12'],
      datasets: [
        {
          data: [10, 20, 30],
          backgroundColor: [colorPrimaryBlue, colorWarning, colorSuccess],
          hoverBackgroundColor: [colorPrimaryBlue, colorWarning, colorSuccess],
        },
      ],
    };

    const options: ChartOptions<'pie'> = {
      plugins: {
        datalabels: {
          display: true,
          formatter: (value, context) => {
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
              return '';
            }
            const total = (context.dataset.data as number[]).reduce((acc, val) => acc + (Number(val) || 0), 0);
            const percentage = ((numericValue / total) * 100).toFixed(2);
            return `${percentage}%`;
          },
          color: '#fff',
          font: {
            weight: 'bold',
            size: 14,
          },
          anchor: 'end',
          align: 'center',
          offset: 10,
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  // Render the Pie chart only when chartData and chartOptions are available
  return (
    <div className="w-full max-w-md mx-auto">
      {chartData && chartOptions ? <Pie data={chartData} options={chartOptions} /> : <p>Loading...</p>}
    </div>
  );
};

export default PieChart;
