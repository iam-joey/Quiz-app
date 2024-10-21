"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "../ui/chart";

interface GradeChartProps {
  grade: number;
}

function GradeChart({ grade }: GradeChartProps) {
  const maxGrade = 10;
  const percentage = (grade / maxGrade) * 100;

  const data = [
    { name: "Grade", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <Card className="w-full max-w-[200px]">
      <CardContent className="p-6">
        <ChartContainer
          config={{
            grade: {
              label: "Grade",
              color: "hsl(var(--primary))",
            },
            remaining: {
              label: "Remaining",
              color: "hsl(var(--muted))",
            },
          }}
          className="w-full aspect-square"
        >
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill="var(--color-grade)" />
                  <Cell fill="var(--color-remaining)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {grade.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function ChartComponent() {
  const mockGrades = [6, 7, 8, 5.5, 9.2, 4.7];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockGrades.map((grade, index) => (
          <GradeChart key={index} grade={grade} />
        ))}
      </div>
    </div>
  );
}
