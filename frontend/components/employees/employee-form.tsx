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
import type { Employee } from '@/lib/types'
import { employeeApi, positionApi } from '@/lib/api/endpoints'

const employeeSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  dob: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((date) => new Date(date) <= new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  positionId: z.string().min(1, 'Vui lòng chọn vị trí'),
  fixedSchedule: z.enum(['SHIFT_8_5', 'SHIFT_9_6'], {
    required_error: 'Vui lòng chọn ca làm việc',
  }),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  employee?: Employee | null
  onSuccess: () => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([])
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: employee?.fullName || '',
      dob: employee?.dob ? employee.dob.slice(0, 10) : '',
      address: employee?.address || '',
      departmentId: employee?.departmentId || '',
      positionId: employee?.positionId || '',
      fixedSchedule: employee?.fixedSchedule || 'SHIFT_8_5',
    },
  })

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true)
      try {
        const [positionsRes, employeesRes] = await Promise.all([
          positionApi.getAll({ size: 100 }),
          employeeApi.getAll({ size: 100 }),
        ])

        setPositions(positionsRes.items.map((p) => ({ id: p.id, name: p.name })))

        const uniqueDepartments = new Map<string, string>()
        for (const item of employeesRes.items) {
          if (item.department?.id && item.department?.name) {
            uniqueDepartments.set(item.department.id, item.department.name)
          }
        }

        if (employee?.departmentId && employee.department?.name) {
          uniqueDepartments.set(employee.departmentId, employee.department.name)
        }

        setDepartments(
          Array.from(uniqueDepartments.entries()).map(([id, name]) => ({ id, name }))
        )
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu biểu mẫu')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    void fetchOptions()
  }, [employee?.department?.name, employee?.departmentId])

  const hasDepartments = useMemo(() => departments.length > 0, [departments])

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true)
    try {
      if (employee) {
        await employeeApi.update(employee.id, data)
      } else {
        await employeeApi.create(data)
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập họ và tên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ *</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập địa chỉ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phòng ban *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingOptions ? 'Đang tải...' : 'Chọn phòng ban'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasDepartments && !isLoadingOptions && (
                  <p className="text-xs text-muted-foreground">Hiện chưa có danh sách phòng ban để chọn.</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="positionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingOptions ? 'Đang tải...' : 'Chọn vị trí'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
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
            name="fixedSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ca làm việc *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca làm việc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SHIFT_8_5">8:00 - 17:00</SelectItem>
                    <SelectItem value="SHIFT_9_6">9:00 - 18:00</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting || isLoadingOptions}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {employee ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
