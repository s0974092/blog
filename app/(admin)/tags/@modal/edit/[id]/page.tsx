'use client'

import { use } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(20, '標籤名稱不能超過20個字元'),
})

type Params = {
  id: string
}

interface Tag {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface TagResponse {
  success: boolean
  data: Tag
}

export default function EditTagDialog({ params }: { params: Promise<Params> }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = use(params)

  const { data: tagResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['tag', id],
    queryFn: async () => {
      const res = await fetch(`/api/tags/${id}`)
      if (!res.ok) {
        throw new Error('獲取標籤信息失敗')
      }
      return res.json()
    },
    enabled: !!id,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tagResponse?.data.name || '',
    },
    values: {
      name: tagResponse?.data.name || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '更新標籤失敗')
      }

      toast.success('標籤更新成功')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tag', id] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新標籤失敗')
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
          <DialogTitle>編輯標籤</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標籤名稱</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="請輸入標籤名稱" />
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