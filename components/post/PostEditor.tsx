import React, { forwardRef, useImperativeHandle, useMemo, useRef, useEffect, useCallback, useState } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import Paragraph from '@yoopta/paragraph';
import Link, { LinkElementProps } from '@yoopta/link';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Code from '@yoopta/code';
import Callout from '@yoopta/callout';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Blockquote from '@yoopta/blockquote';
import { cn, generateFileName } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// 圖片追蹤管理
class ImageTracker {
  private images = new Set<string>();
  private onDeleteCallback?: (url: string) => void;

  addImage(url: string) {
    this.images.add(url);
  }

  removeImage(url: string) {
    if (this.images.has(url)) {
      this.images.delete(url);
      
      if (this.onDeleteCallback) {
        this.onDeleteCallback(url);
      }
    }
  }

  setDeleteCallback(callback: (url: string) => void) {
    this.onDeleteCallback = callback;
  }

  getImages(): string[] {
    return Array.from(this.images);
  }

  clear() {
    this.images.clear();
  }
}

const imageTracker = new ImageTracker();

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Link.extend({
    elementProps: {
      link: (props: LinkElementProps) => ({
        ...props,
        target: '_blank',
      }),
    },
  }),
  Code,
  Embed,
  Image.extend({
    options: {
      async onUpload(file: File) {
        const fileName = generateFileName(file.name);
        const { error } = await supabase.storage
          .from('post-content-images')
          .upload(fileName, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from('post-content-images')
          .getPublicUrl(fileName);
        
        // 使用瀏覽器的 Image API 取得圖片尺寸
        const getImageDimensions = (): Promise<{ width: number; height: number }> => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.src = URL.createObjectURL(file);
          });
        };
        
        const dimensions = await getImageDimensions();
        const imageUrl = publicUrlData.publicUrl;
        
        // 添加到圖片追蹤器
        imageTracker.addImage(imageUrl);
        
        return {
          src: imageUrl,
          alt: 'supabase',
          sizes: {
            width: dimensions.width,
            height: dimensions.height,
          },
        };
      },
    },
  }),
];

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
  ActionMenu: {
    tool: ActionMenuList,
    render: DefaultActionMenuRender,
  },
};

export interface PostEditorProps {
  value?: YooptaContentValue;
  onChange?: (value: YooptaContentValue, plainText: string) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
  selectionBoxRoot?: React.RefObject<HTMLElement>;
  // 其他自訂 props 可擴充
}

export interface PostEditorRef {
  getPlainText: (yooptaValue: YooptaContentValue) => string;
  getEditorValue: () => YooptaContentValue | undefined;
	getRemarkdownValue?: () => string | undefined;
	getHTMLValue?: () => string | undefined;
	cleanupAllImages?: () => Promise<void>;
}

