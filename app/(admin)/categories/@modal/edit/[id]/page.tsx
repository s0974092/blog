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
import { Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { use } from 'react'

const formSchema = z.object({
  name: z
    .string()
    .min(1, '主題名稱不能為空')
    .max(20, '主題名稱不能超過 20 個字符'),
})

interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface CategoryResponse {
  success: boolean
  data: Category
}

type Params = {
  id: string
}

export default function EditCategoryDialog({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: categoryResponse, isLoading } = useQuery<CategoryResponse>({
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${id}`)
      if (!res.ok) {
        throw new Error('獲取主題信息失敗')
      }
      return res.json()
    },
    enabled: !!id,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryResponse?.data.name || '',
    },
    values: {
      name: categoryResponse?.data.name || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '更新主題失敗')
      }

      toast.success('主題更新成功')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新主題失敗')
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
          <DialogTitle>編輯主題</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主題名稱</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="請輸入主題名稱" />
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