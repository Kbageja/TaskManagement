import React, { useState, useMemo } from 'react';
import { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartJS from 'chart.js/auto';
import dynamic from 'next/dynamic';
import { useTrends } from '@/services/tasks/queries';

// Lazy load the Bar component with SSR disabled
const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading chart visualization...</p>
        </div>
      </div>
    )
  }
);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GroupWiseTrends {
  [groupId: string]: {
    [month: string]: number;
  };
}

interface CollectiveTrends {
  [month: string]: number;
}

interface TrendsData {
  collectiveTrends?: CollectiveTrends;
  groupWiseTrends?: GroupWiseTrends;
}

const TrendsChart: React.FC<{ userId?: string | null }> = ({ userId }) => {
  const [activeView, setActiveView] = useState<'collective' | 'groupwise'>('collective');
  
  // Fetch trends data
  const { data, isLoading, error } = useTrends(userId ? { userId } : {});

  // Prepare data for Collective Trends
  const collectiveChartData = useMemo(() => {
    if (!data?.collectiveTrends) return { labels: [], datasets: [] };
    
    return {
      labels: Object.keys(data.collectiveTrends).map(month => `Month ${month}`),
      datasets: [
        {
          label: 'Collective Completed Tasks',
          data: Object.values(data.collectiveTrends),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  // Prepare data for Group-wise Trends
  const groupWiseChartData = useMemo(() => {
    if (!data?.groupWiseTrends) return { labels: [], datasets: [] };

    // Find all unique months across all groups
    const allMonths = Array.from(
      new Set(
        Object.values(data.groupWiseTrends)
          .flatMap(groupData => Object.keys(groupData))
      )
    ).sort((a, b) => a.localeCompare(b));

    // Prepare labels for x-axis
    const labels = allMonths.map(month => `Month ${month}`);

    // Prepare datasets for each group
    const datasets = Object.entries(data.groupWiseTrends).map(([groupId, monthData], index) => {
      const hue = (index * 137) % 360;
      return {
        label: `Group ${groupId}`,
        data: allMonths.map(month => monthData[month] || 0),
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.6)`,
        borderColor: `hsla(${hue}, 70%, 50%, 1)`,
        borderWidth: 1
      };
    });

    return {
      labels,
      datasets
    };
  }, [data]);

  // Chart options
  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Task Completion Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Completed Tasks'
        }
      }
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading trends data...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading trends data</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Display no data state
  if (!data?.collectiveTrends || !data?.groupWiseTrends || 
      (Object.keys(data.collectiveTrends).length === 0 && Object.keys(data.groupWiseTrends).length === 0)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-xl">No trends data available</p>
          <p className="mt-2">Try adjusting your filters or check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toggle Buttons */}
      <div className="flex justify-center mb-4">
        <div className="flex border border-gray-300 rounded-full overflow-hidden shadow-sm">
          <button
            className={`px-3 py-1 text-sm transition-all duration-300 ease-in-out ${
              activeView === 'collective' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('collective')}
          >
            Collective
          </button>
          <button
            className={`px-3 py-1 text-sm transition-all duration-300 ease-in-out ${
              activeView === 'groupwise' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('groupwise')}
          >
            Group-wise
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-grow w-full h-[calc(100%-50px)] min-h-[300px]">
        {activeView === 'collective' ? (
          <Bar 
            data={collectiveChartData} 
            options={{
              ...chartOptions,
              maintainAspectRatio: false
            }} 
            className="w-full h-full"
          />
        ) : (
          <Bar 
            data={groupWiseChartData} 
            options={{
              ...chartOptions,
              maintainAspectRatio: false
            }} 
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default TrendsChart;