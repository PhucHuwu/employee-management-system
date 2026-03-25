'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { employeeApi, jobTitleApi } from '@/lib/api/endpoints'

const promotionSchema = z.object({
  newJobTitleId: z.string().min(1, 'Vui lòng chọn chức danh mới'),
  effectiveDate: z.string().min(1, 'Vui lòng chọn ngày hiệu lực'),
  reason: z.string().optional(),
})

type PromotionFormData = z.infer<typeof promotionSchema>

interface PromotionFormProps {
  employeeId: string
  currentJobTitleName?: string
  onSuccess: () => void
  onCancel: () => void
}

export function PromotionForm({ employeeId, currentJobTitleName, onSuccess, onCancel }: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTitles, setIsLoadingTitles] = useState(true)
  const [jobTitles, setJobTitles] = useState<Array<{ id: string; name: string; levelOrder: number }>>([])

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      newJobTitleId: '',
      effectiveDate: '',
      reason: '',
    },
  })

  useEffect(() => {
    const fetchJobTitles = async () => {
      setIsLoadingTitles(true)
      try {
        const res = await jobTitleApi.getAll({ size: 100 })
        const items = res.items
          .map((item) => ({ id: item.id, name: item.name, levelOrder: item.levelOrder }))
          .sort((a, b) => a.levelOrder - b.levelOrder)
        setJobTitles(items)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không tải được danh sách chức danh')
      } finally {
        setIsLoadingTitles(false)
      }
    }

    void fetchJobTitles()
  }, [])

  const selectableTitles = useMemo(() => jobTitles, [jobTitles])

  const onSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true)
    try {
      await employeeApi.createPromotion(employeeId, {
        newJobTitleId: data.newJobTitleId,
        effectiveDate: data.effectiveDate,
        reason: data.reason,
      })
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
        {currentJobTitleName && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Chức danh hiện tại</p>
            <p className="font-medium">{currentJobTitleName}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="newJobTitleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chức danh mới *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTitles ? 'Đang tải...' : 'Chọn chức danh mới'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectableTitles.map((title) => (
                    <SelectItem key={title.id} value={title.id}>
                      {title.name} (Level {title.levelOrder})
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
          name="effectiveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày hiệu lực *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lý do thăng chức</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập lý do thăng chức (không bắt buộc)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting || isLoadingTitles}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            Xác nhận thăng chức
          </Button>
        </div>
      </form>
    </Form>
  )
}
