"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Fragment } from 'react'

// Custom PieChart component
function PieChartComponent({ data, dataKey, nameKey, colors }: { 
  data: any[]; 
  dataKey: string; 
  nameKey: string; 
  colors: string[] 
}) {
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill={colors[0] || '#8884d8'}
        label
        labelLine={false}
      >
        {data.map((entry: any, idx: number) => (
          <Cell key={`cell-${idx}`} fill={colors[idx % colors.length] || '#8884d8'} />
        ))}
      </Pie>
    </PieChart>
  )
}

interface RichContentProps {
  content: {
    type: 'table' | 'chart' | 'cards' | 'text' | 'list' | 'timeline'
    data: any
  }
}

export function RichContent({ content }: RichContentProps) {
  switch (content.type) {
    case 'table':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {content.data.headers.map((header: string) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.data.rows.map((row: string[], i: number) => (
              <TableRow key={i}>
                {row.map((cell: string, j: number) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )

    case 'cards':
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {content.data.map((card: any, i: number) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{card.name}</span>
                  <Badge variant="secondary">{card.rating} ★</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Price: {card.price}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Delivery: {card.delivery}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact: {card.contact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )

    case 'list':
      return (
        <ul className="list-disc pl-6 space-y-2">
          {content.data.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'timeline':
      return (
        <div className="space-y-4">
          {content.data.phases.map((phase: any, i: number) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-primary" />
                {i < content.data.phases.length - 1 && (
                  <div className="h-16 w-0.5 bg-border" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{phase.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {phase.duration} • Starting {phase.start}
                </p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'text':
      return <p className="text-muted-foreground">{content.data}</p>

    case 'chart': {
      const { chartType, data, xKey, yKey, colors = [] } = content.data || {}
      if (!data || !Array.isArray(data) || !chartType) {
        return <div className="text-muted-foreground">Invalid chart data</div>
      }

      let ChartComponent = null;
      if (chartType === 'bar') {
        ChartComponent = (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey={yKey} fill={colors[0] || '#8884d8'} />
          </BarChart>
        );
      } else if (chartType === 'line') {
        ChartComponent = (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={colors[0] || '#8884d8'} />
          </LineChart>
        );
      }

      if (!ChartComponent) {
        return <div className="text-muted-foreground">Unsupported chart type: {chartType}</div>
      }

      return (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            {ChartComponent}
          </ResponsiveContainer>
        </div>
      )
    }

    default:
      return <div className="text-muted-foreground">Unsupported content type: {content.type}</div>
  }
} 