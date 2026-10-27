"use client";

import { Loader2Icon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Filtro SVG metaball que funde a pílula de busca e a bolha lateral durante a transição elástica.
 */
function GooeyFilter({
  filterId,
  blur,
}: {
  filterId: string;
  blur: number;
}) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Ícone de lupa animado via layout compartilhado entre o estado recolhido e a bolha destacada.
 */
function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  surfaceClassName?: string;
  classNames?: GooeyInputClassNames;
  /** Largura do controle recolhido em pixels. */
  collapsedWidth?: number;
  /** Largura do controle expandido em pixels. */
  expandedWidth?: number;
  /** Deslocamento horizontal em pixels quando expandido para acomodar a bolha destacada. */
  expandedOffset?: number;
  /** Intensidade do desfoque gaussiano para o filtro SVG gooey. */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onFocus?: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Campo de busca interativo Aceternity UI com expansão elástica e bolha destacada por filtro SVG metaball.
 */
export function GooeyInput({
  placeholder = "Buscar...",
  className,
  containerClassName,
  surfaceClassName,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onChange,
  onOpenChange,
  onFocus,
  onClear,
  isLoading = false,
  disabled = false,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback(
    (nextValue: string) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onValueChange, onChange],
  );

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      setIsExpanded(nextExpanded);
      onOpenChange?.(nextExpanded);
    },
    [onOpenChange],
  );

  /** Foca o input ao expandir e preserva valores controlados preenchidos externamente ao recolher. */
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current && !isControlled) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, isControlled, setSearchText]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (changeEvent: ChangeEvent<HTMLInputElement>) => {
      setSearchText(changeEvent.target.value);
    },
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const handleClear = useCallback(
    (mouseEvent: MouseEvent<HTMLSpanElement>) => {
      mouseEvent.stopPropagation();
      setSearchText("");
      onClear?.();
      inputRef.current?.focus();
    },
    [onClear, setSearchText],
  );

  const surfaceClass =
    surfaceClassName ??
    "bg-foreground text-background shadow-sm ring-1 ring-border/60";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        containerClassName,
        className,
        classNames?.root,
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn(
          "relative flex h-10 items-center justify-center",
          classNames?.filterWrap,
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        {/* expanding input pill - section */}
        <motion.div
          className={cn(
            "flex h-10 items-center justify-center",
            classNames?.buttonRow,
          )}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 font-medium text-sm outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
              surfaceClass,
              classNames?.trigger,
            )}
          >
            {!isExpanded ? <SearchIcon layoutId={iconLayoutId} /> : null}

            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="text"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-current text-sm outline-none px-1",
                isExpanded
                  ? "placeholder:text-current/50"
                  : "pointer-events-none placeholder:text-current/75",
                classNames?.input,
              )}
            />

            {isExpanded && isLoading ? (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin text-current/70" />
            ) : null}

            {isExpanded && searchText.length > 0 ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar busca"
                onMouseDown={(mouseEvent) => mouseEvent.preventDefault()}
                onClick={handleClear}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-current/70 transition-colors hover:bg-current/15 hover:text-current"
              >
                <XIcon className="size-3.5" />
              </span>
            ) : null}
          </button>
        </motion.div>

        {/* detached icon bubble - section */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center",
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
