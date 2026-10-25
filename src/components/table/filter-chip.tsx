"use client";

import type { Column, Table } from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatISODate } from "@/utils/formatters/format-date";

interface FilterChipShellProps {
  icon: ReactNode;
  label: string;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;

  /** Icon of the expand button: text chips point right, pickers point down. */
  expandIcon?: "right" | "down";
  disabled?: boolean;
  disabledHint?: string;
  children?: ReactNode;
  childrenClassName?: string;
}

/**
 * Chip frame shared by every filter variant. Collapsed it shows icon +
 * label + expand button; expanded it reveals the variant's control between
 * the label and the collapse button. The control stays mounted and is
 * animated via `max-width`, so expanding/collapsing slides instead of
 * popping; `self-stretch` makes the segment dividers touch the chip's own
 * border. Collapsing is the variant's chance to clear its filter — the
 * shell only reports the click.
 *
 * @param props Label parts, expand state and callbacks, variant control.
 */
function FilterChipShell({
  icon,
  label,
  expanded,
  onExpand,
  onCollapse,
  expandIcon = "right",
  disabled,
  disabledHint,
  children,
  childrenClassName,
}: FilterChipShellProps) {
  const ExpandIcon = expandIcon === "down" ? ChevronDownIcon : ChevronRightIcon;
  const isOpen = expanded && !disabled;

  const toggleButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={isOpen ? onCollapse : onExpand}
      disabled={disabled}
      aria-label={isOpen ? `Limpar filtro de ${label}` : `Filtrar por ${label}`}
      className="ml-0.5"
    >
      {isOpen ? (
        <ChevronLeftIcon className="text-muted-foreground" />
      ) : (
        <ExpandIcon className="text-muted-foreground" />
      )}
    </Button>
  );

  return (
    <div className="flex h-9 w-fit items-center rounded-md border border-input bg-background pr-0.5 pl-3 shadow-xs">
      <button
        type="button"
        disabled={disabled}
        onClick={isOpen ? undefined : onExpand}
        className={cn(
          "flex h-full items-center gap-2 pr-3 text-sm whitespace-nowrap transition-colors outline-none",
          !isOpen && !disabled && "cursor-pointer hover:text-foreground/80",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {icon}
        <span>{label}</span>
      </button>

      <div
        className={cn(
          "flex items-center h-full overflow-hidden transition-all duration-300 ease-in-out",
          isOpen
            ? "visible max-w-72 border-l border-input opacity-100 w-fit"
            : "invisible max-w-0 border-x-0 opacity-0",
          childrenClassName,
        )}
      >
        {children}
      </div>

      {disabled && disabledHint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{toggleButton}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledHint}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="border-l h-full flex items-center">
          {toggleButton}
        </span>
      )}
    </div>
  );
}

interface FilterChipBaseProps<TData> {
  table: Table<TData>;
  column: Column<TData, unknown>;
  icon: ReactNode;
  label: string;
}

/**
 * Text filter chip: expands into an inline search input bound to the
 * column filter. Local state mirrors the filter so the input stays
 * controlled when the filter is cleared elsewhere (reset button); the
 * chip opens already expanded when a filter value survives a remount.
 *
 * @param props Table and target column, label parts, placeholder text.
 */
export function TextFilterChip<TData>({
  table,
  column,
  icon,
  label,
  placeholder = "Pesquisar...",
}: FilterChipBaseProps<TData> & { placeholder?: string }) {
  const columnFilterValue = (column.getFilterValue() as string) ?? "";
  const [value, setValue] = useState<string>(columnFilterValue);
  const [expanded, setExpanded] = useState<boolean>(columnFilterValue !== "");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(columnFilterValue);
  }, [columnFilterValue]);

  // Foca o input ao expandir. Fora de um efeito porque o elemento fica
  // montado para a animação — `autoFocus` roubaria o foco no primeiro render
  // da página. O rAF espera o re-render tirar o `invisible` do segmento;
  // antes disso o elemento não é focável.
  function handleExpand() {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    column.setFilterValue(nextValue);

    table.setPageIndex(0);
  }

  function handleCollapse() {
    column.setFilterValue(undefined);
    setExpanded(false);
  }

  return (
    <FilterChipShell
      icon={icon}
      label={label}
      expanded={expanded}
      onExpand={handleExpand}
      onCollapse={handleCollapse}
    >
      <div className="relative pl-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          className="h-7 field-sizing-content min-w-44 bg-transparent pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </FilterChipShell>
  );
}

