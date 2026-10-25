"use client";

import {
  Loader2Icon,
  RotateCcwIcon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSource: string | null;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
  isSubmitting?: boolean;
  aspectRatio?: "circle" | "landscape";
  title?: string;
  description?: string;
}

interface DragOffset {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const CIRCLE_CROP_BOX_SIZE = 240;
const CIRCLE_OUTPUT_SIZE = 400;

const LANDSCAPE_CROP_BOX_WIDTH = 320;
const LANDSCAPE_CROP_BOX_HEIGHT = 180;
const LANDSCAPE_OUTPUT_WIDTH = 800;
const LANDSCAPE_OUTPUT_HEIGHT = 450;

/**
 * Diálogo interativo para recorte de fotos (circular ou panorâmico 16:9) com zoom, rotação e arrasto.
 */
export function ImageCropperDialog({
  open,
  onOpenChange,
  imageSource,
  onCropComplete,
  isSubmitting = false,
  aspectRatio = "circle",
  title,
  description,
}: ImageCropperDialogProps) {
  const isLandscape = aspectRatio === "landscape";
  const cropBoxWidth = isLandscape ? LANDSCAPE_CROP_BOX_WIDTH : CIRCLE_CROP_BOX_SIZE;
  const cropBoxHeight = isLandscape ? LANDSCAPE_CROP_BOX_HEIGHT : CIRCLE_CROP_BOX_SIZE;
  const outputWidth = isLandscape ? LANDSCAPE_OUTPUT_WIDTH : CIRCLE_OUTPUT_SIZE;
  const outputHeight = isLandscape ? LANDSCAPE_OUTPUT_HEIGHT : CIRCLE_OUTPUT_SIZE;
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerReference = useRef<HTMLDivElement | null>(null);
  const imageReference = useRef<HTMLImageElement | null>(null);
  const dragOffsetReference = useRef<DragOffset>({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const resetTransformations = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (open) resetTransformations();
  }, [open, resetTransformations]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isSubmitting) return;

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffsetReference.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSubmitting) return;

    const deltaX = event.clientX - dragOffsetReference.current.startX;
    const deltaY = event.clientY - dragOffsetReference.current.startY;

    setPosition({
      x: dragOffsetReference.current.originX + deltaX,
      y: dragOffsetReference.current.originY + deltaY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleRotateQuarterClockwise = () => {
    setRotation((previousRotation) => (previousRotation + 90) % 360);
  };

  const handleRotateQuarterCounterClockwise = () => {
    setRotation((previousRotation) => (previousRotation - 90 + 360) % 360);
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const zoomStep = event.deltaY < 0 ? 0.1 : -0.1;
    setZoom((previousZoom) => Math.min(3, Math.max(0.8, Number((previousZoom + zoomStep).toFixed(2)))));
  };

  const handleConfirmCrop = async () => {
    const imageElement = imageReference.current;
    if (!imageElement || isSubmitting) return;

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    /** Centraliza o ponto de rotação e translação no meio do canvas de saída */
    context.translate(outputWidth / 2, outputHeight / 2);
    context.rotate((rotation * Math.PI) / 180);

    const scaleFactor = (outputWidth / cropBoxWidth) * zoom;
    const renderedWidth = imageElement.naturalWidth * scaleFactor;
    const renderedHeight = imageElement.naturalHeight * scaleFactor;

    /** Compensação da posição relativa ao fator de escala do container */
    const scaledPositionX = position.x * (outputWidth / cropBoxWidth);
    const scaledPositionY = position.y * (outputHeight / cropBoxHeight);

    context.drawImage(
      imageElement,
      -renderedWidth / 2 + scaledPositionX,
      -renderedHeight / 2 + scaledPositionY,
      renderedWidth,
      renderedHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const filePrefix = isLandscape ? "media" : "avatar";
        const fileName = `${filePrefix}-${Date.now()}.jpg`;
        const croppedFile = new File([blob], fileName, { type: "image/jpeg" });
        const croppedPreviewUrl = URL.createObjectURL(blob);

        onCropComplete(croppedFile, croppedPreviewUrl);
      },
      "image/jpeg",
      0.92,
    );
  };

  const dialogTitle =
    title ?? (isLandscape ? "Ajustar foto da mídia" : "Ajustar foto de perfil");
  const dialogDescription =
    description ??
    (isLandscape
      ? "Arraste, gire e ajuste o zoom para enquadrar a imagem dentro da proporção panorâmica."
      : "Arraste, gire e ajuste o zoom para posicionar seu avatar dentro da área circular.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isLandscape ? "max-w-xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {/* crop-workspace - section */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div
            ref={containerReference}
            className="relative flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950 w-full h-72 select-none touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheelZoom}
          >
            {imageSource ? (
              // biome-ignore lint/performance/noImgElement: Imagem dinâmica recortada via coordenadas e Canvas 2D nativo
              <img
                ref={imageReference}
                src={imageSource}
                alt="Prévia para recorte"
                draggable={false}
                className="max-w-none transition-transform duration-75 select-none pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  maxHeight: `${cropBoxHeight}px`,
                }}
              />
            ) : null}

            {/* Máscara de recorte com sombreamento perimetral e borda de destaque */}
            {isLandscape ? (
              <>
                <div
                  className="pointer-events-none absolute rounded-lg border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                  style={{
                    width: `${cropBoxWidth}px`,
                    height: `${cropBoxHeight}px`,
                  }}
                />
                <div
                  className="pointer-events-none absolute rounded-lg border border-white/20"
                  style={{
                    width: `${cropBoxWidth}px`,
                    height: `${cropBoxHeight}px`,
                  }}
                />
              </>
            ) : (
              <>
                <div
                  className="pointer-events-none absolute rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                  style={{
                    width: `${cropBoxWidth}px`,
                    height: `${cropBoxHeight}px`,
                  }}
                />
                <div
                  className="pointer-events-none absolute rounded-full border border-white/20"
                  style={{
                    width: `${cropBoxWidth}px`,
                    height: `${cropBoxHeight}px`,
                  }}
                />
              </>
            )}
          </div>

          {/* Controles de Zoom e Rotação */}
          <div className="flex w-full flex-col gap-3 px-1">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <ZoomOutIcon className="size-3.5" />
                Zoom
              </span>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                disabled={isSubmitting}
                onChange={(event) => setZoom(Number.parseFloat(event.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-primary"
                aria-label="Controle de zoom da foto"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <ZoomInIcon className="size-3.5" />
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotateQuarterCounterClockwise}
                  disabled={isSubmitting}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcwIcon className="size-3.5" />
                  -90°
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotateQuarterClockwise}
                  disabled={isSubmitting}
                  className="gap-1.5 text-xs"
                >
                  <RotateCwIcon className="size-3.5" />
                  +90°
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetTransformations}
                disabled={isSubmitting}
                className="text-xs text-muted-foreground"
              >
                Redefinir
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isSubmitting || !imageSource}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {isLandscape ? "Salvando imagem..." : "Salvando avatar..."}
              </>
            ) : (
              "Confirmar e salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
