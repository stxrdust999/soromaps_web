"use client";

import { CheckIcon, ChevronsUpDownIcon, PipetteIcon } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type HsvColor,
  hexToHsv,
  hsvToHex,
  hsvToHsl,
  hsvToRgb,
  rgbToHex,
} from "@/utils/colors";

const DEFAULT_PRESETS = [
  "#1447e6",
  "#ea580c",
  "#a855f7",
  "#9333ea",
  "#ef4444",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#0ea5e9",
  "#059669",
  "#e11d48",
  "#d946ef",
];

interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  onChangeEnd?: (hex: string) => void;
  onDraggingChange?: (isDragging: boolean) => void;
  presets?: string[];
  className?: string;
  disabled?: boolean;
  inline?: boolean;
}

type ColorMode = "hex" | "rgb" | "hsl";

function normalizeToHex6(colorInput: string): string {
  const clean = colorInput.trim().replace(/^#/, "");
  if (clean.length === 3) return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toLowerCase();
  const hex6 = clean.slice(0, 6).padEnd(6, "0");
  return `#${hex6}`.toLowerCase();
}

/**
 * Componente ColorPicker no estilo visual HeroUI com área 2D (Sat/Bri), slider de Hue, Alpha e paleta.
 */
export function ColorPicker({
  value,
  defaultValue = "#1447e6",
  onChange,
  onChangeEnd,
  onDraggingChange,
  presets = DEFAULT_PRESETS,
  className,
  disabled = false,
  inline = false,
}: ColorPickerProps) {
  const [internalHex, setInternalHex] = useState<string>(() =>
    normalizeToHex6(value ?? defaultValue),
  );
  const currentHex = value ? normalizeToHex6(value) : internalHex;

  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(currentHex));
  const [mode, setMode] = useState<ColorMode>("hex");
  const [hexInputValue, setHexInputValue] = useState<string>(currentHex);
  const [recentColors, setRecentColors] = useState<string[]>(presets);

  const hsvRef = useRef<HsvColor>(hsv);
  hsvRef.current = hsv;

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  /** Sincroniza o estado HSV caso o valor externo mude. */
  useEffect(() => {
    if (!value) return;
    const normalizedValue = normalizeToHex6(value);
    const currentHexNormalized = normalizeToHex6(hsvToHex(hsvRef.current));
    if (normalizedValue !== currentHexNormalized) {
      const nextHsv = hexToHsv(normalizedValue);
      setHsv(nextHsv);
      setInternalHex(normalizedValue);
      setHexInputValue(normalizedValue);
    }
  }, [value]);

  const updateColor = useCallback(
    (newHsv: HsvColor) => {
      setHsv(newHsv);
      const computedHex = normalizeToHex6(hsvToHex(newHsv));
      setInternalHex(computedHex);
      setHexInputValue(computedHex);
      onChange?.(computedHex);
    },
    [onChange],
  );

  /** Manipulação do arrasto na Área 2D de Saturação e Brilho. */
  const handleAreaPointer = useCallback(
    (clientX: number, clientY: number) => {
      const area = areaRef.current;
      if (!area) return;

      const rect = area.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const saturation = Math.round((x / rect.width) * 100);
      const brightness = Math.round((1 - y / rect.height) * 100);

      updateColor({
        ...hsvRef.current,
        s: saturation,
        v: brightness,
      });
    },
    [updateColor],
  );

  const startAreaDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDraggingChange?.(true);
    handleAreaPointer(event.clientX, event.clientY);

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      handleAreaPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      onDraggingChange?.(false);
      const finalHex = normalizeToHex6(hsvToHex(hsvRef.current));
      onChangeEnd?.(finalHex);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /** Manipulação do arrasto no Slider de Matiz (Hue). */
  const handleHuePointer = useCallback(
    (clientX: number) => {
      const hueEl = hueRef.current;
      if (!hueEl) return;

      const rect = hueEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const hue = Math.round((x / rect.width) * 360) % 360;

      updateColor({
        ...hsvRef.current,
        h: hue,
      });
    },
    [updateColor],
  );

  const startHueDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDraggingChange?.(true);
    handleHuePointer(event.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      handleHuePointer(moveEvent.clientX);
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      onDraggingChange?.(false);
      const finalHex = normalizeToHex6(hsvToHex(hsvRef.current));
      onChangeEnd?.(finalHex);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /** Manipulação do arrasto no Slider de Opacidade (Alpha). */
  const handleAlphaPointer = useCallback(
    (clientX: number) => {
      const alphaEl = alphaRef.current;
      if (!alphaEl) return;

      const rect = alphaEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const alpha = Math.max(0, Math.min(1, Number((x / rect.width).toFixed(2))));

      updateColor({
        ...hsvRef.current,
        a: alpha,
      });
    },
    [updateColor],
  );

  const startAlphaDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDraggingChange?.(true);
    handleAlphaPointer(event.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      handleAlphaPointer(moveEvent.clientX);
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      onDraggingChange?.(false);
      const finalHex = normalizeToHex6(hsvToHex(hsvRef.current));
      onChangeEnd?.(finalHex);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /** Aciona a API nativa EyeDropper quando disponível no navegador. */
  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-expect-error EyeDropper é experimental em alguns navegadores
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const pickedHex = result.sRGBHex.toLowerCase();
          updateColor(hexToHsv(pickedHex));
          onChangeEnd?.(pickedHex);
        }
      } catch {
        return;
      }
    }
  };

  /** Formatações derivadas para exibição nos campos numéricos. */
  const rgb = useMemo(() => hsvToRgb(hsv), [hsv]);
  const hsl = useMemo(() => hsvToHsl(hsv), [hsv]);

  const handleHexInputBlur = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInputValue)) {
      const normalizedHex = normalizeToHex6(hexInputValue);
      updateColor(hexToHsv(normalizedHex));
      onChangeEnd?.(normalizedHex);
      return;
    }
    setHexInputValue(currentHex);
  };

  const handleRgbChange = (channel: "r" | "g" | "b", channelValue: number) => {
    const updatedRgb = { ...rgb, [channel]: channelValue };
    const updatedHex = normalizeToHex6(rgbToHex(updatedRgb));
    updateColor(hexToHsv(updatedHex));
    onChangeEnd?.(updatedHex);
  };

  const selectPreset = (preset: string) => {
    const normalizedPreset = normalizeToHex6(preset);
    updateColor(hexToHsv(normalizedPreset));
    onChangeEnd?.(normalizedPreset);
    if (!recentColors.includes(normalizedPreset))
      setRecentColors((previous) => [normalizedPreset, ...previous.slice(0, 15)]);
  };

  const pureHueColor = `hsl(${hsv.h}, 100%, 50%)`;

  const saturationAreaElement = (
    <div
      ref={areaRef}
      onPointerDown={startAreaDrag}
      className={cn(
        "relative w-full cursor-crosshair overflow-hidden rounded-2xl select-none",
        inline ? "h-36" : "h-44",
      )}
      style={{ backgroundColor: pureHueColor }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #fff, transparent)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #000, transparent)",
        }}
      />
      <div
        className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-[box-shadow]"
        style={{
          left: `${hsv.s}%`,
          top: `${100 - hsv.v}%`,
          backgroundColor: currentHex,
        }}
      />
    </div>
  );

  const hueAndAlphaSliders = (
    <div className="flex flex-1 flex-col gap-2.5">
      <div
        ref={hueRef}
        onPointerDown={startHueDrag}
        className="relative h-3 w-full cursor-pointer rounded-full select-none"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: pureHueColor,
          }}
        />
      </div>

      <div
        ref={alphaRef}
        onPointerDown={startAlphaDrag}
        className="relative h-3 w-full cursor-pointer rounded-full overflow-hidden select-none"
        style={{
          backgroundImage:
            "conic-gradient(#cbd5e1 0.25turn, #f8fafc 0.25turn 0.5turn, #cbd5e1 0.5turn 0.75turn, #f8fafc 0.75turn)",
          backgroundSize: "8px 8px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${currentHex})`,
          }}
        />
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md"
          style={{
            left: `${(hsv.a ?? 1) * 100}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>
    </div>
  );

  const inputsElement = (
    <div
      className={cn(
        "grid items-center gap-1.5",
        inline ? "grid-cols-[76px_1fr_auto]" : "grid-cols-[82px_1fr_64px]",
      )}
    >
      <Select
        value={mode}
        onValueChange={(val) => setMode(val as ColorMode)}
      >
        <SelectTrigger size="sm" className="h-8 rounded-xl text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="hex">Hex</SelectItem>
          <SelectItem value="rgb">RGB</SelectItem>
          <SelectItem value="hsl">HSL</SelectItem>
        </SelectContent>
      </Select>

      {mode === "hex" && (
        <Input
          value={hexInputValue}
          onChange={(event) => setHexInputValue(event.target.value)}
          onBlur={handleHexInputBlur}
          className="h-8 rounded-xl font-mono text-xs text-center uppercase"
          maxLength={7}
        />
      )}

      {mode === "rgb" && (
        <div className="grid grid-cols-3 gap-1">
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.r}
            onChange={(event) => {
              const val = Number.parseInt(event.target.value, 10) || 0;
              handleRgbChange("r", val);
            }}
            className="h-8 rounded-lg p-0 text-center font-mono text-[11px]"
          />
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.g}
            onChange={(event) => {
              const val = Number.parseInt(event.target.value, 10) || 0;
              handleRgbChange("g", val);
            }}
            className="h-8 rounded-lg p-0 text-center font-mono text-[11px]"
          />
          <Input
            type="number"
            min={0}
            max={255}
            value={rgb.b}
            onChange={(event) => {
              const val = Number.parseInt(event.target.value, 10) || 0;
              handleRgbChange("b", val);
            }}
            className="h-8 rounded-lg p-0 text-center font-mono text-[11px]"
          />
        </div>
      )}

      {mode === "hsl" && (
        <div className="grid grid-cols-3 gap-1">
          <span className="flex h-8 items-center justify-center rounded-lg bg-muted text-[11px] font-mono">
            {hsl.h}°
          </span>
          <span className="flex h-8 items-center justify-center rounded-lg bg-muted text-[11px] font-mono">
            {hsl.s}%
          </span>
          <span className="flex h-8 items-center justify-center rounded-lg bg-muted text-[11px] font-mono">
            {hsl.l}%
          </span>
        </div>
      )}

      {inline ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleEyeDropper}
          title="Conta-gotas"
          className="size-8 shrink-0 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <PipetteIcon className="size-4" />
        </Button>
      ) : (
        <div className="flex h-8 items-center justify-center rounded-xl bg-muted/60 text-xs font-medium text-muted-foreground">
          {Math.round((hsv.a ?? 1) * 100)}%
        </div>
      )}
    </div>
  );

  const paletteElement = (
    <div className={cn(inline ? "pt-2" : "mt-3.5 pt-3 border-t border-border/60")}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-0.5">
        <span className="font-medium text-foreground/80">Cores sugeridas</span>
        <span className="text-[11px]">Paleta</span>
      </div>

      <div className={cn("grid gap-1.5", inline ? "grid-cols-6 sm:grid-cols-8" : "grid-cols-8")}>
        {recentColors.slice(0, 16).map((preset) => {
          const isSelected = currentHex.toLowerCase() === preset.toLowerCase();
          return (
            <button
              key={preset}
              type="button"
              title={preset}
              onClick={() => selectPreset(preset)}
              className={cn(
                "relative size-6 rounded-md transition-transform hover:scale-110 active:scale-95 shadow-xs flex items-center justify-center",
                isSelected && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
              )}
              style={{ backgroundColor: preset }}
            >
              {isSelected && (
                <CheckIcon className="size-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div
        className={cn(
          "flex flex-row gap-4 items-start w-full rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs",
          className,
        )}
      >
        {/* Coluna Esquerda: Área 2D de Saturação/Brilho + sliders de Matiz (Hue) e Opacidade (Alpha) */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {saturationAreaElement}
          {hueAndAlphaSliders}
        </div>

        {/* Coluna Direita: Seletor de modo (HEX/RGB/HSL), inputs numéricos, conta-gotas e paleta de cores pré-definidas (presets) */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {inputsElement}
          <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>Opacidade</span>
            <span className="font-mono font-medium">{Math.round((hsv.a ?? 1) * 100)}%</span>
          </div>
          <div className="border-t border-border/60" />
          {paletteElement}
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors hover:bg-accent/40",
            className,
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="size-5 rounded-md border border-black/10 shadow-xs"
              style={{ backgroundColor: currentHex }}
            />
            <span className="font-mono text-xs uppercase text-foreground">
              {currentHex}
            </span>
          </div>
          <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[304px] rounded-3xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-md"
      >
        {saturationAreaElement}

        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleEyeDropper}
            title="Conta-gotas"
            className="size-8 shrink-0 rounded-full hover:bg-muted text-muted-foreground"
          >
            <PipetteIcon className="size-4" />
          </Button>

          {hueAndAlphaSliders}
        </div>

        <div className="mt-3.5">{inputsElement}</div>

        {paletteElement}
      </PopoverContent>
    </Popover>
  );
}
