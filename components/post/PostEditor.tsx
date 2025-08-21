import React, { forwardRef, useImperativeHandle, useMemo, useRef, useEffect, useState } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue, YooptaPlugin, SlateElement } from '@yoopta/editor';
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
import Table from '@yoopta/table';

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
  Table,
] as const;

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
}

export interface PostEditorRef {
  getPlainText: (yooptaValue: YooptaContentValue) => string;
  getEditorValue: () => YooptaContentValue | undefined;
  getRemarkdownValue?: () => string | undefined;
  getHTMLValue?: () => string | undefined;
}

export const PostEditor = forwardRef<PostEditorRef, PostEditorProps>((
  {
    value,
    onChange,
    readOnly = false,
    autoFocus = false,
    className = '',
    selectionBoxRoot,
  },
  ref
) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const localSelectionRef = useRef(null);
  const selectionRef = selectionBoxRoot || localSelectionRef;
  const isInitialized = useRef(false);
  const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    const editorElement = selectionRef.current;
    if (!editorElement) return;

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isComposing) {
        event.stopPropagation();
      }
    };

    editorElement.addEventListener('compositionstart', handleCompositionStart);
    editorElement.addEventListener('compositionend', handleCompositionEnd);
    editorElement.addEventListener('keydown', handleKeyDown, true);

    return () => {
      editorElement.removeEventListener('compositionstart', handleCompositionStart);
      editorElement.removeEventListener('compositionend', handleCompositionEnd);
      editorElement.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [selectionRef, isComposing]);

  useImperativeHandle(ref, () => ({
    getPlainText: (yooptaValue: YooptaContentValue) => editor.getPlainText(yooptaValue),
    getEditorValue: () => editor.getEditorValue(),
    getRemarkdownValue: () => editor.getMarkdown(editor.getEditorValue()),
    getHTMLValue: () => editor.getHTML(editor.getEditorValue()),
    getImages: (): string[] => {
      const content = editor.getEditorValue();
      if (!content) return [];

      const imageUrls: string[] = [];
      const traverseNodes = (nodes: unknown[]) => {
        for (const node of nodes) {
          if (typeof node === 'object' && node !== null) {
            const typedNode = node as { type?: string; props?: { src?: string }; children?: unknown[] };
            if (typedNode.type === 'image' && typedNode.props?.src) {
              imageUrls.push(typedNode.props.src);
            }
            if (typedNode.children && typedNode.children.length > 0) {
              traverseNodes(typedNode.children);
            }
          }
        }
      };
      
      traverseNodes(Object.values(content).flat() as unknown[]);
      return imageUrls;
    },
  }), [editor]);

  useEffect(() => {
    if (value && onChange && !isInitialized.current) {
      const plainText = editor.getPlainText(value);
      onChange(value, plainText);
      isInitialized.current = true;
    }
  }, [value, onChange, editor]);

  const handleChange = (val: YooptaContentValue) => {
    const plainText = editor.getPlainText(val);
    if (onChange) onChange(val, plainText);
  };

  return (
    <div
      ref={selectionRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'border rounded-md px-3 py-2 min-h-[180px] bg-white transition-all duration-150 w-full',
        !readOnly && 'focus-within:ring-2 focus-within:ring-blue-500',
        className
      )}
    >
      <div className="yoopta-full-width">
        <YooptaEditor
          editor={editor}
          plugins={plugins as readonly YooptaPlugin<Record<string, SlateElement>, Record<string, unknown>>[]}   
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
        
        .yoopta-full-width :global([data-readonly="true"] [data-yoopta-element]:focus) {
          outline: none !important;
          box-shadow: none !important;
        }
        
        .yoopta-full-width :global([data-readonly="true"] [data-yoopta-element]:focus-within) {
          outline: none !important;
          box-shadow: none !important;
        }

        .yoopta-full-width :global(.yoopta-table th),
        .yoopta-full-width :global(.yoopta-table td) {
          border: 1px solid #E5E7EB; /* gray-200 */
          padding: 0.75rem;
          background-color: white;
        }
        .yoopta-full-width :global(.yoopta-table th) {
          background-color: #F3F4F6; /* gray-100 */
        }
      `}</style>
    </div>
  );
});

PostEditor.displayName = 'PostEditor';
