"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function isMonthValue(value?: string | null) {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

function getCurrentMonthValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1, 12, 0, 0, 0)));
}

function addMonths(monthValue: string, amount: number) {
  const [year, month] = monthValue.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1 + amount, 1, 12, 0, 0, 0));

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${nextYear}-${nextMonth}`;
}

function isAfterMonth(monthValue: string, compareMonthValue: string) {
  return monthValue > compareMonthValue;
}

function getMonthOptions(selectedMonth: string, allowFuture: boolean) {
  const currentMonth = getCurrentMonthValue();

  const baseMonth =
    allowFuture || !isAfterMonth(selectedMonth, currentMonth)
      ? selectedMonth
      : currentMonth;

  return Array.from({ length: 24 }, (_, index) => {
    const value = addMonths(baseMonth, -index);

    return {
      value,
      label: formatMonthLabel(value),
    };
  });
}

export function MonthSelector({
  value,
  allowFuture = false,
}: {
  value: string;
  allowFuture?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonth = getCurrentMonthValue();
  const selectedValue = isMonthValue(value) ? value : currentMonth;

  const monthOptions = getMonthOptions(selectedValue, allowFuture);

  const isNextDisabled =
    !allowFuture && !isAfterMonth(currentMonth, selectedValue);

  function changeMonth(nextValue: string) {
    if (!allowFuture && isAfterMonth(nextValue, currentMonth)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("month", nextValue);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="flex w-full items-center gap-2 sm:w-auto">
      <button
        type="button"
        onClick={() => changeMonth(addMonths(selectedValue, -1))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative flex-1 sm:w-52">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            {formatMonthLabel(selectedValue)}
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {monthOptions.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeMonth(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-emerald-50 font-medium text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{option.label}</span>

                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => changeMonth(addMonths(selectedValue, 1))}
        disabled={isNextDisabled}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}