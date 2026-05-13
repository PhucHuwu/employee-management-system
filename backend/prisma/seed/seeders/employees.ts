import { EmploymentStatus, FixedSchedule } from '@prisma/client'

import type { SeedContext } from '../context'

const lastNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Phan', 'Trương', 'Bùi',
  'Đặng', 'Đỗ', 'Ngô', 'Hồ', 'Dương', 'Lý', 'Mai', 'Tạ', 'Lâm', 'Tô',
]

const maleFirstNames = [
  'Văn An', 'Minh Quân', 'Hải Yến', 'Tuấn Khải', 'Đức Long', 'Cường Thịnh',
  'Tuấn Nam', 'Anh Dũng', 'Hùng Sơn', 'Long Bảo', 'Dũng Phúc', 'Thành Khang',
  'Huy Khoa', 'Khoa Nam', 'Nam Phúc', 'Bảo Khang', 'Khang Trung', 'Trung Hiếu',
  'Hiếu Tùng', 'Tùng Nhật', 'Nhật Đạt', 'Đạt Thịnh', 'Thịnh Quang', 'Quang Huy',
  'Huy Hoàng', 'Hoàng Minh', 'Minh Tiến', 'Tiến Đức', 'Đức Anh', 'Anh Tú',
  'Tú Mạnh', 'Mạnh Cường', 'Cường Vũ', 'Vũ Lâm', 'Lâm Tường', 'Tường Vinh',
  'Vinh Phong', 'Phong Thái', 'Thái Hòa', 'Hòa Bình', 'Bình Dân', 'Dân Trí',
  'Trí Tâm', 'Tâm Đức', 'Đức Hạnh', 'Hạnh Phúc', 'Phúc Lộc', 'Lộc Thọ',
  'Thọ An', 'An Bình',
]

const femaleFirstNames = [
  'Thị Bình', 'Hồng Lan', 'Lan Anh', 'Hương Mai', 'Mai Linh', 'Linh Ngọc',
  'Ngọc Anh', 'Anh Yến', 'Yến Oanh', 'Oanh Phương', 'Phương Thảo', 'Thảo Trang',
  'Trang Hà', 'Hà Tuyết', 'Tuyết Nhung', 'Nhung Ngân', 'Ngân Xuân', 'Xuân Quỳnh',
  'Quỳnh Thùy', 'Thùy Dung', 'Dung Nga', 'Nga Loan', 'Loan Hiền', 'Hiền Thúy',
  'Thúy Kiều', 'Kiều Vân', 'Vân Khánh', 'Khánh My', 'My Tâm', 'Tâm Nhi',
  'Nhi Lê', 'Lê Hà', 'Hà Phương', 'Phương Vy', 'Vy Thảo', 'Thảo Nhi',
  'Nhi Trang', 'Trang Nhung', 'Nhung Hương', 'Hương Giang', 'Giang Thanh',
  'Thanh Thảo', 'Thảo Mi', 'Mi Hồng', 'Hồng Ánh', 'Ánh Tuyết', 'Tuyết Mai',
  'Mai Lan', 'Lan Hương', 'Hương Trà', 'Trà My',
]

const addresses = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Huế', 'Bình Dương', 'Khánh Hòa', 'Quảng Ninh', 'Đồng Nai',
  'Vũng Tàu', 'Nha Trang', 'Cà Mau', 'Lâm Đồng', 'Thái Nguyên',
  'Bắc Ninh', 'Hưng Yên', 'Nam Định', 'Thanh Hóa', 'Nghệ An',
]

const departmentsList = [
  'engineering',
  'business',
  'hr',
  'finance',
] as const

const positionsList = [
  'backend',
  'frontend',
  'qa',
  'pm',
  'sales',
  'hrbp',
] as const

function generateName(index: number): string {
  const isFemale = index % 2 === 0
  const lastName = lastNames[index % lastNames.length]
  const firstName = isFemale
    ? femaleFirstNames[index % femaleFirstNames.length]
    : maleFirstNames[index % maleFirstNames.length]
  return `${lastName} ${firstName}`
}

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

  for (const item of baseItems) {
    await prisma.employee.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  // Generate 94 additional employees (total 100)
  for (let i = 7; i <= 100; i++) {
    const id = makeId('50000000', i)
    if (!state.employeeIds.includes(id)) state.employeeIds.push(id)

    const deptKey = departmentsList[i % departmentsList.length]
    const posKey = positionsList[i % positionsList.length]
    const departmentId = ids.departments[deptKey]
    const positionId = ids.positions[posKey]

    const year = 1985 + (i % 20)
    const month = i % 12
    const day = (i % 28) + 1
    const dob = new Date(year, month, day)

    await prisma.employee.upsert({
      where: { id },
      update: {
        fullName: generateName(i - 1),
        dob,
        address: addresses[i % addresses.length],
        fixedSchedule: i % 3 === 0 ? FixedSchedule.SHIFT_9_6 : FixedSchedule.SHIFT_8_5,
        employmentStatus: i % 10 === 0 ? EmploymentStatus.INACTIVE : EmploymentStatus.ACTIVE,
        departmentId,
        positionId,
      },
      create: {
        id,
        fullName: generateName(i - 1),
        dob,
        address: addresses[i % addresses.length],
        fixedSchedule: i % 3 === 0 ? FixedSchedule.SHIFT_9_6 : FixedSchedule.SHIFT_8_5,
        employmentStatus: i % 10 === 0 ? EmploymentStatus.INACTIVE : EmploymentStatus.ACTIVE,
        departmentId,
        positionId,
      },
    })
  }
}
