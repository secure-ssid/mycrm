'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = {
  open: '#00D2D2',      // info
  closingSoon: '#FDAB3D', // warning
  won: '#00C875',       // success
  lost: '#E2445C',      // danger
  primary: '#5034FF',
}

interface PipelineData {
  status: string
  count: number
  value: number
}

interface GoalData {
  type: string
  actual: number
  target: number
}

export function PipelineFunnelChart({ data }: { data: PipelineData[] }) {
  const chartData = [
    { name: 'Open', value: data.find(d => d.status === 'OPEN')?.value || 0, fill: COLORS.open },
    { name: 'Closing Soon', value: data.find(d => d.status === 'CLOSING_SOON')?.value || 0, fill: COLORS.closingSoon },
    { name: 'Won', value: data.find(d => d.status === 'CLOSED_WON')?.value || 0, fill: COLORS.won },
    { name: 'Lost', value: data.find(d => d.status === 'CLOSED_LOST')?.value || 0, fill: COLORS.lost },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          stroke="#6b7280"
        />
        <YAxis type="category" dataKey="name" width={100} stroke="#6b7280" />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f3f4f6',
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PipelineDistributionChart({ data }: { data: PipelineData[] }) {
  const chartData = [
    { name: 'Open', value: data.find(d => d.status === 'OPEN')?.count || 0, fill: COLORS.open },
    { name: 'Closing Soon', value: data.find(d => d.status === 'CLOSING_SOON')?.count || 0, fill: COLORS.closingSoon },
    { name: 'Won', value: data.find(d => d.status === 'CLOSED_WON')?.count || 0, fill: COLORS.won },
    { name: 'Lost', value: data.find(d => d.status === 'CLOSED_LOST')?.count || 0, fill: COLORS.lost },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-surface-500">
        No pipeline data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f3f4f6',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function GoalProgressChart({ data }: { data: GoalData[] }) {
  const chartData = data.map(goal => ({
    name: goal.type.length > 15 ? goal.type.slice(0, 15) + '...' : goal.type,
    actual: goal.actual,
    target: goal.target,
    progress: goal.target > 0 ? Math.round((goal.actual / goal.target) * 100) : 0,
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-surface-500">
        No goals data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f3f4f6',
          }}
          formatter={(value: number, name: string) => [
            value,
            name === 'actual' ? 'Current' : 'Target'
          ]}
        />
        <Legend />
        <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Current" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
