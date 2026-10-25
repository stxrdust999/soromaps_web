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
  presets?: string[];
  className?: string;
  disabled?: boolean;
}

type ColorMode = "hex" | "rgb" | "hsl";

/**
 * Componente ColorPicker no estilo visual HeroUI com área 2D (Sat/Bri), slider de Hue, Alpha e paleta.
 */
export function ColorPicker({
  value,
  defaultValue = "#1447e6",
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [internalHex, setInternalHex] = useState<string>(value ?? defaultValue);
  const currentHex = value ?? internalHex;

  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(currentHex));
  const [mode, setMode] = useState<ColorMode>("hex");
  const [hexInputValue, setHexInputValue] = useState<string>(currentHex);
  const [recentColors, setRecentColors] = useState<string[]>(presets);

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  /** Sincroniza o estado HSV caso o valor externo mude. */
  useEffect(() => {
    if (value && value !== hsvToHex(hsv)) {
      setHsv(hexToHsv(value));
      setHexInputValue(value);
    }
  }, [value, hsv]);

  const updateColor = useCallback(
    (newHsv: HsvColor) => {
      setHsv(newHsv);
      const computedHex = hsvToHex(newHsv);
      setInternalHex(computedHex);
      setHexInputValue(computedHex);
      onChange?.(computedHex);
    },
    [onChange],
  );

  /** Manipulação do arrasto na Área 2D de Saturação e Brilho. */
  const handleAreaPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
      const area = areaRef.current;
      if (!area) return;

      const rect = area.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      const saturation = Math.round((x / rect.width) * 100);
      const brightness = Math.round((1 - y / rect.height) * 100);

      updateColor({
        ...hsv,
        s: saturation,
        v: brightness,
      });
    },
    [hsv, updateColor],
  );

  const startAreaDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleAreaPointer(event);

    const onPointerMove = (moveEvent: PointerEvent) => handleAreaPointer(moveEvent);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /** Manipulação do arrasto no Slider de Matiz (Hue). */
  const handleHuePointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
      const hueEl = hueRef.current;
      if (!hueEl) return;

      const rect = hueEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const hue = Math.round((x / rect.width) * 360) % 360;

      updateColor({
        ...hsv,
        h: hue,
      });
    },
    [hsv, updateColor],
  );

  const startHueDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleHuePointer(event);

    const onPointerMove = (moveEvent: PointerEvent) => handleHuePointer(moveEvent);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  /** Manipulação do arrasto no Slider de Opacidade (Alpha). */
  const handleAlphaPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
      const alphaEl = alphaRef.current;
      if (!alphaEl) return;

      const rect = alphaEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const alpha = Math.max(0, Math.min(1, Number((x / rect.width).toFixed(2))));

      updateColor({
        ...hsv,
        a: alpha,
      });
    },
    [hsv, updateColor],
  );

  const startAlphaDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleAlphaPointer(event);

    const onPointerMove = (moveEvent: PointerEvent) => handleAlphaPointer(moveEvent);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
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
        }
      } catch {
        // Usuário cancelou ou navegador bloqueou o conta-gotas
      }
    }
  };

  /** Formatações derivadas para exibição nos campos numéricos. */
  const rgb = useMemo(() => hsvToRgb(hsv), [hsv]);
  const hsl = useMemo(() => hsvToHsl(hsv), [hsv]);

  const handleHexInputBlur = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInputValue)) {
      updateColor(hexToHsv(hexInputValue));
    } else {
      setHexInputValue(currentHex);
    }
  };

  const selectPreset = (preset: string) => {
    updateColor(hexToHsv(preset));
    if (!recentColors.includes(preset)) {
      setRecentColors((prev) => [preset, ...prev.slice(0, 15)]);
    }
  };

  const pureHueColor = `hsl(${hsv.h}, 100%, 50%)`;

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
        {/* Área 2D de Saturação & Brilho */}
        <div
          ref={areaRef}
          onPointerDown={startAreaDrag}
          className="relative h-44 w-full cursor-crosshair overflow-hidden rounded-2xl select-none"
          style={{ backgroundColor: pureHueColor }}
        >
          {/* Camada de saturação (branco horizontal) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #fff, transparent)",
            }}
          />
          {/* Camada de brilho (preto vertical) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #000, transparent)",
            }}
          />

          {/* Marcador Thumb */}
          <div
            className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-[box-shadow]"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: currentHex,
            }}
          />
        </div>

        {/* Sliders de Hue & Opacidade com Conta-Gotas */}
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

          <div className="flex flex-1 flex-col gap-2.5">
            {/* Slider de Hue */}
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

            {/* Slider de Alpha */}
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
        </div>

        {/* Inputs de modo e valores numéricos */}
        <div className="mt-3.5 grid grid-cols-[82px_1fr_64px] items-center gap-1.5">
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
              onChange={(e) => setHexInputValue(e.target.value)}
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
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10) || 0;
                  updateColor(hexToHsv(rgbToHex({ r: val, g: rgb.g, b: rgb.b })));
                }}
                className="h-8 rounded-lg p-0 text-center font-mono text-[11px]"
              />
              <Input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10) || 0;
                  updateColor(hexToHsv(rgbToHex({ r: rgb.r, g: val, b: rgb.b })));
                }}
                className="h-8 rounded-lg p-0 text-center font-mono text-[11px]"
              />
              <Input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10) || 0;
                  updateColor(hexToHsv(rgbToHex({ r: rgb.r, g: rgb.g, b: val })));
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

          <div className="flex h-8 items-center justify-center rounded-xl bg-muted/60 text-xs font-medium text-muted-foreground">
            {Math.round((hsv.a ?? 1) * 100)}%
          </div>
        </div>

        {/* Seção Last Colors / Presets */}
        <div className="mt-3.5 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-0.5">
            <span className="font-medium text-foreground/80">Cores sugeridas</span>
            <span className="text-[11px]">Paleta</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
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
      </PopoverContent>
    </Popover>
  );
}
