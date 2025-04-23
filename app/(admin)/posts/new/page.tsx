'use client'

import { useState, useEffect, useRef, SetStateAction, RefObject } from "react"
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
import { useCategoryContext } from './context'
import { debounce } from 'lodash'
import pinyin from "pinyin"
import { CheckCircle, XCircle, Loader2, HelpCircle } from "lucide-react"
import { sub } from "date-fns"
import dynamic from 'next/dynamic';
import '@toast-ui/editor/dist/toastui-editor.css';
import _ from "lodash"
import { supabase } from "@/lib/supabase"

const ToastEditor = dynamic(() => import('@toast-ui/react-editor').then(mod => mod.Editor), { ssr: false })

// 將類型定義移到頂部
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

const formSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字元"),
  slug: z.string().min(1, "Slug不能為空").max(300, "Slug不能超過300個字元"),
  slugStatus: z.enum(["success", "error", "validating"]).optional(),
  categoryId: z.number().optional()
  .refine((val) => val !== undefined && val > 0, {
    message: "請選擇主題"
  }),
  subCategoryId: z.number().optional().nullable(),
  tagIds: z.array(z.number()).optional().default([]),
  content: z.string().min(1, "內容不能為空"),
  isPublished: z.boolean().default(false),
}).superRefine((values, ctx) => {
  if (values.slugStatus !== "success") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "此 Slug 已存在",
      path: ["slug"],
    })
  }

});

type FormValues = z.infer<typeof formSchema>

function handleEditorImageUpload(blob: string | Blob | ArrayBuffer | FormData | URLSearchParams | File | ArrayBufferView<ArrayBufferLike> | Buffer<ArrayBufferLike> | NodeJS.ReadableStream | ReadableStream<Uint8Array<ArrayBufferLike>>, callback: (arg0: string, arg1: string) => void, setOriginalImageNames: { (value: SetStateAction<string[]>): void; (arg0: (prevPaths: any) => any[]): void }) {
  return async () => {
    const fileName = `${Date.now()}-${generatePinyin((blob as File).name)}`;

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

      callback(publicUrlData.publicUrl, (blob as File).name);

      // 更新原始圖片路徑
      setOriginalImageNames((prevPaths) => [...prevPaths, fileName]);
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      toast.error('圖片上傳失敗');
    }
  };
}

// 處理圖片清除
function handleImageCleanup(editorRef: RefObject<any>, originalImageNames: any[], extractImagePaths: { (content: string | undefined): string[]; (arg0: any): any }) {
  return async () => {
    const editorInstance = editorRef.current?.getInstance();
    const markdownContent = editorInstance?.getMarkdown();
    const htmlContent = editorInstance?.getHTML();
    console.log("Markdown 內容:", markdownContent);
    console.log("HTML 內容:", htmlContent);

    const newImagePaths = extractImagePaths(markdownContent);
    console.log('originalImagePaths', originalImageNames);
    console.log('newImagePaths', newImagePaths);

    // 比對差異，找出需要刪除的圖片
    const imagesToDelete = originalImageNames.filter(
      (path) => !newImagePaths.includes(path)
    );
    console.log('imagesToDelete', imagesToDelete);

    // 批量刪除不需要的圖片
    if (imagesToDelete.length > 0) {
      try {
        const { error } = await supabase.storage
          .from('post-content-images')
          .remove(imagesToDelete);

        if (error) {
          console.error(`刪除批量圖片失敗: `, error);
        } else {
          console.log(`刪除批量圖片成功！`);
        }
      } catch (error) {
        console.error(`刪除圖片時發生錯誤: ${error}`);
      }
    } else {
      console.log('沒有需要刪除的圖片');
    }
  };
}

function generatePinyin(title: string) {
  return pinyin(title, {
    style: pinyin.STYLE_NORMAL, // 使用普通拼音樣式
  })
    .flat() // 將多維數組展平
    .join('-') // 使用連字符連接
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-') // 移除非字母、數字和連字符的字符
    .replace(/(^-|-$)/g, ''); // 移除開頭和結尾的連字符
}

