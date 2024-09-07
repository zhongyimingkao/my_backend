'use client';
import Layout from '@/components/Layout';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './components/ui/chart';
import { Separator } from './components/ui/separator';

export default function Dashboard() {
  return (
    <Layout
      curActive="/dashboard"
      defaultOpen={['/']}
    >
      <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
        <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[25rem] lg:grid-cols-1 xl:max-w-[30rem]">
          <Card
            className="lg:max-w-md"
            x-chunk="charts-01-chunk-0"
          >
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>今日物资总出库量</CardDescription>
              <CardTitle className="text-4xl tabular-nums">
                125
                <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                  件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  steps: {
                    label: '份数',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
              >
                <BarChart
                  accessibilityLayer
                  margin={{
                    left: -4,
                    right: -4,
                  }}
                  data={[
                    {
                      date: '2024-08-14',
                      steps: 94,
                    },
                    {
                      date: '2024-08-15',
                      steps: 97,
                    },
                    {
                      date: '2024-08-16',
                      steps: 122,
                    },
                    {
                      date: '2024-08-17',
                      steps: 152,
                    },
                    {
                      date: '2024-08-18',
                      steps: 110,
                    },
                    {
                      date: '2024-08-19',
                      steps: 135,
                    },
                    {
                      date: '2024-08-20',
                      steps: 125,
                    },
                  ]}
                >
                  <Bar
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={5}
                    fillOpacity={0.6}
                    activeBar={<Rectangle fillOpacity={0.8} />}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tickFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        weekday: 'short',
                      });
                    }}
                  />
                  <ChartTooltip
                    defaultIndex={2}
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                        }}
                      />
                    }
                    cursor={false}
                  />
                  <ReferenceLine
                    y={1200}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  >
                    <Label
                      position="insideBottomLeft"
                      value="Average Steps"
                      offset={10}
                      fill="hsl(var(--foreground))"
                    />
                    <Label
                      position="insideTopLeft"
                      value="119"
                      className="text-lg"
                      fill="hsl(var(--foreground))"
                      offset={10}
                      startOffset={100}
                    />
                  </ReferenceLine>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-1">
              <CardDescription>
                在过去的7天里，总共出库了
                <span className="font-medium text-foreground">835</span>
                件防冻物资.
              </CardDescription>
            </CardFooter>
          </Card>
          <Card
            className="lg:max-w-md"
            x-chunk="charts-01-chunk-0"
          >
            <CardHeader className="space-y-0 pb-2">
              <CardDescription>今日物资总入库量</CardDescription>
              <CardTitle className="text-4xl tabular-nums">
                145
                <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                  件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  steps: {
                    label: '份数',
                    color: 'hsl(var(--chart-5))',
                  },
                }}
              >
                <BarChart
                  accessibilityLayer
                  margin={{
                    left: -4,
                    right: -4,
                  }}
                  data={[
                    {
                      date: '2024-08-14',
                      steps: 92,
                    },
                    {
                      date: '2024-08-15',
                      steps: 97,
                    },
                    {
                      date: '2024-08-16',
                      steps: 190,
                    },
                    {
                      date: '2024-08-17',
                      steps: 142,
                    },
                    {
                      date: '2024-08-18',
                      steps: 120,
                    },
                    {
                      date: '2024-08-19',
                      steps: 135,
                    },
                    {
                      date: '2024-08-20',
                      steps: 145,
                    },
                  ]}
                >
                  <Bar
                    dataKey="steps"
                    fill="var(--color-steps)"
                    radius={5}
                    fillOpacity={0.6}
                    activeBar={<Rectangle fillOpacity={0.8} />}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tickFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        weekday: 'short',
                      });
                    }}
                  />
                  <ChartTooltip
                    defaultIndex={2}
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                        }}
                      />
                    }
                    cursor={false}
                  />
                  <ReferenceLine
                    y={1200}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  >
                    <Label
                      position="insideBottomLeft"
                      value="Average Steps"
                      offset={10}
                      fill="hsl(var(--foreground))"
                    />
                    <Label
                      position="insideTopLeft"
                      value="131"
                      className="text-lg"
                      fill="hsl(var(--foreground))"
                      offset={10}
                      startOffset={100}
                    />
                  </ReferenceLine>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-1">
              <CardDescription>
                在过去的7天里，总共入库了
                <span className="font-medium text-foreground">921</span>
                件防冻物资.
              </CardDescription>
            </CardFooter>
          </Card>
        </div>
        <div className="grid w-full flex-1 gap-6 lg:max-w-[30rem]">
          <Card
            className="max-w-xs p-4"
            x-chunk="charts-01-chunk-6"
          >
            <CardHeader className="p-4 pb-0">
              <CardTitle>待审核出库单数</CardTitle>
              <CardDescription>记得按时审核噢!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
              <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
                13单
              </div>
            </CardContent>
          </Card>
          <Card
            className="max-w-xs p-4"
            x-chunk="charts-01-chunk-6"
          >
            <CardHeader className="p-4 pb-0">
              <CardTitle>今日新增出库单数</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
              <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
                9单
              </div>
            </CardContent>
          </Card>
          <Card
            className="max-w-xs p-4"
            x-chunk="charts-01-chunk-6"
          >
            <CardHeader className="p-4 pb-0">
              <CardTitle>今日新增入库单数</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
              <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
                2单
              </div>
            </CardContent>
          </Card>
          <Card
            className="max-w-xs p-4"
            x-chunk="charts-01-chunk-2"
          >
            <CardHeader>
              <CardTitle>库存分布</CardTitle>
              <CardDescription>不同仓库的库存量</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ChartContainer
                config={{
                  move: {
                    label: 'Move',
                    color: 'hsl(var(--chart-1))',
                  },
                  stand: {
                    label: 'Stand',
                    color: 'hsl(var(--chart-2))',
                  },
                  exercise: {
                    label: 'Exercise',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                className="h-[140px] w-full"
              >
                <BarChart
                  margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10,
                  }}
                  data={[
                    {
                      activity: '仓库1',
                      value: 341,
                      label: '341份',
                      fill: 'var(--color-stand)',
                    },
                    {
                      activity: '仓库2',
                      value: 310,
                      label: '310份',
                      fill: 'var(--color-exercise)',
                    },
                    {
                      activity: '仓库3',
                      value: 233,
                      label: '233份',
                      fill: 'var(--color-move)',
                    },
                  ]}
                  layout="vertical"
                  barSize={32}
                  barGap={2}
                >
                  <XAxis
                    type="number"
                    dataKey="value"
                    hide
                  />
                  <YAxis
                    dataKey="activity"
                    type="category"
                    tickLine={false}
                    tickMargin={4}
                    axisLine={false}
                    className="capitalize"
                  />
                  <Bar
                    dataKey="value"
                    radius={5}
                  >
                    <LabelList
                      position="insideLeft"
                      dataKey="label"
                      fill="white"
                      offset={8}
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
