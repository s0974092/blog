import React, { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, HelpCircle } from "lucide-react";
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// This function is for the MANUAL cropping path
function getCroppedImg(imageSrc: string, croppedAreaPixels: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('無法取得畫布');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        1280,
        720
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('裁切失敗');
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
}

// This is the FINAL function for the AUTO-FIT path, with conditional effects
function getResizedImgWithColorFill(imageSrc: string): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "Anonymous";
    image.src = imageSrc;
    image.onload = () => {
      try {
        const targetWidth = 1280;
        const targetHeight = 720;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('無法取得畫布');

        // --- Logic to decide which effect to use ---
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) throw new Error('無法取得暫時畫布');
        tempCtx.drawImage(image, 0, 0);

        const edgePixelsData = [];
        const sampleRate = 10; // Sample every 10 pixels
        for (let x = 0; x < image.width; x += sampleRate) {
          edgePixelsData.push(tempCtx.getImageData(x, 0, 1, 1).data);
          edgePixelsData.push(tempCtx.getImageData(x, image.height - 1, 1, 1).data);
        }
        for (let y = 1; y < image.height - 1; y += sampleRate) {
          edgePixelsData.push(tempCtx.getImageData(0, y, 1, 1).data);
          edgePixelsData.push(tempCtx.getImageData(image.width - 1, y, 1, 1).data);
        }

        let r_sum = 0, g_sum = 0, b_sum = 0;
        for (const p of edgePixelsData) { r_sum += p[0]; g_sum += p[1]; b_sum += p[2]; }
        const avgR = r_sum / edgePixelsData.length;
        const avgG = g_sum / edgePixelsData.length;
        const avgB = b_sum / edgePixelsData.length;

        let varianceSum = 0;
        for (const p of edgePixelsData) {
          varianceSum += (p[0] - avgR) ** 2 + (p[1] - avgG) ** 2 + (p[2] - avgB) ** 2;
        }
        const stdDev = Math.sqrt(varianceSum / edgePixelsData.length);
        const COLOR_VARIANCE_THRESHOLD = 45;
        const useEffect = stdDev > COLOR_VARIANCE_THRESHOLD ? 'glass' : 'color';
        
        // --- End of decision logic ---

        const imageAspect = image.width / image.height;
        const canvasAspect = targetWidth / targetHeight;

        // --- Correct "Contain" Logic ---
        let containedWidth, containedHeight, containedX, containedY;
        if (imageAspect > canvasAspect) {
            containedWidth = targetWidth;
            containedHeight = containedWidth / imageAspect;
            containedX = 0;
            containedY = (targetHeight - containedHeight) / 2;
        } else {
            containedHeight = targetHeight;
            containedWidth = containedHeight * imageAspect;
            containedY = 0;
            containedX = (targetWidth - containedWidth) / 2;
        }

        if (useEffect === 'color') {
          // --- Solid Color Fill Logic ---
          const avgColor = `rgb(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`;
          ctx.fillStyle = avgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(image, containedX, containedY, containedWidth, containedHeight);

        } else {
          // --- Frosted Glass Effect Logic ---
          let bgWidth, bgHeight, bgX, bgY;
          if (imageAspect > canvasAspect) {
            bgHeight = targetHeight;
            bgWidth = bgHeight * imageAspect;
            bgX = (targetWidth - bgWidth) / 2;
            bgY = 0;
          } else {
            bgWidth = targetWidth;
            bgHeight = bgWidth / imageAspect;
            bgY = (targetHeight - bgHeight) / 2;
            bgX = 0;
          }
          
          ctx.filter = 'blur(24px) brightness(0.9)';
          ctx.drawImage(image, bgX, bgY, bgWidth, bgHeight);
          ctx.filter = 'none';
          
          const paddedWidth = containedWidth * 0.9;
          const paddedHeight = containedHeight * 0.9;
          const paddedX = (targetWidth - paddedWidth) / 2;
          const paddedY = (targetHeight - paddedHeight) / 2;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 10;
          ctx.drawImage(image, paddedX, paddedY, paddedWidth, paddedHeight);
        }

        canvas.toBlob(resolve, 'image/jpeg', 0.9);

      } catch (e) {
        reject(e);
      }
    };
    image.onerror = (err) => reject(err);
  });
}


interface PostImageUploaderProps {
  value?: string;
  onChange: (url: string | null, file?: File | null) => void;
  disabled?: boolean;
  showPreviewOnly?: boolean;
  showUploadOnly?: boolean;
  showAIGenerateOnly?: boolean;
}

