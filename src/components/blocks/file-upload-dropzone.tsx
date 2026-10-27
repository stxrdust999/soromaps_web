"use client";

import {
  FileImageIcon,
  PencilIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type CropTransformState,
  ImageCropperDialog,
} from "@/components/blocks/image-cropper-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  value?: File;
  onChange: (file?: File) => void;
  maxSizeInBytes?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
  aspectRatio?: "circle" | "landscape";
}

const DEFAULT_MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Converte bytes num formato legível para humanos (ex.: 1.2 MB).
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const kilobyte = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(kilobyte));
  const formattedValue = (bytes / kilobyte ** sizeIndex).toFixed(1);

  return `${formattedValue} ${sizes[sizeIndex]}`;
}

/**
 * Área de upload com suporte a arrastar-e-soltar, recorte interativo integrado e card de mídia em proporção visual.
 */
export function FileUploadDropzone({
  value,
  onChange,
  maxSizeInBytes = DEFAULT_MAX_SIZE_BYTES,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className,
  aspectRatio = "landscape",
}: FileUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperSourceUrl, setCropperSourceUrl] = useState<string | null>(null);
  const [pendingRawFile, setPendingRawFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [savedTransform, setSavedTransform] =
    useState<CropTransformState | null>(null);
  const [activeInitialTransform, setActiveInitialTransform] =
    useState<CropTransformState | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /** Gera e descarta a URL temporária de pré-visualização da imagem selecionada. */
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setOriginalFile(null);
      setSavedTransform(null);
      setActiveInitialTransform(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const validateAndSelectFile = useCallback(
    (file: File) => {
      setValidationError(null);

      if (!acceptedTypes.includes(file.type)) {
        setValidationError(
          "Formato inválido. Envie uma foto em JPG, PNG ou WebP.",
        );
        return;
      }

      if (file.size > maxSizeInBytes) {
        setValidationError(
          `Arquivo muito grande. O limite máximo permitido é de ${formatFileSize(
            maxSizeInBytes,
          )}.`,
        );
        return;
      }

      const temporaryUrl = URL.createObjectURL(file);
      setOriginalFile(file);
      setSavedTransform(null);
      setActiveInitialTransform(null);
      setCropperSourceUrl(temporaryUrl);
      setPendingRawFile(file);
      setIsCropperOpen(true);
    },
    [acceptedTypes, maxSizeInBytes],
  );

  const handleCropComplete = useCallback(
    (
      croppedFile: File,
      _croppedPreviewUrl: string,
      transformState: CropTransformState,
    ) => {
      onChange(croppedFile);
      setSavedTransform(transformState);
      setIsCropperOpen(false);
      setPendingRawFile(null);
      if (cropperSourceUrl) {
        URL.revokeObjectURL(cropperSourceUrl);
        setCropperSourceUrl(null);
      }
    },
    [onChange, cropperSourceUrl],
  );

  const handleCropperOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (pendingRawFile && !value) onChange(pendingRawFile);
        setIsCropperOpen(false);
        setPendingRawFile(null);
        if (cropperSourceUrl) {
          URL.revokeObjectURL(cropperSourceUrl);
          setCropperSourceUrl(null);
        }
        return;
      }
      setIsCropperOpen(true);
    },
    [pendingRawFile, value, onChange, cropperSourceUrl],
  );

  const handleOpenCropper = useCallback(() => {
    if (disabled || !value) return;
    const sourceFile = originalFile ?? value;
    const temporaryUrl = URL.createObjectURL(sourceFile);
    setActiveInitialTransform(savedTransform);
    setCropperSourceUrl(temporaryUrl);
    setPendingRawFile(sourceFile);
    setIsCropperOpen(true);
  }, [disabled, value, originalFile, savedTransform]);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFile = event.dataTransfer.files?.[0];
      if (droppedFile) validateAndSelectFile(droppedFile);
    },
    [disabled, validateAndSelectFile],
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) validateAndSelectFile(selectedFile);
    },
    [validateAndSelectFile],
  );

  const handleRemove = useCallback(() => {
    setValidationError(null);
    onChange(undefined);
    setPendingRawFile(null);
    setOriginalFile(null);
    setSavedTransform(null);
    setActiveInitialTransform(null);
    if (cropperSourceUrl) {
      URL.revokeObjectURL(cropperSourceUrl);
      setCropperSourceUrl(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange, cropperSourceUrl]);

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={handleFileInputChange}
      />

      {value ? (
        <div
          onClick={handleOpenCropper}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOpenCropper();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Editar recorte da foto selecionada"
          className={cn(
            "relative group w-full max-h-52 aspect-video rounded-xl overflow-hidden border border-border bg-neutral-950 shadow-sm cursor-pointer",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {previewUrl ? (
            // biome-ignore lint/performance/noImgElement: Blob local para preview imediato
            <img
              src={previewUrl}
              alt={`Foto selecionada: ${value.name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex w-full h-full items-center justify-center text-muted-foreground">
              <FileImageIcon className="size-8" />
            </div>
          )}

          {/* Botões de ação flutuantes no canto superior direito */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 rounded-full bg-black/60 hover:bg-black/80 px-3 text-xs text-white backdrop-blur-xs border border-white/20 shadow-md"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenCropper();
              }}
              disabled={disabled}
              aria-label="Reajustar enquadramento da foto"
            >
              <PencilIcon className="size-3.5" />
              <span>Editar recorte</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-8 rounded-full bg-black/60 hover:bg-destructive text-white backdrop-blur-xs border border-white/20 shadow-md"
              onClick={(event) => {
                event.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
              aria-label="Remover foto"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>

          {/* Barra de rodapé sobre a imagem com gradiente preto/transparente */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white flex items-center justify-between gap-2">
            <p
              className="truncate min-w-0 max-w-[calc(100%-80px)] text-xs font-medium"
              title={value.name}
            >
              {value.name}
            </p>
            <span className="text-[10px] text-white/70 shrink-0 font-medium">
              {formatFileSize(value.size)}
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleTriggerClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Área para envio de fotos por clique ou arrasto"
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/15 hover:border-muted-foreground/45 hover:bg-muted/30",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-border">
            <UploadCloudIcon className="size-6 text-primary" />
          </div>

          <div className="space-y-0.5">
            <p className="font-medium text-foreground text-sm">
              Arraste uma foto ou clique para escolher
            </p>
            <p className="text-muted-foreground text-xs">
              Aceita JPG, PNG ou WebP até 15 MB
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 h-8 px-3 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              handleTriggerClick();
            }}
            disabled={disabled}
          >
            Selecionar arquivo
          </Button>
        </div>
      )}

      {validationError && (
        <p className="font-medium text-destructive text-xs">
          {validationError}
        </p>
      )}

      <ImageCropperDialog
        open={isCropperOpen}
        onOpenChange={handleCropperOpenChange}
        imageSource={cropperSourceUrl}
        onCropComplete={handleCropComplete}
        initialTransform={activeInitialTransform}
        aspectRatio={aspectRatio}
      />
    </div>
  );
}
