'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'

const schema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(50, '標籤名稱不能超過50個字元'),
})

type FormData = z.infer<typeof schema>

export default function NewTagDialog() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || '建立標籤失敗')
      }

      toast.success('標籤建立成功')
      await queryClient.invalidateQueries({ queryKey: ['tags'] })
      router.back()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '建立標籤失敗')
    }
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新標籤</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="cursor-pointer"
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? '建立中...' : '建立標籤'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 