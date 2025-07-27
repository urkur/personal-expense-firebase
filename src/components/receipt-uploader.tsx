'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReceiptUploaderProps {
  onUpload: (dataUrl: string) => void;
  isProcessing: boolean;
}

export function ReceiptUploader({ onUpload, isProcessing }: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onUpload(dataUrl);
      };
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'Could not read the selected file. Please try again.',
          });
      }
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow uploading the same file again
    event.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Upload />
        )}
        <span className="ml-2">
          {isProcessing ? 'Processing...' : 'Upload Receipt'}
        </span>
      </Button>
    </div>
  );
}
