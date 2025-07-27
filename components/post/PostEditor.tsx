import React, { forwardRef, useImperativeHandle, useMemo, useRef, useEffect } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import Paragraph from '@yoopta/paragraph';
import Link from '@yoopta/link';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Code from '@yoopta/code';
import Callout from '@yoopta/callout';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import { cn } from '@/lib/utils';

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Link,
  Code,
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

  useImperativeHandle(ref, () => ({
    getPlainText: (yooptaValue: YooptaContentValue) => editor.getPlainText(yooptaValue),
    getEditorValue: () => editor.getEditorValue(),
		getRemarkdownValue: () => editor.getMarkdown(editor.getEditorValue()),
		getHTMLValue: () => editor.getHTML(editor.getEditorValue()),
  }), [editor]);

  // 當 value 初始化時自動調用 onChange
  useEffect(() => {
    if (value && onChange && !isInitialized.current) {
      const plainText = editor.getPlainText(value);
      onChange(value, plainText);
      isInitialized.current = true;
    }
  }, [value, onChange, editor]);

  // 將 editor.getPlainText 暴露給外部
  const handleChange = (val: YooptaContentValue) => {
    const plainText = editor.getPlainText(val);
    if (onChange) onChange(val, plainText);
  };

  return (
    <div
      ref={selectionRef as any}
      className={cn(
        'border rounded-md px-3 py-2 min-h-[180px] bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-150',
        className
      )}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        value={value}
        selectionBoxRoot={selectionRef}
        onChange={handleChange}
        readOnly={readOnly}
        autoFocus={autoFocus}
      />
    </div>
  );
});
