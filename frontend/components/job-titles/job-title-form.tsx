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
import type { JobTitle } from '@/lib/types'
import { jobTitleApi } from '@/lib/api/endpoints'

const jobTitleSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên chức danh'),
  levelOrder: z.string().min(1, 'Vui lòng nhập cấp bậc'),
  description: z.string().optional(),
})

type JobTitleFormData = z.infer<typeof jobTitleSchema>

interface JobTitleFormProps {
  jobTitle?: JobTitle | null
  onSuccess: () => void
  onCancel: () => void
}

export function JobTitleForm({ jobTitle, onSuccess, onCancel }: JobTitleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<JobTitleFormData>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      name: jobTitle?.name || '',
      levelOrder: jobTitle?.levelOrder?.toString() || '',
      description: jobTitle?.description || '',
    },
  })

  const onSubmit = async (data: JobTitleFormData) => {
    setIsSubmitting(true)
    try {
      const payload = { ...data, levelOrder: parseInt(data.levelOrder, 10) }
      if (jobTitle) {
        await jobTitleApi.update(jobTitle.id, payload)
      } else {
        await jobTitleApi.create(payload)
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
              <FormLabel>Tên chức danh *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên chức danh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="levelOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cấp bậc (Level Order) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Nhập cấp bậc (số càng cao = cấp bậc càng cao)"
                  {...field}
                />
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
                <Textarea placeholder="Nhập mô tả chức danh" {...field} />
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
            {jobTitle ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
