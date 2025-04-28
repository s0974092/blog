import { Crepe } from '@milkdown/crepe';
import { FC, useRef, useEffect, useState } from 'react';
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { generatePinyin } from "@/lib/utils";
import { insert, replaceAll } from "@milkdown/kit/utils";

interface MilkdownEditorProps {
    id: string,
    markdown: string;
    setMarkdown: (markdown: string) => void;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

// 提取 Markdown 中的圖片路徑
function extractImagePaths(content: string | undefined): string[] {
  if (!content) {
    console.log('extractImagePaths: content is empty');
    return [];
  }
//   console.log('extractImagePaths: processing content:', content);
  // 修改正則表達式以更準確地匹配圖片路徑
  const regex = /!\[.*?\]\((.*?)\)/g;
  const paths: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const fullPath = match[1];
    // 從完整路徑中提取文件名
    const fileName = fullPath.split('/').pop()?.split('"')[0] || '';
    // console.log('extractImagePaths: found match:', fileName);
    if (fileName) {
      paths.push(fileName);
    }
  }
  console.log('extractImagePaths: extracted paths:', paths);
  return paths;
}

export const CrepeEditor: FC<MilkdownEditorProps> = ({
    id,
    markdown,
    setMarkdown,
    isFullscreen = false,
    onToggleFullscreen,
}) => {
    const crepeRef = useRef<Crepe | null>(null);
    const setMarkdownRef = useRef(setMarkdown);
    const [showControls, setShowControls] = useState(false);
    const imagePathsRef = useRef<string[]>([]);

    useEffect(() => {
        setMarkdownRef.current = setMarkdown;
    }, [setMarkdown]);

    // 初始化時從 markdown 中提取圖片路徑
    useEffect(() => {
        // console.log('Initial markdown:', markdown);
        const imagePaths = extractImagePaths(markdown);
        // console.log('Initial image paths:', imagePaths);
        imagePathsRef.current = imagePaths;
    }, []); // 僅在組件掛載時執行一次

    useEffect(() => {
        const crepe = new Crepe({
            root: document.getElementById(id),
            defaultValue: markdown,
            features: {
                [Crepe.Feature.ImageBlock]: true
            },
            featureConfigs: {
                [Crepe.Feature.ImageBlock]: {
                    onUpload: async (file: File) => {
                        return new Promise<string>((resolve, reject) => {
                            handleImageUpload(file, (url, alt) => {
                                resolve(url);
                            });
                        });
                    }
                }
            }
        });
        crepeRef.current = crepe;
        crepe.create();

        const onMarkdownUpdated = (_ctx: any, markdown: string, _prevMarkdown: string) => {
            if (markdown !== _prevMarkdown) {
                setMarkdownRef.current(markdown);
            }
        };

        crepe.on((listener) => {
            listener.markdownUpdated(onMarkdownUpdated);
        });

        return () => {
            crepe.destroy();
            // 在組件卸載時清理未使用的圖片
            handleImageCleanup();
        };
    }, [id]);

    // 處理圖片上傳
    const handleImageUpload = async (blob: Blob, callback: (url: string, alt: string) => void) => {
        const fileName = `${Date.now()}-${generatePinyin((blob as File).name)}`;
        // console.log('Uploading image with fileName:', fileName);

        try {
            const { data, error } = await supabase.storage
                .from('post-content-images')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: publicUrlData } = supabase.storage
                .from('post-content-images')
                .getPublicUrl(data.path);

            if (!publicUrlData.publicUrl) {
                throw new Error('無法獲取圖片的公開 URL');
            }

            // console.log('Image uploaded successfully, URL:', publicUrlData.publicUrl);
            callback(publicUrlData.publicUrl, (blob as File).name);

            // 更新圖片路徑列表
            imagePathsRef.current = [...imagePathsRef.current, fileName];
            // console.log('Updated image paths after upload:', imagePathsRef.current);
        } catch (error) {
            console.error('圖片上傳失敗:', error);
            toast.error('圖片上傳失敗');
        }
    };

    // 處理圖片清除
    const handleImageCleanup = async () => {
        const markdownContent = crepeRef.current?.getMarkdown();
        // console.log('handleImageCleanup: markdownContent:', markdownContent);
        
        if (!markdownContent) {
            console.log('handleImageCleanup: no markdown content');
            return;
        }

        const newImagePaths = extractImagePaths(markdownContent);
        // console.log('handleImageCleanup: current images in content:', newImagePaths);
        // console.log('handleImageCleanup: original image list:', imagePathsRef.current);

        // 找出需要刪除的圖片
        const imagesToDelete = imagePathsRef.current.filter(
            (path) => !newImagePaths.some(newPath => 
                newPath.includes(path) || path.includes(newPath)
            )
        );
        console.log('handleImageCleanup: images to delete:', imagesToDelete);

        // 批量刪除不需要的圖片
        if (imagesToDelete.length > 0) {
            try {
                const { error } = await supabase.storage
                    .from('post-content-images')
                    .remove(imagesToDelete);

                if (error) {
                    console.error(`刪除批量圖片失敗: `, error);
                    toast.error('刪除圖片失敗');
                } else {
                    console.log(`成功刪除 ${imagesToDelete.length} 張圖片`);
                    // 更新圖片路徑列表
                    imagePathsRef.current = imagePathsRef.current.filter(
                        path => !imagesToDelete.includes(path)
                    );
                    // console.log('handleImageCleanup: updated image paths:', imagePathsRef.current);
                }
            } catch (error) {
                console.error(`刪除圖片時發生錯誤: ${error}`);
                toast.error('刪除圖片時發生錯誤');
            }
        }
    };

    return (
        <div 
            className="relative"
            onMouseEnter={() => isFullscreen && setShowControls(true)}
            onMouseLeave={() => isFullscreen && setShowControls(false)}
        >
            <div
                id={id}
                className={`crepe overflow-auto rounded-xl border border-nord-outline dark:border-nord-outline-dark ${
                    isFullscreen 
                        ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' 
                        : '!h-80 md:!h-[480px]'
                }`}
            />
            {onToggleFullscreen && (
                <>
                    {/* 全屏模式下的退出按鈕 */}
                    {isFullscreen && (
                        <div 
                            className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
                                showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                        >
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md text-sm font-medium"
                                onClick={onToggleFullscreen}
                                aria-label="退出沉浸式模式"
                            >
                                <Minimize2 className="h-4 w-4" />
                                <span>退出沉浸式模式</span>
                            </button>
                        </div>
                    )}
                    
                    {/* 非全屏模式下的全屏按鈕 */}
                    {!isFullscreen && (
                        <button
                            type="button"
                            className="absolute top-2 right-2 p-2 rounded-md bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm z-10"
                            onClick={onToggleFullscreen}
                            aria-label="全屏編輯"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default CrepeEditor;