export default function NewPost() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const editorRef = useRef<any>(null);
  const { 
    newCategoryId, 
    setNewCategoryId, 
    newSubCategoryId, 
    setNewSubCategoryId,
    newTagId: contextNewTagId, 
    setNewTagId: contextSetNewTagId 
  } = useCategoryContext()
  const [newlyAddedCategoryId, setNewlyAddedCategoryId] = useState<number | null>(null)
  const [newlyAddedSubCategoryId, setNewlyAddedSubCategoryId] = useState<number | null>(null)
  const [originalImageNames, setOriginalImageNames] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      slugStatus: undefined,
      content: "",
      categoryId: undefined,
      subCategoryId: null,
      tagIds: [],
      isPublished: false,
    },
  })

  useEffect(() => {
    // 初始化時從內容中提取圖片路徑
    const editorInstance = editorRef.current?.getInstance();
    const initialContent = editorInstance?.getMarkdown();
    const imagePaths = extractImagePaths(initialContent);
    setOriginalImageNames(imagePaths);
  }, []);

  const extractImagePaths = (content: string | undefined): string[] => {
    if (!content) return [];
    const regex = /!\[.*?\]\(.*?\/([^\/]+)\)/g; // 匹配 Markdown 圖片語法並提取文件名
    const paths: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      paths.push(match[1]); // 只提取文件名
    }
    return paths;
  };

  // 載入主題列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?all=true')
        if (!response.ok) throw new Error('載入主題失敗')
        const data = await response.json()
        setCategories(data.data.items)
      } catch (error) {
        toast.error('載入主題失敗')
      }
    }
    fetchCategories()
  }, [])

  // 載入標籤列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags?all=true')
        if (!response.ok) throw new Error('載入標籤失敗')
        const res = await response.json()
        setTags(res.data.items)
      } catch (error) {
        toast.error('載入標籤失敗')
      }
    }
    fetchTags()
  }, [])

  // 處理新增的主題
  useEffect(() => {
    if (newCategoryId) {
      const fetchNewCategory = async () => {
        try {
          const response = await fetch(`/api/categories/${newCategoryId}`)
          if (!response.ok) throw new Error('獲取主題詳情失敗')
          const data = await response.json()
          
          setCategories(prevCategories => {
            if (!prevCategories.some(cat => cat.id === newCategoryId)) {
              return [...prevCategories, data.data]
            }
            return prevCategories
          })
          
          // 設置要更新的主題ID
          setNewlyAddedCategoryId(newCategoryId)
        } catch (error) {
          console.error('獲取新主題詳情失敗:', error)
        }
      }
      
      fetchNewCategory()
      setNewCategoryId(null)
    }
  }, [newCategoryId])

  // 當 categories 更新後，設置表單值
  useEffect(() => {
    if (newlyAddedCategoryId && categories.some(cat => cat.id === newlyAddedCategoryId)) {
      form.setValue('categoryId', newlyAddedCategoryId)
      handleCategoryChange(newlyAddedCategoryId)
      setNewlyAddedCategoryId(null)
    }
  }, [categories, newlyAddedCategoryId, form])

  // 處理新增的子主題
  useEffect(() => {
    if (newSubCategoryId) {
      const fetchNewSubCategory = async () => {
        try {
          const response = await fetch(`/api/sub-categories/${newSubCategoryId}`)
          if (!response.ok) throw new Error('獲取子主題詳情失敗')
          const data = await response.json()
          
          setSubCategories(prevSubCategories => {
            if (!prevSubCategories.some(subCat => subCat.id === newSubCategoryId)) {
              return [...prevSubCategories, data.data]
            }
            return prevSubCategories
          })
          
          // 設置要更新的子主題ID
          setNewlyAddedSubCategoryId(newSubCategoryId)
        } catch (error) {
          console.error('獲取新子主題詳情失敗:', error)
        }
      }
      
      fetchNewSubCategory()
      setNewSubCategoryId(null)
    }
  }, [newSubCategoryId])

  // 當 subCategories 更新後，設置表單值
  useEffect(() => {
    if (newlyAddedSubCategoryId && subCategories.some(subCat => subCat.id === newlyAddedSubCategoryId)) {
      form.setValue('subCategoryId', newlyAddedSubCategoryId)
      setNewlyAddedSubCategoryId(null)
    }
  }, [subCategories, newlyAddedSubCategoryId, form])

  // 當主題改變時載入對應的子主題
  const handleCategoryChange = async (categoryId: number) => {
    if (!categoryId) {
      setSubCategories([])
      form.setValue('subCategoryId', undefined)
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}/sub-categories?all=true`)
      if (!response.ok) throw new Error('載入子主題失敗')
      const data = await response.json()
      console.log('子主題數據:', data)
      setSubCategories(data.data || [])  // 直接使用 data.data，因為 API 直接返回數組
      form.setValue('subCategoryId', undefined)
    } catch (error) {
      console.error('載入子主題失敗:', error)
      toast.error('載入子主題失敗')
      setSubCategories([])
    }
  }

  // 根據標題自動生成 Slug
  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!title) {
      form.setValue('slug', ''); // 清空 slug
      form.setValue('slugStatus', undefined); // 清空狀態
      return;
    }
    const slug = generatePinyin(title);

    form.setValue('slug', slug);
    form.setValue('slugStatus', 'validating'); // 設置為驗證中狀態
    validateSlug(slug);
  }

  // 驗證 Slug 是否重複
  const validateSlug = debounce(async (slug: string) => {
    try {
      if (!slug) {
        form.setValue('slug', ''); // 清空 slug
        form.setValue('slugStatus', undefined);
        return;
      }
      const response = await fetch(`/api/posts/validate-slug?slug=${slug}`);
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
      toast.error('驗證 Slug 失敗');
      form.setValue('slugStatus', 'error');
    }
  }, 700); // 設定 debounce 時間為 300 毫秒

  // 检查是否有新的标签ID
  useEffect(() => {
    console.log("從 Context 獲取的新標籤 ID:", contextNewTagId);
    
    if (contextNewTagId) {
      // 添加新标签ID到表单
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

  const onSubmit = async (values: FormValues) => {
    try {
      const cleanupImages = handleImageCleanup(editorRef, originalImageNames, extractImagePaths);
      await cleanupImages();

      console.log(values);
      
      setIsSubmitting(true)
      const response = await fetch("/api/posts/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("新增文章失敗")
      }

      toast.success("文章新增成功")
      router.push("/posts")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "新增文章失敗")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 新增主題
  const handleAddCategory = () => {
    router.push('/posts/new/category', { scroll: false })
  }

  // 新增子主題
  const handleAddSubCategory = () => {
    const categoryId = form.getValues('categoryId')
    if (!categoryId) {
      toast.error('請先選擇主題')
      return
    }
    router.push(`/posts/new/sub-category?categoryId=${categoryId}`, { scroll: false })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">新增文章</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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
                            handleTitleChange(e.target.value);
                            form.trigger("title"); // 手動觸發驗證
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
                        <div className="relative">
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
                          />
                          {(form.getValues('slugStatus') === undefined) && (
                            <HelpCircle className="absolute right-2 top-2 h-5 w-5 text-gray-500" />
                          )}
                          {form.getValues('slugStatus') === 'success' && (
                            <CheckCircle className="absolute right-2 top-2 h-5 w-5 text-green-500" />
                          )}
                          {form.getValues('slugStatus') === 'error' && (
                            <XCircle className="absolute right-2 top-2 h-5 w-5 text-red-500" />
                          )}
                          {form.getValues('slugStatus') === 'validating' && (
                            <Loader2 className="absolute right-2 top-2 h-5 w-5 text-blue-500 animate-spin" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                            if (value === 'reset') {
                              form.setValue('categoryId', undefined);
                              form.setValue('subCategoryId', undefined);
                              setSubCategories([]);
                            } else {
                              const selectedCategory = categories.find(cat => cat.id.toString() === value);
                              form.setValue('categoryId', selectedCategory?.id);
                              handleCategoryChange(Number(value));
                            }
                            form.trigger("categoryId"); // 手動觸發驗證
                          }}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full" ref={field.ref}>
                              <SelectValue placeholder="請選擇主題" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {categories.length > 0 && (
                              <SelectItem key={0} value="reset">
                                請選擇主題
                              </SelectItem>
                            )}
                            {categories.map((category) => (
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
                              form.setValue('subCategoryId', undefined)
                              return
                            }
                            const selectedSubCategory = subCategories.find(subCat => subCat.id.toString() === value)
                            form.setValue('subCategoryId', selectedSubCategory?.id || undefined)
                          }}
                          value={field.value?.toString() || ""}
                          disabled={!form.getValues('categoryId')}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full" disabled={subCategories.length === 0}>
                              <SelectValue
                                placeholder={
                                  !form.getValues('categoryId') 
                                    ? "請先選擇主題" 
                                    : (subCategories.length === 0 ? "無可用的子主題" : "請選擇子主題")
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {subCategories.length === 0 ? (
                              <SelectItem value="no-data" disabled>
                                無可用的子主題
                              </SelectItem>
                            ) : (
                              <>
                                <SelectItem key={0} value="reset">
                                  請選擇子主題
                                </SelectItem>
                                {subCategories.map((subCategory) => (
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
                          disabled={!form.getValues('categoryId')}
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
                            // 将字符串ID转换为数字
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
                          router.push('/posts/new/tag', { scroll: false })
                        }}
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>內容</FormLabel>
                    <FormControl>
                      <ToastEditor
                        ref={editorRef}
                        initialValue={field.value || ' '}
                        previewStyle="tab"
                        height="400px"
                        initialEditType="wysiwyg"
                        useCommandShortcut={true}
                        placeholder="請輸入文章內容"
                        onChange={() => {
                          const editorInstance = editorRef.current?.getInstance();
                          const markdownContent = editorInstance?.getMarkdown();
                          field.onChange(markdownContent);
                          form.trigger("content"); // 手動觸發驗證
                        }}
                        hooks={{
                          addImageBlobHook: async (blob: string | Blob | ArrayBuffer | FormData | URLSearchParams | File | ArrayBufferView<ArrayBufferLike> | Buffer<ArrayBufferLike> | NodeJS.ReadableStream | ReadableStream<Uint8Array<ArrayBufferLike>>, callback: (arg0: string, arg1: string) => void) => {
                            await handleEditorImageUpload(blob, callback, setOriginalImageNames)();
                          },
                        }}
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
                    console.log("当前表单值:", form.getValues()); 
                    router.back();
                  }}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "新增中..." : "新增文章"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}