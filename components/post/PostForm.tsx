'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { PlusIcon } from "lucide-react"
import { debounce } from 'lodash'
import { CheckCircle, XCircle, Loader2, HelpCircle, ArrowLeft, Edit3 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCategoryContext } from "./context"
import { generateFileName } from "@/lib/utils";
import { PostImageUploader } from "./PostImageUploader";
import { YooptaContentValue } from '@yoopta/editor';
import { PostEditorRef } from "./PostEditor";
import dynamic from 'next/dynamic';

const PostEditor = dynamic(() => import('./PostEditor').then(mod => mod.PostEditor), { 
  ssr: false, 
  loading: () => <p>Loading...</p> 
});

interface PostFormProps {
  mode: 'new' | 'edit';
  postId?: string;
}

type Category = {
  id: number
  name: string
}

type SubCategory = {
  id: number
  name: string
  categoryId: number
}

type Tag = {
  id: string
  name: string
}

const PostForm = ({ mode, postId }: PostFormProps) => {
    const router = useRouter()
    // 新增一個狀態變數來追蹤是否資料已載入完成
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [allCategories, setAllCategories] = useState<Category[]>([]) // 新增：儲存所有主題
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]) // 新增：儲存過濾後的主題
    const [subCategories, setSubCategories] = useState<SubCategory[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
    const [oldCoverImageUrl, setOldCoverImageUrl] = useState<string | undefined>(undefined);
    const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
    const [newlyAddedCategoryId, setNewlyAddedCategoryId] = useState<number | null>(null);
    const [newlyAddedSubCategoryId, setNewlyAddedSubCategoryId] = useState<number | null>(null);

    const { 
      newCategoryId, 
      setNewCategoryId, 
      newSubCategoryId, 
      setNewSubCategoryId,
      newTagId: contextNewTagId, 
      setNewTagId: contextSetNewTagId 
    } = useCategoryContext()

    const selectionRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
    const postEditorRef = useRef<PostEditorRef>(null);
    const [editorValue, setEditorValue] = useState<YooptaContentValue | undefined>(undefined);

    // PostEditor 的 onChange 處理函數，自動同步 plainText 到 form
    const handleEditorChange = (value: YooptaContentValue, plainText: string) => {
      setEditorValue(value);
      form.setValue('content', plainText);
      form.trigger('content');
    };

    const formSchema = z.object({
      title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字元"),
      slug: z.string().min(1, "Slug不能為空").max(300, "Slug不能超過300個字元").optional(),
      slugStatus: z.enum(["success", "error", "validating"]).optional(),
      categoryId: z.number().optional().nullable()
        .refine(val => val != null && val > 0, {
          message: "請選擇主題"
        }),
      subCategoryId: z.number().optional().nullable(),
      tagIds: z.array(z.number()).optional().default([]),
      content: z.string().min(1, "內容不能為空"),
      isPublished: z.boolean().default(false),
      coverImageUrl: z.string().nullable().optional(),
    }).superRefine((data, ctx) => {
      // Cover image is required in both new and edit modes
      if (!data.coverImageUrl || data.coverImageUrl.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coverImageUrl'],
          message: "請提供有效的圖片（base64 或 URL）",
        });
      } else {
        // If cover image exists, it must be a valid format
        const isValidFormat = /^data:image\/[a-zA-Z]+;base64,/.test(data.coverImageUrl) || /^https?:\/\/.+/.test(data.coverImageUrl);
        if (!isValidFormat) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['coverImageUrl'],
            message: "圖片格式不正確，請提供有效的 base64 或 URL",
          });
        }
      }
    });

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
        slug: "",
        slugStatus: undefined,
        content: "",
        categoryId: null,
        subCategoryId: null,
        tagIds: [],
        isPublished: false,
        coverImageUrl: "",
      },
    })

    // 載入主題和標籤列表
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const response = await fetch('/api/initial-data');
          if (!response.ok) throw new Error('獲取初始數據失敗');
          const data = await response.json();
          
          setAllCategories(data.data.categories); // 儲存所有主題
          setTags(data.data.tags);

          if (mode === 'edit' && postId) {
            const postResponse = await fetch(`/api/posts/${postId}`);
            if (!postResponse.ok) throw new Error('獲取文章詳情失敗');
            const postData = await postResponse.json();
            const post = postData.data;

            form.setValue('title', post.title);
            form.setValue('slug', post.slug);
            form.setValue('slugStatus', post.slugStatus);
            form.setValue('categoryId', post.categoryId);
            form.setValue('tagIds', post.tags.map((tag: Tag) => tag.id));
            form.setValue('isPublished', post.published);
            form.setValue('coverImageUrl', post.coverImageUrl || "");
            setOldCoverImageUrl(post.coverImageUrl || undefined);
            
            // 設置編輯器內容
            if (post?.content) {
              setEditorValue(post.content);
            }

            // 在編輯模式下，先載入子主題，然後設置子主題值
            if (post.categoryId) {
              await handleCategoryChange(post.categoryId, true, post.subcategoryId);
            }
          }

          setIsDataLoaded(true); // 資料載入完成
        } catch {
          toast.error('獲取初始數據失敗');
        }
      };

      fetchInitialData();
    }, []);

    // 當 allCategories 或 mode 變化時，更新過濾後的主題列表
    useEffect(() => {
      let categoriesToFilter = [...allCategories];

      if (mode === 'new') {
        categoriesToFilter = categoriesToFilter.filter(cat => cat.name !== '未分類');
      }

      // 檢查是否有其他主題，如果沒有，則即使在 new mode 也顯示「未分類」
      if (mode === 'new' && categoriesToFilter.length === 0 && allCategories.length > 0) {
        categoriesToFilter = [...allCategories];
      }

      setFilteredCategories([{ id: -1, name: '請選擇主題' }, ...categoriesToFilter]);
    }, [allCategories, mode]);
  
    // 當主題改變時載入對應的子主題
    const handleCategoryChange = useCallback(async (categoryId: number | null, isEditMode = false, initialSubCategoryId?: number | null) => {
      if (!categoryId) {
        setSubCategories([])
        form.setValue('subCategoryId', null)
        setIsLoadingSubCategories(false)
        return
      }
  
      setIsLoadingSubCategories(true)
      try {
        const response = await fetch(`/api/categories/${categoryId}/sub-categories?all=true`)
        if (!response.ok) throw new Error('載入子主題失敗')
        const data = await response.json()
        setSubCategories(data.data || [])
        
        if (!isEditMode || !initialSubCategoryId) {
          form.setValue('subCategoryId', null)
        } else {
          form.setValue('subCategoryId', initialSubCategoryId)
        }
      } catch (error) {
        console.error('載入子主題失敗:', error)
        toast.error('載入子主題失敗')
        setSubCategories([])
        form.setValue('subCategoryId', null)
      } finally {
        setIsLoadingSubCategories(false)
      }
    }, [form])

    // 處理新增的主題
    useEffect(() => {
      if (newCategoryId) {
        const fetchNewCategory = async () => {
          try {
            const response = await fetch(`/api/categories/${newCategoryId}`);
            if (!response.ok) throw new Error('獲取主題詳情失敗');
            const data = await response.json();
            const newCategory = data.data;

            setAllCategories((prev) => {
              if (!prev.some((cat) => cat.id === newCategory.id)) {
                return [...prev, newCategory];
              }
              return prev;
            });

            // 設定觸發器，讓另一個 useEffect 去更新表單
            setNewlyAddedCategoryId(newCategory.id);

          } catch (error) {
            console.error('處理新主題失敗:', error);
            toast.error('處理新主題失敗');
          } finally {
            // 清除來自 context 的觸發器
            setNewCategoryId(null);
          }
        };
        fetchNewCategory();
      }
    }, [newCategoryId, setNewCategoryId]);
  
    // 處理新增的子主題
    useEffect(() => {
      if (newSubCategoryId) {
        const fetchNewSubCategory = async () => {
          try {
            const response = await fetch(`/api/sub-categories/${newSubCategoryId}`);
            if (!response.ok) throw new Error('獲取子主題詳情失敗');
            const data = await response.json();
            const newSubCategory = data.data;

            setSubCategories((prev) => {
              if (!prev.some((sub) => sub.id === newSubCategory.id)) {
                return [...prev, newSubCategory];
              }
              return prev;
            });

            setNewlyAddedSubCategoryId(newSubCategory.id);

          } catch (error) {
            console.error('獲取新子主題詳情失敗:', error);
          } finally {
            setNewSubCategoryId(null);
          }
        };
        fetchNewSubCategory();
      }
    }, [newSubCategoryId, setNewSubCategoryId]);

    // 當新子主題被添加且出現在列表中時，更新表單
    useEffect(() => {
      if (newlyAddedSubCategoryId && subCategories.some(sub => sub.id === newlyAddedSubCategoryId)) {
        form.setValue('subCategoryId', newlyAddedSubCategoryId);
        form.trigger('subCategoryId'); // 觸發驗證
        setNewlyAddedSubCategoryId(null); // 重置觸發器
      }
    }, [newlyAddedSubCategoryId, subCategories, form]);

    // 當新主題被添加且出現在過濾後的列表中時，更新表單
    useEffect(() => {
      if (newlyAddedCategoryId && filteredCategories.some(cat => cat.id === newlyAddedCategoryId)) {
        form.setValue('categoryId', newlyAddedCategoryId);
        form.trigger('categoryId'); // 觸發驗證
        handleCategoryChange(newlyAddedCategoryId, false);
        setNewlyAddedCategoryId(null); // 重置觸發器
      }
    }, [newlyAddedCategoryId, filteredCategories, form, handleCategoryChange]);
    
    // 檢查是否有新的標籤ID
     
    useEffect(() => {
      console.log("從 Context 獲取的新標籤 ID:", contextNewTagId);
      
      if (contextNewTagId) {
        // 添加新標籤ID到表單
        const currentTagIds = form.getValues('tagIds') || []
        console.log("當前 tagIds:", currentTagIds);
        
        if (!currentTagIds.includes(contextNewTagId)) {
          const updatedTagIds = [...currentTagIds, contextNewTagId]
          console.log("更新後的 tagIds:", updatedTagIds);
          
          form.setValue('tagIds', updatedTagIds)
          
          // 確保新標籤在標籤列表中
          const fetchNewTag = async () => {
            try {
              const response = await fetch(`/api/tags/${contextNewTagId}`)
              if (!response.ok) throw new Error('獲取標籤詳情失敗')
              const data = await response.json()
              
              // 如果標籤不在列表中，添加到列表中
              if (!tags.some(tag => tag.id === String(contextNewTagId))) {
                setTags(prevTags => [...prevTags, data.data])
              }
            } catch (error) {
              console.error('獲取新標籤詳情失敗:', error)
            }
          }
          
          fetchNewTag()
        }
        
        // 清除 Context 中的新標籤 ID
        contextSetNewTagId(null);
      }
    }, [form, tags, contextNewTagId, contextSetNewTagId])

    // 控制沈浸式編輯
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isEditorFullscreen) {
          setIsEditorFullscreen(false);
        }
        // 新增 Ctrl/Cmd + E 快捷鍵進入沈浸式編輯
        if ((event.ctrlKey || event.metaKey) && event.key === "e" && !isEditorFullscreen) {
          event.preventDefault();
          setIsEditorFullscreen(true);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [isEditorFullscreen]);

    // 驗證 Slug 是否重複
    const validateSlug = useCallback(debounce(async (slug: string) => {
      try {
        if (!slug) {
          form.setValue('slug', ''); // 清空 slug
          form.setValue('slugStatus', undefined);
          return;
        }
    
        let apiUrl = `/api/posts/validate-slug?slug=${slug}`;
    
        // 如果是編輯模式，排除當前文章的 slug
        if (mode === 'edit' && postId) {
          apiUrl += `&excludePostId=${postId}`;
        }
    
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('驗證 Slug 失敗');
        const data = await response.json();
    
        if (data.exists) {
          form.setError('slug', {
            type: 'manual',
            message: '此 Slug 已存在',
          });
          form.setValue('slugStatus', 'error');
        } else {
          form.clearErrors('slug');
          form.setValue('slugStatus', 'success');
        }
      } catch (error) {
        console.log('驗證 Slug 失敗', error);
        toast.error('驗證 Slug 失敗');
        form.setValue('slugStatus', 'error');
      }
    }, 700), [form, mode, postId]);

    // 根據標題自動生成 Slug
    const handleTitleChange = useCallback(debounce(async (title: string) => {
      if (!title) {
        form.setValue('slug', ''); // 清空 slug
        form.setValue('slugStatus', undefined); // 清空狀態
        return;
      }

      try {
        const response = await fetch(`/api/posts/generate-slug?title=${title}`);
        if (!response.ok) throw new Error('生成 Slug 失敗');
        const data = await response.json();
        const slug = data.slug;

        form.setValue('slug', slug);
        form.setValue('slugStatus', 'validating'); // 設置為驗證中狀態
        validateSlug(slug);
      } catch (error) {
        console.error('生成 Slug 失敗:', error);
        toast.error('生成 Slug 失敗');
      }
    }, 500), [form, validateSlug]);
  
    // 新增主題
    const handleAddCategory = () => {
      if (mode === 'edit') {
        router.push(`/posts/${postId}/new/category`, { scroll: false })
        return
      }
      router.push('/posts/new/category', { scroll: false })
    }
  
    // 新增子主題
    const handleAddSubCategory = () => {
      const categoryId = form.getValues('categoryId')
      if (!categoryId) {
        toast.error('請先選擇主題')
        return
      }
      if (mode === 'edit') {
        router.push(`/posts/${postId}/new/sub-category?categoryId=${categoryId}`, { scroll: false })
        return
      }
      router.push(`/posts/new/sub-category?categoryId=${categoryId}`, { scroll: false })
    }

    // 上傳圖片到 Supabase Storage
    async function uploadImageToSupabase(base64: string, fileName: string) {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const file = new File([u8arr], fileName, { type: mime });
      const { error } = await supabase.storage
        .from('post-cover-images')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from('post-cover-images')
        .getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }
    // 刪除 Supabase Storage 圖片
    async function deleteImageFromSupabase(url: string) {
      try {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1];
        await supabase.storage.from('post-cover-images').remove([fileName]);
      } catch (error) {
        console.log('刪除圖片失敗', error);
      }
    }

    // 儲存前格式轉換
    const onSubmit = async (values: FormValues) => {      
      console.log('onSubmit values:', values);
      console.log(values.slugStatus);   
      
      if (form.getFieldState('slugStatus').isDirty && values.slugStatus !== "success") {
        form.setError("slug", {
          type: "manual",
          message: "此 Slug 已存在",
        });
        return;
      }
    
      console.log(values);
    
      setIsSubmitting(true);
    
      try {
        let coverImageUrl = values.coverImageUrl;
        // 新增或有更換圖片時（base64）
        if (coverImageUrl && coverImageUrl.startsWith('data:image/')) {
          const fileName = generateFileName();
          coverImageUrl = await uploadImageToSupabase(coverImageUrl, fileName);
          if (!coverImageUrl) throw new Error('圖片上傳失敗');
        }

        const editorContent = postEditorRef.current?.getEditorValue();

        if (mode === "new") {
          // 新增文章
          const response = await fetch("/api/posts/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              content: editorContent,
              contentText: values.content, // 將純文字內容傳送給後端
              coverImageUrl
            }),
          });
          if (!response.ok) throw new Error("新增文章失敗");
          toast.success("文章新增成功");
        } else if (mode === "edit" && postId) {
          // 編輯文章
          const response = await fetch(`/api/posts/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              content: editorContent,
              contentText: values.content, // 將純文字內容傳送給後端
              coverImageUrl
            }),
          });
          if (!response.ok) throw new Error("編輯文章失敗");
          // 若有舊圖片且有更換，刪除舊圖片
          if (oldCoverImageUrl && oldCoverImageUrl !== coverImageUrl) {
            await deleteImageFromSupabase(oldCoverImageUrl);
          }
          toast.success("文章編輯成功");
        }
    
        router.push(`/posts`);
        router.refresh();
      } catch (error) {
        console.log('儲存前格式轉換失敗', error);
        toast.error(error instanceof Error ? error.message : "新增文章失敗");
      } finally {
        setIsSubmitting(false);
      }
    }

    // 載入資料Loading Spin
    if (!isDataLoaded) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-600">資料載入中，請稍候...</p>
          </div>
        </div>
      );
    }

    // 沈浸式編輯模式
    if (isEditorFullscreen) {
      return (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            {/* 沈浸式編輯器頂部工具列 */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  文章內容
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditorFullscreen(false);
                  }}
                  title={`按 Esc 鍵可快速退出`}
                >
                  退出沈浸式編輯
                </Button>
              </div>
            </div>

            {/* 沈浸式編輯器內容區域 */}
            <div className="flex-1 overflow-auto mb-6">
              <div className="h-full w-full mx-auto p-6">
                <div className="min-h-full">
                  <PostEditor
                    ref={postEditorRef}
                    value={editorValue}
                    onChange={handleEditorChange}
                    selectionBoxRoot={selectionRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container w-full">
        <div className="min-h-[500px] w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
              <h1 className="text-2xl font-bold">{mode === 'new' ? '新增文章' : '編輯文章'}</h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>標題</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="請輸入文章標題"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value); // 立即更新表單值
                              handleTitleChange(e.target.value); // 觸發 debounced 函數
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="請輸入文章 Slug"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value === "") {
                                form.setValue('slugStatus', undefined); // 清空狀態
                              } else {
                                form.setValue('slugStatus', 'validating'); // 設置為驗證中狀態
                                validateSlug(e.target.value);
                              }
                              form.trigger("slug"); // 手動觸發驗證
                            }}
                            onBlur={() => {
                              if (field.value === '') {
                                form.setValue('slugStatus', undefined); // 清空狀態
                              } else {
                                validateSlug(field.value || '');
                              }
                            }}
                            endIcon={
                              <>
                                {(form.getValues('slugStatus') === undefined) && (
                                  <HelpCircle className="h-5 w-5 text-gray-500" />
                                )}
                                {form.getValues('slugStatus') === 'success' && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {form.getValues('slugStatus') === 'error' && (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                {form.getValues('slugStatus') === 'validating' && (
                                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                )}
                              </>
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 文章封面圖片上傳/AI生成 */}
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        {/* 第一排：標籤和移除按鈕 */}
                        <div className="flex justify-between items-center h-9">
                          <FormLabel>文章封面圖片</FormLabel>
                          {field.value && (
                            <Button 
                              variant="destructive" 
                              onClick={() => field.onChange(null)} 
                              type="button" 
                              disabled={isSubmitting}
                            >
                              移除圖片
                            </Button>
                          )}
                        </div>
                        
                        {/* 第二排：預覽圖片 */}
                        <PostImageUploader
                            value={field.value ?? undefined}
                            onChange={(url, _file) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                              field.onChange(url);
                              // 若需處理 file 上傳，請在 onSubmit 處理
                            }}
                            disabled={isSubmitting}
                            showPreviewOnly={true}
                          />
                        
                        {/* 第三排：選擇上傳圖片 */}
                        <div>
                          <PostImageUploader
                            value={field.value ?? undefined}
                            onChange={(url, _file) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                              field.onChange(url);
                              // 若需處理 file 上傳，請在 onSubmit 處理
                            }}
                            disabled={isSubmitting}
                            showUploadOnly={true}
                          />
                        </div>
                        
                        {/* 第四排：AI生成的文字prompt和按鈕 */}
                        <div className="w-full">
                          <PostImageUploader
                            value={field.value ?? undefined}
                            onChange={(url, _file) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                              field.onChange(url);
                              // 若需處理 file 上傳，請在 onSubmit 處理
                            }}
                            disabled={isSubmitting}
                            showAIGenerateOnly={true}
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>主題</FormLabel>
                        <div className="flex gap-2 items-center">
                          <Select
                            onValueChange={(value) => {
                              const numericValue = Number(value);
                              if (numericValue === -1) {
                                form.setValue('categoryId', null, { shouldValidate: true });
                                form.setValue('subCategoryId', null);
                                setSubCategories([]);
                              } else {
                                form.setValue('categoryId', numericValue, { shouldValidate: true });
                                form.setValue('subCategoryId', null);
                                handleCategoryChange(numericValue, false);
                              }
                            }}
                            value={field.value?.toString() ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full" ref={field.ref}>
                                <SelectValue placeholder="請選擇主題" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                              {filteredCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddCategory}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>子主題</FormLabel>
                        <div className="flex gap-2 items-center">
                          <Select
                            onValueChange={(value) => {
                              if (value === 'reset') {
                                form.setValue('subCategoryId', null)
                                return
                              }
                              const selectedSubCategory = subCategories.find(subCat => subCat.id.toString() === value)
                              form.setValue('subCategoryId', selectedSubCategory?.id || null)
                            }}
                            value={field.value?.toString() ?? ""}
                            disabled={!form.watch('categoryId') || isLoadingSubCategories}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full" disabled={subCategories?.length === 0 || isLoadingSubCategories}>
                                <SelectValue
                                  placeholder={
                                    isLoadingSubCategories 
                                      ? "載入中..." 
                                      : !form.watch('categoryId') 
                                        ? "請先選擇主題" 
                                        : (subCategories?.length === 0 ? "無可用的子主題" : "請選擇子主題")
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                              {isLoadingSubCategories ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    載入中...
                                  </div>
                                </SelectItem>
                              ) : subCategories?.length === 0 ? (
                                <SelectItem value="no-data" disabled>
                                  無可用的子主題
                                </SelectItem>
                              ) : (
                                <>
                                  <SelectItem key={0} value="reset">
                                    請選擇子主題
                                  </SelectItem>
                                  {subCategories && subCategories.map((subCategory) => (
                                    <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                                      {subCategory.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddSubCategory}
                            disabled={!form.watch('categoryId') || isLoadingSubCategories}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>標籤</FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl>
                          <MultiSelect
                            placeholder="請選擇標籤"
                            options={tags.map(tag => ({
                              label: tag.name,
                              value: String(tag.id)
                            }))}
                            selected={field.value ? field.value.map(String) : []}
                            onChange={(value) => {
                              // 將字串ID轉換為數字
                              const numericValues = value.map(Number)
                              field.onChange(numericValues)
                              form.trigger('tagIds')
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (mode === 'edit') {
                              router.push(`/posts/${postId}/new/tag`, { scroll: false })
                            } else if (mode === 'new') {
                              router.push('/posts/new/tag', { scroll: false })
                            }
                          }}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 內容編輯器 */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field: _field }) => ( // eslint-disable-line @typescript-eslint/no-unused-vars
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel>內容</FormLabel>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                          onClick={() => setIsEditorFullscreen(true)}
                          title={`進入沈浸式編輯模式 (${navigator.userAgent.includes('Mac') ? '⌘+E' : 'Ctrl+E'})`}
                        >
                          <Edit3 className="h-3 w-3" />
                          沈浸式編輯
                        </button>
                      </div>
                      <FormControl>
                        <PostEditor
                          ref={postEditorRef}
                          value={editorValue}
                          onChange={handleEditorChange}
                          selectionBoxRoot={selectionRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>發布狀態</FormLabel>
                        <div className="text-sm text-gray-500">
                          選擇是否要立即發布文章
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { 
                      console.log("當前表單值:", form.getValues()); 
                      router.back();
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (mode === 'new' ? '新增中...' : '更新中...') : (mode === 'new' ? '新增文章' : '更新文章')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    )
}

export default PostForm