"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const emerald = "#10B981";
const red = "#EF4444";
const amber = "#F59E0B";
const blue = "#3B82F6";
const slate = "#64748B";

const pieColors = [red, amber, blue, emerald, slate, "#8B5CF6", "#14B8A6"];

type TooltipPayload = {
  name?: string;
  value?: number | string;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  currency: string;
};

type BarPoint = {
  name: string;
  amount: number;
};

type DailyCashFlowPoint = {
  day: string;
  income: number;
  expenses: number;
};

type CategoryPoint = {
  name: string;
  amount: number;
};

function formatChartMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function MoneyTooltip({ active, payload, label, currency }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-slate-900">{label}</p>}

      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={`${item.name}-${item.value}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-slate-500">{item.name}</span>
            <span className="font-medium text-slate-900">
              {formatChartMoney(Number(item.value ?? 0), currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardIncomeExpenseChart({
  data,
  currency,
}: {
  data: BarPoint[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCompactMoney(Number(value), currency)}
        />
        <Tooltip content={<MoneyTooltip currency={currency} />} />
        <Bar dataKey="amount" name="Amount" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.name === "Income" ? emerald : red}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyCashFlowChart({
  data,
  currency,
}: {
  data: DailyCashFlowPoint[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCompactMoney(Number(value), currency)}
        />
        <Tooltip content={<MoneyTooltip currency={currency} />} />
        <Legend />
        <Bar dataKey="income" name="Income" fill={emerald} radius={[8, 8, 0, 0]} />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill={red}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseCategoryDonutChart({
  data,
  currency,
}: {
  data: CategoryPoint[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500">No expense data to chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<MoneyTooltip currency={currency} />} />
        <Legend />
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={pieColors[index % pieColors.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ManagedMovementBarChart({
  data,
  currency,
}: {
  data: BarPoint[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCompactMoney(Number(value), currency)}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<MoneyTooltip currency={currency} />} />
        <Bar dataKey="amount" name="Amount" radius={[0, 8, 8, 0]}>
          {data.map((entry) => {
            const fill =
              entry.name === "Bills"
                ? amber
                : entry.name === "Savings"
                  ? emerald
                  : blue;

            return <Cell key={entry.name} fill={fill} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}