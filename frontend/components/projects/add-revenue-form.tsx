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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { projectApi } from '@/lib/api/endpoints'

const addRevenueSchema = z.object({
  revenueType: z.enum(['FORECAST', 'ACTUAL'], {
    required_error: 'Vui lòng chọn loại doanh thu',
  }),
  amount: z.string().min(1, 'Vui lòng nhập số tiền'),
  currency: z.string().min(1, 'Vui lòng chọn loại tiền'),
  periodMonth: z.string().min(1, 'Vui lòng chọn tháng'),
  periodYear: z.string().min(1, 'Vui lòng chọn năm'),
  note: z.string().optional(),
})

type AddRevenueFormData = z.infer<typeof addRevenueSchema>

interface AddRevenueFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddRevenueForm({ projectId, onSuccess, onCancel }: AddRevenueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddRevenueFormData>({
    resolver: zodResolver(addRevenueSchema),
    defaultValues: {
      revenueType: 'FORECAST',
      amount: '',
      currency: 'VND',
      periodMonth: String(new Date().getMonth() + 1),
      periodYear: String(new Date().getFullYear()),
      note: '',
    },
  })

  const onSubmit = async (data: AddRevenueFormData) => {
    setIsSubmitting(true)
    try {
      await projectApi.createRevenue(projectId, {
        revenueType: data.revenueType,
        amount: parseFloat(data.amount),
        currency: data.currency,
        periodMonth: parseInt(data.periodMonth, 10),
        periodYear: parseInt(data.periodYear, 10),
        note: data.note || undefined,
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="revenueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FORECAST">Dự kiến</SelectItem>
                    <SelectItem value="ACTUAL">Thực tế</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Nhập số tiền" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="periodMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tháng *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="periodYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Năm *</FormLabel>
                <FormControl>
                  <Input type="number" min="2000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại tiền *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại tiền" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập ghi chú" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            Thêm doanh thu
          </Button>
        </div>
      </form>
    </Form>
  )
}
