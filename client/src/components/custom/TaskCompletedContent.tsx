import React, { useState } from "react";
import {
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts";
import { ChartConfig, ChartContainer } from "../ui/chart";

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


// Props for the chart content component
interface TaskProgressChartContentProps {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  percentage: number;
}

const TaskProgressChartContent: React.FC<TaskProgressChartContentProps> = ({
  completedTasks,
  remainingTasks,
  percentage
}) => {
  // State to track hover on the remaining portion
  const [isHoveringRemaining, setIsHoveringRemaining] = useState(false);
  
  // Calculate remaining percentage
  const remainingPercentage = 100 - percentage;

  // Chart data - the order matters here for proper layering
  const chartData = [
    { 
      name: "background", 
      value: 100, 
      fill: "#F44336",
      // Add event handlers to the background segment (red part)
      onMouseEnter: () => setIsHoveringRemaining(true),
      onMouseLeave: () => setIsHoveringRemaining(false),
    },
    { 
      name: "progress", 
      value: percentage, 
      fill: "#FFB900",
      // Ensure we reset to default view when hovering on progress segment
      onMouseEnter: () => setIsHoveringRemaining(false),
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
                  >
                    <tspan
                      x={polarViewBox.cx}
                      y={polarViewBox.cy - 10}
                      className="text-xl text-black font-bold"
                    >
                      {isHoveringRemaining 
                        ? `${remainingPercentage.toFixed(0)}%` 
                        : `${percentage}%`}
                    </tspan>
                    <tspan
                      x={polarViewBox.cx}
                      y={polarViewBox.cy + 12}
                      className="text-sm text-gray-500"
                    >
                      {isHoveringRemaining 
                        ? `${remainingTasks} Remaining` 
                        : `${completedTasks} Tasks`}
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

export default TaskProgressChartContent;