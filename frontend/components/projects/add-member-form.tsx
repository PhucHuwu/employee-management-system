'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { employeeApi, projectApi } from '@/lib/api/endpoints'

const addMemberSchema = z.object({
  employeeId: z.string().min(1, 'Vui lòng chọn nhân viên'),
  roleInProject: z.string().optional(),
})

type AddMemberFormData = z.infer<typeof addMemberSchema>

interface AddMemberFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddMemberForm({ projectId, onSuccess, onCancel }: AddMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [employees, setEmployees] = useState<Array<{ id: string; fullName: string }>>([])

  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      employeeId: '',
      roleInProject: '',
    },
  })

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true)
      try {
        const res = await employeeApi.getAll({ status: 'ACTIVE', size: 100 })
        setEmployees(res.items.map((item) => ({ id: item.id, fullName: item.fullName })))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không tải được danh sách nhân viên')
      } finally {
        setIsLoadingEmployees(false)
      }
    }

    void fetchEmployees()
  }, [])

  const onSubmit = async (data: AddMemberFormData) => {
    setIsSubmitting(true)
    try {
      await projectApi.addMember(projectId, {
        employeeId: data.employeeId,
        roleInProject: data.roleInProject || undefined,
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
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhân viên *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingEmployees ? 'Đang tải...' : 'Chọn nhân viên'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.fullName}
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
          name="roleInProject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vai trò trong dự án</FormLabel>
              <FormControl>
                <Input placeholder="VD: Developer, Designer, QA..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingEmployees}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            Thêm thành viên
          </Button>
        </div>
      </form>
    </Form>
  )
}
