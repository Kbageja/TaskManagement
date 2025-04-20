import React, { useState } from "react";
import {
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// Define a type for the polar viewBox which includes cx and cy properties
interface PolarViewBox {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  [key: string]: unknown;
}


// Props interface for the component
interface DelayedTasksChartContentProps {
  taskData: {
    completedTasks: number;
    onTimeTasks: number;
    avgCompletionTime: number;
  };
  percentage: number;
  delayedTasks: number;
}

const DelayedTasksChartContent: React.FC<DelayedTasksChartContentProps> = ({ 
  taskData, 
  percentage, 
}) => {
  const [showAvgTime, setShowAvgTime] = useState(false);

  // Format average completion time
  const formatAvgTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Chart data - the order matters here for proper layering
  const chartData = [
    { 
      name: "background", 
      value: 100, 
      fill: "#F44336",
    },
    { 
      name: "progress", 
      value: percentage, 
      fill: "#FFB900",
    },
  ];

  // Chart configuration
  const chartConfig = {
    progress: {
      label: "Progress",
      color: "black",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <RadialBarChart
        width={180}
        height={180}
        data={chartData}
        innerRadius="70%"
        outerRadius="70%"
        barSize={7}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          background={false}
          isAnimationActive={true}
        />

        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              // Cast viewBox to our PolarViewBox type
              const polarViewBox = viewBox as PolarViewBox | undefined;
              
              if (polarViewBox?.cx !== undefined && polarViewBox?.cy !== undefined) {
                return (
                  <text
                    x={polarViewBox.cx}
                    y={polarViewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="cursor-pointer"
                    onMouseEnter={() => setShowAvgTime(true)}
                    onMouseLeave={() => setShowAvgTime(false)}
                  >
                    <tspan
                      x={polarViewBox.cx}
                      y={polarViewBox.cy}
                      className="text-lg sm:text-xl font-medium"
                    >
                      {showAvgTime 
                        ? formatAvgTime(taskData.avgCompletionTime) 
                        : `${taskData.completedTasks} Task`}
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
};

export default DelayedTasksChartContent;