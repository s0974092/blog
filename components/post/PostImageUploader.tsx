import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
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
        1200,
        630
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('裁切失敗');
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
}

interface PostImageUploaderProps {
  value?: string; // 現有圖片URL
  onChange: (url: string | null, file?: File | null) => void;
  disabled?: boolean;
}

export const PostImageUploader: React.FC<PostImageUploaderProps> = ({ value, onChange, disabled }) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // 上傳本地圖片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const src = URL.createObjectURL(f);
      setCropSrc(src);
      setShowCrop(true);
    }
  };

  // AI 生成圖片
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
      setPreview(data.image); // base64 預覽
      setFile(null);
      onChange(data.image, null); // 將 base64 傳給父元件
      // 清空檔案選擇
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("AI 生成圖片成功");
    } catch (e: any) {
      toast.error(e.message || "AI 生成圖片失敗");
    } finally {
      setIsGenerating(false);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropDone = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // 將 Blob 轉換為 base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setFile(croppedFile);
        onChange(base64String, croppedFile);
        // 清空 prompt
        setPrompt("");
      };
      reader.readAsDataURL(croppedBlob);
      
      setShowCrop(false);
      setCropSrc(null);
    } catch (e) {
      toast.error("圖片裁切失敗");
    }
  };

  // 移除圖片
  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    onChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* 裁切 Modal */}
      <Dialog open={showCrop} onOpenChange={setShowCrop}>
        <DialogContent className="max-w-2xl">
          <div className="relative w-full h-[400px] bg-black">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1200/630}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowCrop(false); setCropSrc(null); }}>取消</Button>
            <Button onClick={handleCropDone}>完成裁切</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* 圖片預覽 */}
      <div>
        {preview ? (
          <Image
            src={preview}
            alt="文章封面"
            width={320}
            height={180}
            className="w-80 aspect-[16/9] object-cover rounded border"
          />
        ) : (
          <div className="w-80 aspect-[16/9] bg-muted flex items-center justify-center rounded text-muted-foreground border">
            尚未選擇圖片
          </div>
        )}
      </div>
      {/* 上傳圖片 */}
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={disabled || isGenerating || isUploading}
      />
      {/* 或 AI 生成 */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="輸入標題或描述讓 AI 幫你生成圖片"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={disabled || isGenerating || isUploading}
        />
        <Button onClick={handleAIGenerate} disabled={disabled || isGenerating || isUploading} type="button">
          {isGenerating && <Loader2 className="animate-spin mr-2" size={16} />}
          {isGenerating ? "生成中..." : "AI 生成圖片"}
        </Button>
      </div>
      {/* 移除圖片 */}
      {preview && (
        <Button variant="destructive" onClick={handleRemove} type="button" disabled={disabled || isGenerating || isUploading}>
          移除圖片
        </Button>
      )}
    </div>
  );
}; 