import React, { useState, Suspense, lazy } from "react";
import { ChartConfig } from "@/components/ui/chart";

// Lazy load the chart components to improve performance
const LazyChart = lazy(() => import("./TaskCompletedContent"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-[180px]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

interface TaskProgressCircleProps {
  totalTasks2: number;
  completedTasks2: number;
}

// Main component
const TaskProgressCircle: React.FC<TaskProgressCircleProps> = ({ 
  totalTasks2, 
  completedTasks2 
}) => {
  // Default values
  const totalTasks = totalTasks2;
  const completedTasks = completedTasks2;
  const remainingTasks = totalTasks - completedTasks;

  // Calculate percentage
  const percentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Chart with Suspense for lazy loading */}
        <div className="relative w-full max-w-[170px] h-[170px]">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyChart 
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              remainingTasks={remainingTasks}
              percentage={percentage}
            />
          </Suspense>
        </div>

        {/* Stats */}
        <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Total</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#4CAF50]"></div>
              <span className="text-sm sm:text-base font-medium">
                {totalTasks}
              </span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Completed</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFD230]"></div>
              <span className="text-sm sm:text-base font-medium">
                {completedTasks} / {totalTasks}
              </span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Remaining</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F44336]"></div>
              <span className="text-sm sm:text-base font-medium">
                {remainingTasks} / {totalTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressCircle;