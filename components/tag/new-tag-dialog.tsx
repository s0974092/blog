'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(20, '標籤名稱不能超過20個字元'),
})

type FormValues = z.infer<typeof formSchema>

interface NewTagDialogProps {
  onTagCreated?: (tagId: number) => void
}

export default function NewTagDialog({ onTagCreated }: NewTagDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/tags/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '建立標籤失敗')
      }

      const data = await response.json()
      toast.success('標籤建立成功')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      
      if (onTagCreated) {
        onTagCreated(data.data.id)
      }
      
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '建立中...' : '建立標籤'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 