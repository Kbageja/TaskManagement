import React, { Suspense, lazy } from 'react';

// Lazy load the chart component
const LazyDelayedTasksChart = lazy(() => import('./DelayedTasksChartContent'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

interface DelayedTasksProps {
  onTimeTasks2: number;
  completedTasks2: number;
  avgCompletionTime2:number
}
// Main component
const DelayedTasks: React.FC<DelayedTasksProps> = ({ 
  onTimeTasks2, 
  completedTasks2,
  avgCompletionTime2
}) => {
  // Task data
  const taskData = {
    completedTasks: completedTasks2,
    onTimeTasks: onTimeTasks2,
    avgCompletionTime:avgCompletionTime2
  };

  // Calculate delayed tasks
  const delayedTasksCount = taskData.completedTasks - taskData.onTimeTasks;
  
  // Calculate percentage
  const percentage = (taskData.onTimeTasks / taskData.completedTasks) * 100;

  return (
    <div className="flex items-center justify-center w-full h-full p-4 ">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Progress Circle with Suspense for lazy loading */}
        <div className="relative w-full max-w-[170px] h-[170px]">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyDelayedTasksChart 
              taskData={taskData}
              percentage={percentage}
              delayedTasks={delayedTasksCount}
            />
          </Suspense>
        </div>

        {/* Stats Boxes */}
        <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Completed</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#4CAF50]"></div>
              <span className="text-sm sm:text-base font-medium">{taskData.completedTasks}</span>
            </div>
          </div>
          
          {/* On Time tasks box */}
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">On Time</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFD230]"></div>
              <span className="text-sm sm:text-base font-medium">
                {taskData.onTimeTasks} / {taskData.completedTasks}
              </span>
            </div>
          </div>

          {/* Delayed tasks box */}
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Delayed</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F44336]"></div>
              <span className="text-sm sm:text-base font-medium">
                {delayedTasksCount} / {taskData.completedTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayedTasks;