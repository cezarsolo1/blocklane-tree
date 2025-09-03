"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadTicketPhoto } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";

export type UploadedPhoto = {
  id: string;
  previewUrl: string;
  name: string;
  size: number;
  mime: string;
  publicUrl: string;
};

type Props = {
  ticketId?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedMimeTypes?: string[];
  value?: UploadedPhoto[];
  onChange?: (files: UploadedPhoto[]) => void;
  showHelpText?: boolean;
};

const DEFAULT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function PhotoDropzone({
  ticketId,
  maxFiles = 8,
  maxSizeMB = 10,
  acceptedMimeTypes = DEFAULT_TYPES,
  value = [],
  onChange,
  showHelpText = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Local mirror of controlled value
  const [files, setFiles] = useState<UploadedPhoto[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const maxSizeBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  useEffect(() => {
    setFiles(value ?? []);
  }, [value?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (next: UploadedPhoto[]) => {
    setFiles(next);
    onChange?.(next);
  };

  const openPicker = () => inputRef.current?.click();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const validateFiles = (fileList: File[]) => {
    const errors: string[] = [];
    const allowedRemaining = Math.max(0, maxFiles - files.length);
    if (fileList.length > allowedRemaining) {
      errors.push(`Maximaal ${maxFiles} foto's. U probeerde ${fileList.length} bestanden toe te voegen.`);
    }
    fileList.forEach((f) => {
      if (!acceptedMimeTypes.includes(f.type)) {
        errors.push(`${f.name}: bestandstype niet toegestaan (${f.type}).`);
      }
      if (f.size > maxSizeBytes) {
        errors.push(`${f.name}: groter dan ${maxSizeMB} MB.`);
      }
    });
    return errors;
  };

  const uploadFiles = useCallback(
    async (fileList: File[]) => {
      const errors = validateFiles(fileList);
      if (errors.length) {
        toast({ title: "Bestanden geweigerd", description: errors.join("\n"), variant: "destructive" });
        return;
      }

      if (!user) {
        toast({ title: "Upload mislukt", description: "U moet ingelogd zijn om bestanden te uploaden.", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      try {
        const results: UploadedPhoto[] = [];
        const ticketKey = ticketId || String(Date.now());

        for (const file of fileList) {
          const id = crypto.randomUUID();
          const { publicUrl } = await uploadTicketPhoto(user.id, ticketKey, file);

          results.push({
            id,
            previewUrl: publicUrl,
            name: file.name,
            size: file.size,
            mime: file.type,
            publicUrl,
          });
        }

        const next = [...files, ...results].slice(0, maxFiles);
        update(next);
        toast({ title: "Foto's toegevoegd", description: `${results.length} foto('s) geüpload.` });
      } catch (err: any) {
        toast({
          title: "Upload mislukt",
          description: err?.message ?? "Er ging iets mis tijdens het uploaden.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [files, user, ticketId, maxFiles, maxSizeBytes, acceptedMimeTypes, toast] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    uploadFiles(dropped);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) uploadFiles(picked);
    // reset input so selecting the same file again still fires change
    e.currentTarget.value = "";
  };

  const remove = async (photo: UploadedPhoto) => {
    // For now, we'll just remove from UI since we're storing public URLs
    // In production, you may want to track and delete the actual files
    const next = files.filter((f) => f.id !== photo.id);
    update(next);
  };

  return (
    <div className="w-full">
      {/* Thumbnails ABOVE the dropzone */}
      {files.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3" aria-live="polite">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative h-24 w-24 overflow-hidden rounded-xl bg-muted shadow-sm"
              title={file.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(file)}
                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white/80 hover:bg-white"
                aria-label={`Verwijder foto ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? openPicker() : null)}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center outline-none transition",
          "border-muted-foreground/30 bg-muted/20 hover:bg-muted/30",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <Upload className="mb-3 h-8 w-8 opacity-70" aria-hidden />
        <p className="text-base font-medium">Klik of sleep foto's hierheen om te uploaden</p>
        {showHelpText && (
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP, HEIC • max {maxSizeMB}MB per foto • max {maxFiles}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={acceptedMimeTypes.join(",")}
          multiple
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* Footer status */}
      <div className="mt-2 text-sm text-muted-foreground">
        {isUploading
          ? "Bezig met uploaden…"
          : files.length > 0
          ? `${files.length} foto(${files.length === 1 ? "" : "'s"}) toegevoegd`
          : "Geen foto's toegevoegd"}
      </div>
    </div>
  );
}