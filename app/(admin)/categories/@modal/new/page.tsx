'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  name: z
    .string()
    .min(1, '主題名稱不能為空')
    .max(50, '主題名稱不能超過 50 個字符'),
})

type FormValues = z.infer<typeof formSchema>

export default function NewCategoryDialog() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/categories/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '創建主題失敗')
      }

      toast.success('主題創建成功')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '創建主題失敗')
    }
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增主題</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '建立中...' : '建立主題'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 