'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'

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

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

export default function NewSubCategoryDialog() {
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      categoryId: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/sub-categories/new', {
        method: 'POST',
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
        throw new Error(result.error || '創建子主題失敗')
      }

      toast.success('子主題創建成功')
      queryClient.invalidateQueries({ queryKey: ['subCategories'] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '創建子主題失敗')
    }
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增子主題</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '建立中...' : '建立子主題'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 