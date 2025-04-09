'use client'

import { useEffect } from 'react'
import { use } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const schema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(50, '標籤名稱不能超過50個字元'),
})

type FormData = z.infer<typeof schema>

type Params = {
  id: string
}

export default function EditTagModal({ params }: { params: Promise<Params> }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = use(params)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(`/api/tags/${id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || '取得標籤失敗')
        }

        reset({ name: result.data.name })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '取得標籤失敗')
        router.back()
      }
    }

    fetchTag()
  }, [id, reset, router])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '更新標籤失敗')
      }

      toast.success('標籤更新成功')
      await queryClient.invalidateQueries({ queryKey: ['tags'] })
      await queryClient.invalidateQueries({ queryKey: ['tagCounts'] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新標籤失敗')
    }
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯標籤</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">標籤名稱</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="請輸入標籤名稱"
                className={errors.name ? 'border-red-500' : ''}
                autoFocus
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.back()}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新標籤'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 