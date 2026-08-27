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

type WeeklyChartDatum = {
  week: string;
  income: number;
  expense: number;
};

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
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}

      <div className="space-y-1">
        {payload.map((item) => {
          const isIncome = item.name === "income" || item.name === "Income";
          const isExpense = item.name === "expense" || item.name === "Expense" || item.name === "Expenses";

          const valueColor = isIncome
            ? "text-primary"
            : isExpense
              ? "text-red-600"
              : "text-foreground"
          
          return (
          <div
            key={`${item.name}-${item.value}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground">
              {isIncome ? "Income" : isExpense ? "Expenses" : item.name}
            </span>
            <span className={`font-medium ${valueColor}`}>
              {formatChartMoney(Number(item.value ?? 0), currency)}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderedLegend() {
  const items = [
    { value: "Income", color: emerald },
    { value: "Expense", color: red },
  ];

  return (
    <ul className="flex items-center justify-center gap-4 pt-2">
      {items.map((item) => (
        <li key={item.value} className="flex items-center gap-1.5 text-md text-muted-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.value}
        </li>
      ))}
    </ul>
  );
}

export function DashboardIncomeExpenseChart({
  data,
  currency,
}: {
  data: WeeklyChartDatum[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="week" 
          tickLine={false} 
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 14 }} 
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 14 }}
          tickFormatter={(value) => formatCompactMoney(Number(value), currency)}
        />
        <Tooltip 
          content={<MoneyTooltip currency={currency} />} 
          cursor={{ fill: "var(--color-muted)", opacity: 0.7 }}
        />
        <Legend content={<OrderedLegend />}/>
        <Bar dataKey="income" name="income" fill={emerald} radius={[4, 4, 0, 0]} />
        
        <Bar dataKey="expense" name="expense" fill={red} radius={[4, 4, 0, 0]} />
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