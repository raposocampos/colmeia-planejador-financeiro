"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Info, type LucideIcon } from "lucide-react";
import { formatBRL, type MonthlyTrendPoint } from "../lib/calculations";

export interface DashboardCategoryDatum {
  id: string;
  name: string;
  color: string;
  value: number;
}

interface InfoTooltipProps {
  label: string;
  children: React.ReactNode;
}

export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const keepInsideViewport = () => {
      const bubble = bubbleRef.current;
      if (!bubble) return;
      const rect = bubble.getBoundingClientRect();
      const safeInset = 16;
      const unshiftedLeft = rect.left - offsetX;
      const unshiftedRight = rect.right - offsetX;
      if (unshiftedLeft < safeInset) {
        setOffsetX(safeInset - unshiftedLeft);
        return;
      }
      if (unshiftedRight > window.innerWidth - safeInset) {
        setOffsetX(window.innerWidth - safeInset - unshiftedRight);
        return;
      }
      setOffsetX(0);
    };
    const frame = window.requestAnimationFrame(keepInsideViewport);
    window.addEventListener("resize", keepInsideViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", keepInsideViewport);
    };
  }, [offsetX, open]);

  return (
    <span
      ref={rootRef}
      className="info-tooltip"
      data-open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
      >
        <Info size={15} />
      </button>
      <span
        ref={bubbleRef}
        className="info-tooltip__bubble"
        id={id}
        role="tooltip"
        aria-hidden={!open}
        style={{ "--tooltip-shift": `${offsetX}px` } as React.CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tooltip: string;
  tone?: "income" | "expense" | "balance" | "commitment";
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tooltip,
  tone = "balance",
}: MetricCardProps) {
  return (
    <article className={`manager-metric manager-metric--${tone}`}>
      <header>
        <span className="manager-metric__icon" aria-hidden="true">
          <Icon size={19} />
        </span>
        <span className="manager-metric__label">{label}</span>
        <InfoTooltip label={`Entenda o indicador ${label}`}>{tooltip}</InfoTooltip>
      </header>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

interface CashFlowChartProps {
  points: MonthlyTrendPoint[];
  anchorMonth: string;
  activeMonth: string;
  onActiveMonthChange: (month: string) => void;
  monthLabel: (month: string) => string;
  shortMonthLabel: (month: string) => string;
}

export function CashFlowChart({
  points,
  anchorMonth,
  activeMonth,
  onActiveMonthChange,
  monthLabel,
  shortMonthLabel,
}: CashFlowChartProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const maxBar = Math.max(
    ...points.flatMap((point) => [point.income, point.expense]),
    1,
  );
  const resultValues = points.map((point) => point.result);
  const minResult = Math.min(...resultValues, 0);
  const maxResult = Math.max(...resultValues, 0);
  const resultRange = Math.max(maxResult - minResult, 1);
  const linePoints = points.map((point, index) => ({
    x: ((index + 0.5) / points.length) * 600,
    y: 16 + ((maxResult - point.result) / resultRange) * 128,
  }));
  const linePath = linePoints
    .map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`)
    .join(" ");
  const firstMonth = points[0]?.month;
  const lastMonth = points.at(-1)?.month;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const anchor = scroller?.querySelector<HTMLElement>(
      `[data-month="${anchorMonth}"]`,
    );
    if (!scroller || !anchor) return;
    scroller.scrollTo({
      left: Math.max(
        0,
        anchor.offsetLeft - (scroller.clientWidth - anchor.clientWidth) / 2,
      ),
      behavior: "smooth",
    });
  }, [anchorMonth, firstMonth, lastMonth, points.length]);

  const focusMonth = (index: number) => {
    const point = points[index];
    if (!point) return;
    onActiveMonthChange(point.month);
    scrollerRef.current
      ?.querySelector<HTMLButtonElement>(`button[data-month="${point.month}"]`)
      ?.focus();
  };

  return (
    <div
      ref={scrollerRef}
      className="manager-cashflow"
      style={{ "--chart-points": points.length } as React.CSSProperties}
      aria-label="Receitas, despesas e saldo por mês"
    >
      <div className="manager-cashflow__plot">
        <svg
          className="manager-cashflow__line"
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={linePath} />
        </svg>
        <span className="manager-cashflow__points" aria-hidden="true">
          {linePoints.map((point, index) => (
            <i
              key={points[index].month}
              className={points[index].month === activeMonth ? "active" : ""}
              style={
                {
                  "--point-x": `${(point.x / 600) * 100}%`,
                  "--point-y": `${(point.y / 160) * 100}%`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        {points.map((point, index) => {
          const active = point.month === activeMonth;
          return (
            <button
              key={point.month}
              type="button"
              data-month={point.month}
              className={active ? "active" : ""}
              aria-pressed={active}
              aria-label={`${monthLabel(point.month)}: receitas ${formatBRL(point.income)}, despesas ${formatBRL(point.expense)}, saldo ${formatBRL(point.result)}`}
              onFocus={() => onActiveMonthChange(point.month)}
              onClick={() => onActiveMonthChange(point.month)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusMonth(Math.max(0, index - 1));
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusMonth(Math.min(points.length - 1, index + 1));
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  focusMonth(0);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  focusMonth(points.length - 1);
                }
              }}
            >
              <span className="manager-cashflow__bars" aria-hidden="true">
                <i
                  className="manager-cashflow__income"
                  style={{
                    height: point.income
                      ? `${Math.max(4, (point.income / maxBar) * 100)}%`
                      : 0,
                  }}
                />
                <i
                  className="manager-cashflow__expense"
                  style={{
                    height: point.expense
                      ? `${Math.max(4, (point.expense / maxBar) * 100)}%`
                      : 0,
                  }}
                />
              </span>
              <strong>{shortMonthLabel(point.month)}</strong>
              <small>{formatBRL(point.result)}</small>
              <span className="manager-cashflow__tooltip" role="tooltip">
                <b>{monthLabel(point.month)}</b>
                <span>Receitas {formatBRL(point.income)}</span>
                <span>Despesas {formatBRL(point.expense)}</span>
                <span>Saldo {formatBRL(point.result)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ExpenseDonutProps {
  categories: DashboardCategoryDatum[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ExpenseDonut({ categories, selectedId, onSelect }: ExpenseDonutProps) {
  const [focusedId, setFocusedId] = useState("");
  const total = categories.reduce((sum, category) => sum + category.value, 0);
  const circumference = 2 * Math.PI * 44;
  const segments = useMemo(
    () =>
      categories.reduce<
        Array<DashboardCategoryDatum & { ratio: number; offset: number }>
      >((result, category) => {
        const ratio = total ? category.value / total : 0;
        const previous = result.at(-1);
        const offset = previous ? previous.offset + previous.ratio : 0;
        return [...result, { ...category, ratio, offset }];
      }, []),
    [categories, total],
  );
  const focused = categories.find((category) => category.id === focusedId);

  return (
    <div className="expense-distribution">
      <div className="expense-donut">
        <svg
          viewBox="0 0 112 112"
          role="img"
          aria-label="Distribuição das despesas por categoria"
        >
          <circle className="expense-donut__track" cx="56" cy="56" r="44" />
          {segments.map((segment) => (
            <circle
              key={segment.id}
              className={selectedId === segment.id ? "active" : ""}
              cx="56"
              cy="56"
              r="44"
              fill="none"
              stroke={segment.color}
              strokeWidth="15"
              strokeDasharray={`${segment.ratio * circumference} ${circumference}`}
              strokeDashoffset={-segment.offset * circumference}
              tabIndex={0}
              role="button"
              aria-label={`${segment.name}: ${formatBRL(segment.value)}, ${Math.round(segment.ratio * 100)}%`}
              onFocus={() => setFocusedId(segment.id)}
              onBlur={() => setFocusedId("")}
              onMouseEnter={() => setFocusedId(segment.id)}
              onMouseLeave={() => setFocusedId("")}
              onClick={() => {
                const nextId = selectedId === segment.id ? "" : segment.id;
                setFocusedId(nextId);
                onSelect(nextId);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect(selectedId === segment.id ? "" : segment.id);
              }}
            />
          ))}
        </svg>
        <span className="expense-donut__total">
          <strong>{formatBRL(total)}</strong>
          <small>Total</small>
        </span>
        {focused && (
          <span className="expense-donut__tooltip" role="tooltip">
            <b>{focused.name}</b>
            {formatBRL(focused.value)} · {Math.round((focused.value / total) * 100)}%
          </span>
        )}
      </div>
      <div className="expense-distribution__legend">
        {segments.slice(0, 7).map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedId === category.id ? "active" : ""}
            aria-pressed={selectedId === category.id}
            onClick={() => onSelect(selectedId === category.id ? "" : category.id)}
          >
            <i style={{ backgroundColor: category.color }} aria-hidden="true" />
            <span>{category.name}</span>
            <small>{Math.round(category.ratio * 100)}%</small>
            <strong>{formatBRL(category.value)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
