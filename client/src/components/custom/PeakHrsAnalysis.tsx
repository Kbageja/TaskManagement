import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the data structure
interface PeakHoursData {
  collectivePeakHours: { [hour: number]: number };
  groupWisePeakHours: { [groupId: number]: { [hour: number]: number } };
}

// Sample data matching the provided structure
const sampleData: PeakHoursData = {
  collectivePeakHours: {
    21: 1,
    22: 3,
    23: 2
  },
  groupWisePeakHours: {
    20: {
      21: 1,
      22: 2
    },
    59: {
      22: 1
    },
    49: {
      23: 2
    },
    69: {
      21: 1
    }
  }
};

const PeakHoursChart: React.FC = () => {
  const [activeView, setActiveView] = useState<'collective' | 'groupwise'>('collective');

  // Prepare data for Collective Peak Hours
  const collectivePeakHoursData = {
    labels: Object.keys(sampleData.collectivePeakHours).map(hour => `${hour}:00`),
    datasets: [
      {
        label: 'Collective Peak Hours',
        data: Object.values(sampleData.collectivePeakHours),
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Prepare data for Group-wise Peak Hours
  const groupWisePeakHoursData = useMemo(() => {
    // Find all unique hours across all groups
    const allHours = Array.from(new Set(
      Object.values(sampleData.groupWisePeakHours)
        .flatMap(groupData => Object.keys(groupData).map(Number))
    )).sort((a, b) => a - b);

    // Prepare labels for x-axis
    const labels = allHours.map(hour => `${hour}:00`);

    // Prepare datasets for each group
    const datasets = Object.entries(sampleData.groupWisePeakHours).map(([groupId, hourData]) => ({
      label: `Group ${groupId}`,
      data: allHours.map(hour => hourData[hour] || 0),
      backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`,
      borderWidth: 1
    }));

    return {
      labels,
      datasets
    };
  }, [sampleData.groupWisePeakHours]);

  // Chart options
  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      
      title: {
        display: true,
        text: 'Peak Hours Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Activity Count'
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Refined Toggle Buttons */}
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
            data={collectivePeakHoursData} 
            options={{
              ...chartOptions,
              maintainAspectRatio: false
            }} 
            className="w-full h-full"
          />
        ) : (
          <Bar 
            data={groupWisePeakHoursData} 
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

export default PeakHoursChart;