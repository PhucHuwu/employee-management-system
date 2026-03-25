'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import type { Position } from '@/lib/types'
import { positionApi } from '@/lib/api/endpoints'

const positionSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên vị trí'),
  description: z.string().optional(),
})

type PositionFormData = z.infer<typeof positionSchema>

interface PositionFormProps {
  position?: Position | null
  onSuccess: () => void
  onCancel: () => void
}

export function PositionForm({ position, onSuccess, onCancel }: PositionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: position?.name || '',
      description: position?.description || '',
    },
  })

  const onSubmit = async (data: PositionFormData) => {
    setIsSubmitting(true)
    try {
      if (position) {
        await positionApi.update(position.id, data)
      } else {
        await positionApi.create(data)
      }
      onSuccess()
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên vị trí *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên vị trí" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập mô tả vị trí" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {position ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