export const PostImageUploader: React.FC<PostImageUploaderProps> = ({ 
  value, 
  onChange, 
  disabled,
  showPreviewOnly = false,
  showUploadOnly = false,
  showAIGenerateOnly = false
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropping state
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const cropperContainerRef = useRef<HTMLDivElement>(null);

  // New state for the switch
  const [useAutoSize, setUseAutoSize] = useState(true);

  const [inputKey, setInputKey] = useState(Date.now());

  useEffect(() => {
    setPreview(value || null);
    if (!value) {
      setInputKey(Date.now());
    }
  }, [value]);

  const handleImageResult = (blob: Blob, isAutoSize: boolean) => {
    const fileName = `cover-${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onChange(base64String, file);
      setPrompt("");
    };
    reader.readAsDataURL(blob);
    toast.success(isAutoSize ? "圖片自動填滿成功" : "圖片裁切成功");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const src = URL.createObjectURL(f);

    if (useAutoSize) {
      setIsProcessing(true);
      try {
        const resizedBlob = await getResizedImgWithColorFill(src);
        if (resizedBlob) {
          handleImageResult(resizedBlob, true);
        } else {
          throw new Error("自動填滿失敗");
        }
      } catch (err) {
        console.error('圖片自動填滿失敗', err);
        toast.error("圖片自動填滿失敗");
      } finally {
        setIsProcessing(false);
        URL.revokeObjectURL(src);
      }
    } else {
      // Manual crop path
      setCropSrc(src);
      setShowCrop(true);
    }
  };

  const handleAIGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("請輸入標題或描述");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai-generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || !data.image) throw new Error(data.error || 'AI 生成圖片失敗');
      setPreview(data.image);
      onChange(data.image, null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("AI 生成圖片成功");
    } catch (e) {
      console.log('AI 生成圖片失敗', e);
      const errorMessage = e instanceof Error ? e.message : "AI 生成圖片失敗";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      handleImageResult(croppedBlob, false);
    } catch (e) {
      console.log('圖片裁切失敗', e);
      toast.error("圖片裁切失敗");
    } finally {
      setIsProcessing(false);
      setShowCrop(false);
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  };
  
  const onMediaLoaded = useCallback((mediaSize: { width: number, height: number }) => {
    if (cropperContainerRef.current) {
      const containerWidth = cropperContainerRef.current.offsetWidth;
      const containerHeight = cropperContainerRef.current.offsetHeight;
      const newZoom = Math.min(containerWidth / mediaSize.width, containerHeight / mediaSize.height);
      setZoom(newZoom);
      setCrop({ x: 0, y: 0 }); // Reset crop position
    }
  }, []);

  const isBusy = disabled || isGenerating || isProcessing;

  const tooltipContent = (
    <div className="text-left">
      <p className="font-bold">開啟時 (預設):</p>
      <p className="pl-2">自動分析圖片邊緣，智慧填滿背景：</p>
      <ul className="list-disc pl-6">
        <li>若顏色單純，則以平均色填滿。</li>
        <li>若顏色豐富，則使用毛玻璃效果。</li>
      </ul>
      <p className="font-bold mt-2">關閉時:</p>
      <p className="pl-2">上傳圖片後，將開啟手動裁切視窗。</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Cropping Modal */}
      <Dialog open={showCrop} onOpenChange={setShowCrop}>
        <DialogContent className="max-w-4xl">
          <div ref={cropperContainerRef} className="relative w-full h-[400px] sm:h-[500px] bg-gray-800">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={16/9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onMediaLoaded={onMediaLoaded}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowCrop(false); if(cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null); if (fileInputRef.current) { fileInputRef.current.value = ""; } }}>取消</Button>
            <Button onClick={handleCropDone} disabled={isProcessing}>
              {isProcessing && <Loader2 className="animate-spin mr-2" size={16} />}
              完成裁切
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showPreviewOnly && (
        <div>
          {preview ? (
            <Image src={preview} alt="文章封面" width={1280} height={720} className="w-full aspect-[16/9] object-cover rounded border" priority />
          ) : (
            <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center rounded text-muted-foreground border">尚未選擇圖片</div>
          )}
        </div>
      )}
      
      {showUploadOnly && (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            key={inputKey}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
            ref={fileInputRef}
            disabled={isBusy}
            className="flex-1"
          />
          <div className="flex items-center space-x-2">
            <Switch id="auto-size-switch" checked={useAutoSize} onCheckedChange={setUseAutoSize} disabled={isBusy} />
            <Label htmlFor="auto-size-switch">自動填滿</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      
      {showAIGenerateOnly && (
        <div className="w-full flex gap-2 items-center">
          <Input
            type="text"
            placeholder="輸入標題或描述讓 AI 幫你生成圖片"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isBusy}
            containerClassName="flex-1"
          />
          <Button onClick={handleAIGenerate} disabled={isBusy} type="button">
            {isGenerating && <Loader2 className="animate-spin mr-2" size={16} />}
            {isGenerating ? "生成中..." : "AI 生成圖片"}
          </Button>
        </div>
      )}
      
      {!showPreviewOnly && !showUploadOnly && !showAIGenerateOnly && (
        <div className="space-y-4">
          <div>
            {preview ? (
              <Image src={preview} alt="文章封面" width={1280} height={720} className="w-full aspect-[16/9] object-cover rounded border" priority />
            ) : (
              <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center rounded text-muted-foreground border">尚未選擇圖片</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label>上傳封面</Label>
                <div className="flex items-center gap-4">
                    <Input
                        key={inputKey}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                        ref={fileInputRef}
                        disabled={isBusy}
                        className="flex-1"
                    />
                    <div className="flex items-center space-x-1">
                        <Switch id="auto-size-switch-main" checked={useAutoSize} onCheckedChange={setUseAutoSize} disabled={isBusy} />
                        <Label htmlFor="auto-size-switch-main">自動填滿</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {tooltipContent}
                          </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <Label>或 AI 生成</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        type="text"
                        placeholder="輸入標題或描述..."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        disabled={isBusy}
                        containerClassName="flex-1"
                    />
                    <Button onClick={handleAIGenerate} disabled={isBusy} type="button">
                        {isGenerating && <Loader2 className="animate-spin mr-2" size={16} />}
                        {isGenerating ? "生成中..." : "AI 生成"}
                    </Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};