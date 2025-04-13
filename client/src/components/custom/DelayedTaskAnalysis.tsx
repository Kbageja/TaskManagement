import React, { useState } from 'react';

const DelayedTasks: React.FC = () => {
  // Task data
  const taskData = {
    totalTasks: 5,
    completedTasks: 5,
    onTimeTasks: 3,
    delayedTasks: 1,
    avgCompletionTime: 505.34
  };

  const [showAvgTime, setShowAvgTime] = useState(false);

  // Calculate remaining tasks
  const delayedtasks = taskData.completedTasks - taskData.onTimeTasks;
  
  // Calculate percentages
  const percentage = (taskData.onTimeTasks / taskData.completedTasks) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Format average completion time
  const formatAvgTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-4 md:ml-10">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Background circle (remaining tasks) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#F44336"
              strokeWidth="7"
            />
            {/* Foreground circle (completed tasks) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#FFD230"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
            {/* Center text with hover effect */}
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg sm:text-xl font-medium cursor-pointer"
              fill="#000000"
              onMouseEnter={() => setShowAvgTime(true)}
              onMouseLeave={() => setShowAvgTime(false)}
            >
              {showAvgTime ? formatAvgTime(taskData.avgCompletionTime)  : `${taskData.completedTasks} Task`}
            </text>
          </svg>
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
              <span className="text-sm sm:text-base font-medium">{taskData.onTimeTasks} / {taskData.completedTasks}</span>
            </div>
          </div>

          {/* Delayed tasks box */}
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Delayed</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F44336]"></div>
              <span className="text-sm sm:text-base font-medium">{delayedtasks} / {taskData.completedTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayedTasks;