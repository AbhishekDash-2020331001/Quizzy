// @ts-nocheck

"use client";

import type * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// Chart Container
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ChartContainer({
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart
interface BarChartProps {
  data: any[];
  xAxis: any[];
  yAxis: any[];
  series: {
    dataKey: string;
    label?: string;
    color?: string;
    valueFormatter?: (value: any) => string;
  }[];
  tooltip?: React.FC<any>;
  className?: string;
}

function BarChart({
  data,
  xAxis,
  yAxis,
  series,
  tooltip,
  className,
}: BarChartProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <RechartsBarChart data={data} className={className}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      {xAxis.map((axis, index) => (
        <XAxis
          key={`x-axis-${index}`}
          dataKey={axis.dataKey}
          tickLine={axis.tickLine}
          axisLine={axis.axisLine}
          tickFormatter={axis.valueFormatter}
          tick={{ fontSize: axis.tickLabelStyle?.fontSize }}
        />
      ))}
      {yAxis.map((axis, index) => (
        <YAxis
          key={`y-axis-${index}`}
          tickLine={axis.tickLine}
          axisLine={axis.axisLine}
          tickFormatter={axis.valueFormatter}
          tick={{ fontSize: axis.tickLabelStyle?.fontSize }}
          tickCount={axis.tickCount}
          domain={axis.max ? [0, axis.max] : undefined}
        />
      ))}
      {tooltip ? <Tooltip content={tooltip} /> : <Tooltip />}
      <Legend />
      {series.map((serie, index) => (
        <Bar
          key={`bar-${index}`}
          dataKey={serie.dataKey}
          name={serie.label || serie.dataKey}
          fill={serie.color || colors[index % colors.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </RechartsBarChart>
  );
}

// Line Chart
interface LineChartProps {
  data: any[];
  xAxis: any[];
  yAxis: any[];
  series: {
    dataKey: string;
    label?: string;
    color?: string;
    valueFormatter?: (value: any) => string;
    area?: boolean;
  }[];
  tooltip?: React.FC<any>;
  className?: string;
}

function LineChart({
  data,
  xAxis,
  yAxis,
  series,
  tooltip,
  className,
}: LineChartProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <RechartsLineChart data={data} className={className}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      {xAxis.map((axis, index) => (
        <XAxis
          key={`x-axis-${index}`}
          dataKey={axis.dataKey}
          tickLine={axis.tickLine}
          axisLine={axis.axisLine}
          tickFormatter={axis.valueFormatter}
          tick={{ fontSize: axis.tickLabelStyle?.fontSize }}
        />
      ))}
      {yAxis.map((axis, index) => (
        <YAxis
          key={`y-axis-${index}`}
          tickLine={axis.tickLine}
          axisLine={axis.axisLine}
          tickFormatter={axis.valueFormatter}
          tick={{ fontSize: axis.tickLabelStyle?.fontSize }}
          tickCount={axis.tickCount}
        />
      ))}
      {tooltip ? <Tooltip content={tooltip} /> : <Tooltip />}
      <Legend />
      {series.map((serie, index) => (
        <Line
          key={`line-${index}`}
          type="monotone"
          dataKey={serie.dataKey}
          name={serie.label || serie.dataKey}
          stroke={serie.color || colors[index % colors.length]}
          fill={
            serie.area
              ? `${serie.color || colors[index % colors.length]}20`
              : undefined
          }
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </RechartsLineChart>
  );
}

// Pie Chart
interface PieChartProps {
  data: any[];
  series: {
    dataKey: string;
    nameKey?: string;
    innerRadius?: number;
    outerRadius?: number;
    paddingAngle?: number;
    cornerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    cx?: string;
    cy?: string;
    valueFormatter?: (value: any) => string;
    highlightScope?: {
      faded: string;
      highlighted: string;
    };
  }[];
  tooltip?: React.FC<any>;
  className?: string;
}

function PieChart({ data, series, tooltip, className }: PieChartProps) {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#14b8a6",
    "#f43f5e",
    "#84cc16",
  ];

  return (
    <RechartsPieChart className={className}>
      {series.map((serie, serieIndex) => (
        <Pie
          key={`pie-${serieIndex}`}
          data={data}
          dataKey={serie.dataKey}
          nameKey={serie.nameKey || "name"}
          cx={serie.cx || "50%"}
          cy={serie.cy || "50%"}
          innerRadius={serie.innerRadius || 0}
          outerRadius={serie.outerRadius || 80}
          paddingAngle={serie.paddingAngle || 0}
          cornerRadius={serie.cornerRadius || 0}
          startAngle={serie.startAngle || 0}
          endAngle={serie.endAngle || 360}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      ))}
      {tooltip ? <Tooltip content={tooltip} /> : <Tooltip />}
      <Legend />
    </RechartsPieChart>
  );
}

// Chart Tooltip
interface ChartTooltipProps {
  children: React.ReactNode;
  className?: string;
}

function ChartTooltip({ children, className }: ChartTooltipProps) {
  return (
    <div className={cn("bg-white p-2 border rounded-md shadow-md", className)}>
      {children}
    </div>
  );
}

// Chart Tooltip Content
interface ChartTooltipContentProps {
  title?: string;
  content?: {
    label: string;
    value: string;
  }[];
  className?: string;
}

function ChartTooltipContent({
  title,
  content,
  className,
}: ChartTooltipContentProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && <div className="font-medium">{title}</div>}
      {content?.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-8">
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export {
  ChartContainer,
  BarChart,
  LineChart,
  PieChart,
  ChartTooltip,
  ChartTooltipContent,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
};