export interface SelectFilterChipOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

/**
 * Select filter chip: expands into a select bound to the column filter.
 * There is no "empty" item — clearing means collapsing the chip.
 *
 * @param props Table and target column, label parts, options and the
 * heading shown inside the dropdown.
 */
export function SelectFilterChip<TData>({
  table,
  column,
  icon,
  label,
  options,
  menuLabel,
  placeholder = "Selecione...",
}: FilterChipBaseProps<TData> & {
  options: SelectFilterChipOption[];
  menuLabel?: string;
  placeholder?: string;
}) {
  const value = (column.getFilterValue() as string) ?? "";
  const [expanded, setExpanded] = useState<boolean>(value !== "");

  function handleValueChange(nextValue: string) {
    column.setFilterValue(nextValue);
    table.setPageIndex(0);
  }

  function handleCollapse() {
    column.setFilterValue(undefined);
    setExpanded(false);
  }

  const selected = options.find((option) => option.value === value);

  return (
    <FilterChipShell
      icon={icon}
      label={label}
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onCollapse={handleCollapse}
      expandIcon="down"
      childrenClassName="focus:bg-muted focus-visible:bg-muted hover:bg-muted"
    >
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          size="sm"
          darkenOnOpen
          className={cn(
            // Preenche o segmento inteiro (`data-[size=sm]:h-full` vence o
            // `h-8` interno do trigger) para o bg de hover/aberto encostar
            // nas bordas do chip, como no chip de data.
            "w-44 rounded-none border-0 bg-transparent shadow-none data-[size=sm]:h-full hover:bg-muted dark:bg-transparent dark:hover:bg-muted",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? selected.label : placeholder}
        </SelectTrigger>

        <SelectContent position="popper" align="start">
          <SelectGroup>
            {menuLabel && <SelectLabel>{menuLabel}</SelectLabel>}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FilterChipShell>
  );
}

/**
 * Date filter chip: expands into a calendar popover bound to the column
 * filter — same `Date` value `filterByDateFn` expects. When the column is
 * hidden the chip is disabled and drops its filter, so rows are never
 * filtered by something the user cannot see.
 *
 * @param props Table and target column, label parts, disabled flag + hint.
 */
export function DateFilterChip<TData>({
  table,
  column,
  icon,
  label,
  disabled,
  disabledHint,
}: FilterChipBaseProps<TData> & {
  disabled?: boolean;
  disabledHint?: string;
}) {
  const filterValue = column.getFilterValue() as Date | undefined;
  const [expanded, setExpanded] = useState<boolean>(Boolean(filterValue));
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (disabled && column.getFilterValue() !== undefined) {
      column.setFilterValue(undefined);
    }
  }, [disabled, column]);

  function handleSelect(date?: Date) {
    column.setFilterValue(date);
    table.setPageIndex(0);

    setOpen(false);
  }

  function handleCollapse() {
    column.setFilterValue(undefined);
    setExpanded(false);
  }

  return (
    <FilterChipShell
      icon={icon}
      label={label}
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onCollapse={handleCollapse}
      expandIcon="right"
      disabled={disabled}
      disabledHint={disabledHint}
      childrenClassName="focus:bg-muted focus-visible:bg-muted hover:bg-muted"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              // `border-none` porque o Button base tem `border-transparent` +
              // `bg-clip-padding`: o bg do estado aberto seria recortado 1px
              // pra dentro, deixando um filete entre trigger e bordas do chip.
              "h-full w-full items-center gap-6 rounded-none border-none pl-3 font-normal text-foreground",
              !filterValue && "text-muted-foreground",
            )}
          >
            {filterValue
              ? formatISODate(filterValue.toISOString())
              : "Selecione uma data"}
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={filterValue}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </FilterChipShell>
  );
}
