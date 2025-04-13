import React from 'react';

const TaskProgressCircle: React.FC = () => {
  // Default values
  const totalTasks = 4;
  const completedTasks = 1;
  const remainingTasks = totalTasks - completedTasks;
  
  // Calculate the percentage of completed tasks
  const percentage = (completedTasks / totalTasks) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
            {/* Center text */}
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg sm:text-xl font-medium"
              fill="#000000"
            >
              {totalTasks} Tasks
            </text>
          </svg>
        </div>

        {/* Stats Boxes */}
        <div className="flex flex-row sm:flex-col gap-3 justify-center items-center">
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Total</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#4CAF50]"></div>
              <span className="text-sm sm:text-base font-medium">{totalTasks}</span>
            </div>
          </div>
          
          {/* Completed tasks box */}
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Completed</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFD230]"></div>
              <span className="text-sm sm:text-base font-medium">{completedTasks} / {totalTasks}</span>
            </div>
          </div>

          {/* Remaining tasks box */}
          <div className="bg-white p-2 rounded-lg shadow-md w-24 sm:w-28">
            <div className="text-xs sm:text-sm text-gray-500">Remaining</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F44336]"></div>
              <span className="text-sm sm:text-base font-medium">{remainingTasks} / {totalTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressCircle;