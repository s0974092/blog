'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import { use } from 'react'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  name: z
    .string()
    .min(1, '子主題名稱不能為空')
    .max(20, '子主題名稱不能超過 20 個字符'),
  categoryId: z
    .string()
    .min(1, '請選擇所屬主題')
})

interface Category {
  id: number
  name: string
}

interface SubCategory {
  id: number
  name: string
  categoryId: number
  category: Category
}

interface SubCategoryResponse {
  success: boolean
  data: SubCategory
}

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

type Params = {
  id: string
}

export default function EditSubCategoryModal({ params: paramsPromise }: { params: Promise<Params> }) {
  const { id } = use(paramsPromise)
  const router = useRouter()
  const queryClient = useQueryClient()

  // 獲取主題列表
  const { data: categoriesResponse } = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) {
        throw new Error('獲取主題列表失敗')
      }
      return res.json()
    },
  })

  // 獲取子主題資料
  const { data: subCategoryResponse, isLoading } = useQuery<SubCategoryResponse>({
    queryKey: ['subCategory', id],
    queryFn: async () => {
      const res = await fetch(`/api/sub-categories/${id}`)
      if (!res.ok) {
        throw new Error('獲取子主題資料失敗')
      }
      return res.json()
    },
    enabled: !!id,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subCategoryResponse?.data.name || '',
      categoryId: subCategoryResponse?.data.categoryId.toString() || '',
    },
    values: {
      name: subCategoryResponse?.data.name || '',
      categoryId: subCategoryResponse?.data.categoryId.toString() || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`/api/sub-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          categoryId: parseInt(values.categoryId),
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '更新子主題失敗')
      }

      toast.success('子主題更新成功')
      queryClient.invalidateQueries({ queryKey: ['subCategories'] })
      queryClient.invalidateQueries({ queryKey: ['subCategory', id] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新子主題失敗')
    }
  }

  if (isLoading) {
    return (
      <Dialog open onOpenChange={() => router.back()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>載入中</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯子主題</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所屬主題</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇主題" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesResponse?.data.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>子主題名稱</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="請輸入子主題名稱" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? '更新中...' : '更新'}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 