export const PostEditor = forwardRef<PostEditorRef, PostEditorProps>(({
  value,
  onChange,
  readOnly = false,
  autoFocus = false,
  className = '',
  selectionBoxRoot,
}, ref) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const localSelectionRef = useRef(null);
  const selectionRef = selectionBoxRoot || localSelectionRef;
  const isInitialized = useRef(false);
  const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];
  const [isComposing, setIsComposing] = useState(false); // 新增狀態來追蹤組字狀態

  // 清理 Storage 中的圖片
  const cleanupImageFromStorage = useCallback(async (imageUrl: string) => {
    
    if (imageUrl.includes('supabase.co')) {
      try {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error } = await supabase.storage
          .from('post-content-images')
          .remove([fileName]);
        
        if (error) {
          console.error('刪除 Storage 圖片失敗:', error);
        } else {
          console.log('成功刪除 Storage 中的圖片:', fileName);
        }
      } catch (error) {
        console.error('刪除 Storage 圖片時發生錯誤:', error);
      }
    } else {
      console.warn('圖片 URL 不包含 supabase.co，跳過刪除:', imageUrl);
    }
  }, []);

    // 處理中文輸入法（IME）組字問題
    useEffect(() => {
      const editorElement = selectionRef.current;
      if (!editorElement) return;

      const handleCompositionStart = () => setIsComposing(true);
      const handleCompositionEnd = () => setIsComposing(false);

      const handleKeyDown = (event: KeyboardEvent) => {
        // 當用戶使用輸入法（如中文輸入法）時，isComposing 會為 true。
        // 在此期間，我們不希望編輯器處理按鍵事件（如 Enter 或 Backspace），
        // 因為這會干擾輸入法的正常組字過程。
        if (isComposing) {
          // 停止事件向上傳播，從而阻止 YooptaEditor 的內部按鍵處理程序。
          event.stopPropagation();
        }
      };

      // 'compositionstart' 和 'compositionend' 事件用於跟踪 IME 的狀態。
      editorElement.addEventListener('compositionstart', handleCompositionStart);
      editorElement.addEventListener('compositionend', handleCompositionEnd);
      
      // 我們在捕獲階段（第三個參數為 true）監聽 keydown 事件。
      // 這確保我們的處理程序在 YooptaEditor 的任何內部 keydown 處理程序之前運行。
      editorElement.addEventListener('keydown', handleKeyDown, true);

      return () => {
        editorElement.removeEventListener('compositionstart', handleCompositionStart);
        editorElement.removeEventListener('compositionend', handleCompositionEnd);
        editorElement.removeEventListener('keydown', handleKeyDown, true);
      };
    }, [selectionRef, isComposing]);
  

  // 設置圖片刪除回調
  useEffect(() => {
    imageTracker.setDeleteCallback(cleanupImageFromStorage);
  }, [cleanupImageFromStorage]);

  useImperativeHandle(ref, () => ({
    getPlainText: (yooptaValue: YooptaContentValue) => editor.getPlainText(yooptaValue),
    getEditorValue: () => editor.getEditorValue(),
		getRemarkdownValue: () => editor.getMarkdown(editor.getEditorValue()),
		getHTMLValue: () => editor.getHTML(editor.getEditorValue()),
		cleanupAllImages: async () => {
			const images = imageTracker.getImages();
			if (images.length > 0) {
				console.log('手動清理所有圖片:', images);
				for (const imageUrl of images) {
					await cleanupImageFromStorage(imageUrl);
				}
				imageTracker.clear();
			}
		},
  }), [editor, cleanupImageFromStorage]);

  // 當 value 初始化時自動調用 onChange
  useEffect(() => {
    if (value && onChange && !isInitialized.current) {
      const plainText = editor.getPlainText(value);
      onChange(value, plainText);
      isInitialized.current = true;
      
      // 初始化時將現有的圖片添加到追蹤器
      const extractExistingImages = (content: YooptaContentValue) => {
        if (!content) return;
        
        const traverseNodes = (nodes: unknown[]) => {
          for (const node of nodes) {
            if (typeof node === 'object' && node !== null) {
              const typedNode = node as { type?: string; props?: { src?: string }; children?: unknown[]; value?: unknown[] };
              if (typedNode.type === 'image' && typedNode.props?.src) {
                imageTracker.addImage(typedNode.props.src);
              } else if (typedNode.type === 'Image' && typedNode.value && Array.isArray(typedNode.value)) {
                for (const valueNode of typedNode.value) {
                  if (typeof valueNode === 'object' && valueNode !== null) {
                    const typedValueNode = valueNode as { type?: string; props?: { src?: string } };
                    if (typedValueNode.type === 'image' && typedValueNode.props?.src) {
                      imageTracker.addImage(typedValueNode.props.src);
                    }
                  }
                }
              }
              if (typedNode.children && typedNode.children.length > 0) {
                traverseNodes(typedNode.children);
              }
            }
          }
        };
        
        const contentArray = Array.isArray(content) ? content : [content];
        traverseNodes(contentArray);
      };
      
      extractExistingImages(value);
      console.log('初始化完成，當前追蹤的圖片:', imageTracker.getImages());
    }
  }, [value, onChange, editor]);

  // 定期檢查圖片追蹤的準確性
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const currentContent = editor.getEditorValue();
      if (currentContent) {
        const contentStr = JSON.stringify(currentContent);
        const trackedImages = imageTracker.getImages();
        
        // 檢查追蹤的圖片是否還在編輯器中
        trackedImages.forEach(imageUrl => {
          if (!contentStr.includes(imageUrl)) {
            imageTracker.removeImage(imageUrl);
          }
        });
      }
    }, 5000); // 每 5 秒檢查一次
    
    return () => clearInterval(checkInterval);
  }, [editor]);

  // 監聽編輯器事件來捕獲刪除和替換操作
  useEffect(() => {
    const handleEditorEvent = (event: { type?: string; target?: { type?: string; src?: string; props?: { src?: string } } }) => {
      // 監聽編輯器的刪除事件
      if (event.type === 'delete' || event.type === 'remove') {
        // 檢查是否刪除了圖片節點
        if (event.target && event.target.type === 'image') {
          const imageUrl = event.target.src || event.target.props?.src;
          if (imageUrl) {
            imageTracker.removeImage(imageUrl);
          }
        }
      }
      
      // 監聽圖片替換事件
      if (event.type === 'replace' || event.type === 'replaceImage') {
        
        // 檢查是否替換了圖片節點
        if (event.target && event.target.type === 'image') {
          const oldImageUrl = event.target.src || event.target.props?.src;
          const newImageUrl = (event as { newSrc?: string; newProps?: { src?: string } }).newSrc || (event as { newSrc?: string; newProps?: { src?: string } }).newProps?.src;
          
          if (oldImageUrl && newImageUrl) {
            imageTracker.removeImage(oldImageUrl);
            imageTracker.addImage(newImageUrl);
          }
        }
      }
    };

    // 監聽編輯器命令
    const handleEditorCommand = (command: { type?: string; oldSrc?: string; newSrc?: string }) => {
      // 檢查是否為刪除命令
      if (command.type === 'delete' || command.type === 'remove') {
        // 獲取當前編輯器內容並檢查是否有圖片被刪除
        const currentContent = editor.getEditorValue();
        if (currentContent) {
          // 簡單檢查：如果當前內容中沒有圖片，但追蹤器中有圖片，則認為圖片被刪除了
          const hasImages = JSON.stringify(currentContent).includes('supabase.co');
          if (!hasImages) {
            const trackedImages = imageTracker.getImages();
            if (trackedImages.length > 0) {
              console.log('檢測到所有圖片可能已被刪除:', trackedImages);
              // 這裡可以選擇是否要清理所有圖片
              // 或者等待更精確的檢測
            }
          }
        }
      }
      
      // 檢查是否為替換命令
      if (command.type === 'replace' || command.type === 'replaceImage') {
        
        // 檢查命令中是否包含新舊圖片 URL
        if (command.oldSrc && command.newSrc) {
          imageTracker.removeImage(command.oldSrc);
          imageTracker.addImage(command.newSrc);
        }
      }
    };

    // 使用 MutationObserver 監聽 DOM 變化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 檢查是否有圖片元素被移除
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const imgElements = element.querySelectorAll('img[src*="supabase.co"]');
              imgElements.forEach((img) => {
                const src = img.getAttribute('src');
                if (src) {
                  imageTracker.removeImage(src);
                }
              });
            }
          });
          
          // 檢查是否有圖片元素被替換
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const imgElements = element.querySelectorAll('img[src*="supabase.co"]');
              imgElements.forEach((img) => {
                const src = img.getAttribute('src');
                if (src) {
                  imageTracker.addImage(src);
                }
              });
            }
          });
        }
        
        // 監聽屬性變化（圖片 src 變化）
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          const target = mutation.target as HTMLImageElement;
          if (target && target.src && target.src.includes('supabase.co')) {
            const oldSrc = mutation.oldValue;
            const newSrc = target.src;
            
            if (oldSrc && newSrc && oldSrc !== newSrc) {
              
              // 即使舊圖片不在追蹤列表中，也要嘗試刪除它
              if (imageTracker.getImages().includes(oldSrc)) {
                imageTracker.removeImage(oldSrc);
              } else {
                // 直接刪除舊圖片，不通過追蹤器
                cleanupImageFromStorage(oldSrc);
              }
              
              // 添加新圖片到追蹤器
              imageTracker.addImage(newSrc);
            }
          }
        }
      });
    });

    // 添加事件監聽器
    const editorElement = selectionRef?.current;
    if (editorElement) {
      // 監聽自定義事件，將事件處理函數簽名調整為標準 EventListener
      editorElement.addEventListener('yoopta:delete', handleEditorEvent as EventListener);
      editorElement.addEventListener('yoopta:remove', handleEditorEvent as EventListener);
      editorElement.addEventListener('yoopta:replace', handleEditorEvent as EventListener);
      editorElement.addEventListener('yoopta:replaceImage', handleEditorEvent as EventListener);
      // 監聽編輯器命令
      editorElement.addEventListener('yoopta:command', handleEditorCommand);
      
      // 監聽全局點擊事件來檢測替換操作
      const handleGlobalClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target && target.closest('[data-yoopta-action="replace"]')) {
        }
      };
      
      document.addEventListener('click', handleGlobalClick);
      
      // 開始觀察 DOM 變化
      observer.observe(editorElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
        attributeOldValue: true
      });
      
      return () => {
        // 這裡需要將事件處理函數的簽名調整為標準 EventListener
        // 並且 removeEventListener 的第二個參數必須與 addEventListener 完全一致
        editorElement.removeEventListener('yoopta:delete', handleEditorEvent as EventListener);
        editorElement.removeEventListener('yoopta:remove', handleEditorEvent as EventListener);
        editorElement.removeEventListener('yoopta:replace', handleEditorEvent as EventListener);
        editorElement.removeEventListener('yoopta:replaceImage', handleEditorEvent as EventListener);
        editorElement.removeEventListener('yoopta:command', handleEditorCommand as EventListener);
        document.removeEventListener('click', handleGlobalClick);
        observer.disconnect();
      };
    }
  }, [selectionRef, editor, cleanupImageFromStorage]);

  // 將 editor.getPlainText 暴露給外部
  const handleChange = (val: YooptaContentValue) => {
    const plainText = editor.getPlainText(val);
    if (onChange) onChange(val, plainText);
  };

  return (
    <div
      ref={selectionRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'border rounded-md px-3 py-2 min-h-[180px] bg-white transition-all duration-150 w-full',
        // 只在非只讀模式下顯示 focus 邊框
        !readOnly && 'focus-within:ring-2 focus-within:ring-blue-500',
        className
      )}
    >
      <div className="yoopta-full-width">
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          value={value}
          selectionBoxRoot={selectionRef}
          onChange={handleChange}
          readOnly={readOnly}
          autoFocus={autoFocus}
          data-readonly={readOnly ? "true" : "false"}
          placeholder={isComposing ? "" : "輸入 '/' 可呼叫神奇的工具"}
        />
      </div>
      <style jsx>{`
        .yoopta-full-width :global(.yoopta-editor),
        .yoopta-full-width :global([data-yoopta-element]),
        .yoopta-full-width :global(.yoopta-paragraph),
        .yoopta-full-width :global(.yoopta-heading),
        .yoopta-full-width :global(.yoopta-callout),
        .yoopta-full-width :global(.yoopta-list),
        .yoopta-full-width :global(.yoopta-code),
        .yoopta-full-width :global(.yoopta-image),
        .yoopta-full-width :global(.yoopta-link),
        .yoopta-full-width :global(.yoopta-embed) {
          max-width: none !important;
          width: 100% !important;
        }
        
        /* 只讀模式下禁用編輯器的 focus 樣式 */
        .yoopta-full-width :global(.yoopta-editor[data-readonly="true"]) {
          outline: none !important;
        }
        
        .yoopta-full-width :global(.yoopta-editor[data-readonly="true"]:focus) {
          outline: none !important;
          box-shadow: none !important;
        }
        
        .yoopta-full-width :global(.yoopta-editor[data-readonly="true"]:focus-within) {
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* 只讀模式下禁用所有編輯器元素的 focus 樣式 */
        .yoopta-full-width :global([data-readonly="true"] [data-yoopta-element]:focus) {
          outline: none !important;
          box-shadow: none !important;
        }
        
        .yoopta-full-width :global([data-readonly="true"] [data-yoopta-element]:focus-within) {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
});

PostEditor.displayName = 'PostEditor';