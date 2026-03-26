import { EmploymentStatus, FixedSchedule } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedEmployees = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: ids.employees.nguyenAn,
      fullName: 'Nguyễn Văn An',
      dob: new Date('1990-05-15'),
      address: 'Hà Nội',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.backend,
    },
    {
      id: ids.employees.tranBinh,
      fullName: 'Trần Thị Bình',
      dob: new Date('1993-08-20'),
      address: 'Hồ Chí Minh',
      fixedSchedule: FixedSchedule.SHIFT_9_6,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.frontend,
    },
    {
      id: ids.employees.leCuong,
      fullName: 'Lê Văn Cường',
      dob: new Date('1988-12-01'),
      address: 'Đà Nẵng',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.business,
      positionId: ids.positions.sales,
    },
    {
      id: ids.employees.phamDung,
      fullName: 'Phạm Thị Dung',
      dob: new Date('1992-03-11'),
      address: 'Hải Phòng',
      fixedSchedule: FixedSchedule.SHIFT_9_6,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.hr,
      positionId: ids.positions.hrbp,
    },
    {
      id: ids.employees.hoangEm,
      fullName: 'Hoàng Văn Em',
      dob: new Date('1995-07-09'),
      address: 'Cần Thơ',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.ACTIVE,
      departmentId: ids.departments.engineering,
      positionId: ids.positions.qa,
    },
    {
      id: ids.employees.ngoPhuong,
      fullName: 'Ngô Thị Phương',
      dob: new Date('1989-01-18'),
      address: 'Hà Nội',
      fixedSchedule: FixedSchedule.SHIFT_8_5,
      employmentStatus: EmploymentStatus.INACTIVE,
      departmentId: ids.departments.finance,
      positionId: ids.positions.pm,
    },
  ]

  const extraEmployees = [
    { fullName: 'Đặng Minh Quân', address: 'Hà Nội', departmentId: ids.departments.engineering, positionId: ids.positions.backend, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Bùi Hải Yến', address: 'Hồ Chí Minh', departmentId: ids.departments.engineering, positionId: ids.positions.frontend, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Võ Tuấn Khải', address: 'Đà Nẵng', departmentId: ids.departments.business, positionId: ids.positions.sales, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Trương Lan Anh', address: 'Hải Phòng', departmentId: ids.departments.hr, positionId: ids.positions.hrbp, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Phan Nhật Nam', address: 'Cần Thơ', departmentId: ids.departments.finance, positionId: ids.positions.pm, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Lý Ngọc Mai', address: 'Huế', departmentId: ids.departments.engineering, positionId: ids.positions.qa, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Nguyễn Đức Long', address: 'Bình Dương', departmentId: ids.departments.business, positionId: ids.positions.sales, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Mai Thanh Hà', address: 'Khánh Hòa', departmentId: ids.departments.engineering, positionId: ids.positions.frontend, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Lê Thu Trang', address: 'Hà Nội', departmentId: ids.departments.hr, positionId: ids.positions.hrbp, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Đinh Quốc Bảo', address: 'Quảng Ninh', departmentId: ids.departments.engineering, positionId: ids.positions.backend, fixedSchedule: FixedSchedule.SHIFT_8_5 },
    { fullName: 'Tạ Bảo Châu', address: 'Hồ Chí Minh', departmentId: ids.departments.finance, positionId: ids.positions.pm, fixedSchedule: FixedSchedule.SHIFT_9_6 },
    { fullName: 'Trần Hữu Phúc', address: 'Đồng Nai', departmentId: ids.departments.engineering, positionId: ids.positions.qa, fixedSchedule: FixedSchedule.SHIFT_8_5 },
  ]

  for (const item of baseItems) {
    await prisma.employee.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  for (const [index, item] of extraEmployees.entries()) {
    const id = makeId('51000000', index + 1)
    if (!state.employeeIds.includes(id)) state.employeeIds.push(id)

    await prisma.employee.upsert({
      where: { id },
      update: {
        fullName: item.fullName,
        dob: new Date(1990 + (index % 8), index % 12, (index % 27) + 1),
        address: item.address,
        fixedSchedule: item.fixedSchedule,
        employmentStatus: EmploymentStatus.ACTIVE,
        departmentId: item.departmentId,
        positionId: item.positionId,
      },
      create: {
        id,
        fullName: item.fullName,
        dob: new Date(1990 + (index % 8), index % 12, (index % 27) + 1),
        address: item.address,
        fixedSchedule: item.fixedSchedule,
        employmentStatus: EmploymentStatus.ACTIVE,
        departmentId: item.departmentId,
        positionId: item.positionId,
      },
    })
  }
}

