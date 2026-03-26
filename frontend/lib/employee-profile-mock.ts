export interface EmployeeProfileMock {
  initials: string
  avatarUrl: string
  permanentResidence: string
  phone: string
  email: string
  placeOfBirth: string
  nationality: string
}

const provinces = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Khánh Hòa',
  'Quảng Ninh',
  'Đồng Nai',
  'Thừa Thiên Huế',
  'Long An',
  'Bà Rịa - Vũng Tàu',
]

const districts = [
  'Quận 1',
  'Quận Hoàn Kiếm',
  'Quận Hai Bà Trưng',
  'Quận Đống Đa',
  'Quận Thanh Xuân',
  'Thành phố Thủ Đức',
  'Quận Hải Châu',
  'Quận Sơn Trà',
  'Quận Ngô Quyền',
  'Quận Ninh Kiều',
  'Thành phố Biên Hòa',
  'Thành phố Nha Trang',
  'Thành phố Hạ Long',
  'Thành phố Huế',
]

const streets = [
  'Đường Lê Lợi',
  'Phố Trần Hưng Đạo',
  'Đường Nguyễn Văn Cừ',
  'Phố Khâm Thiên',
  'Đường Hoàng Hoa Thám',
  'Đường Võ Văn Kiệt',
  'Đường Lê Duẩn',
  'Đường Nguyễn Tất Thành',
  'Phố đi bộ Nguyễn Huệ',
  'Đường 3/2',
  'Đường Cách Mạng Tháng Tám',
  'Đường Trần Phú',
]

const phonePrefixes = ['09', '08', '03', '07', '05']

const bgColors = ['#0ea5e9', '#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#14b8a6', '#eab308']

const nationalityDefault = 'Việt Nam'

const hashString = (value: string): number => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0
  }
  return h
}

const pick = <T,>(items: T[], h: number): T => items[h % items.length]

const escapeXmlText = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const initialsFromFullName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).filter(Boolean) as string[]
  return letters.join('') || 'NV'
}

const avatarDataUrl = (initials: string, bgColor: string): string => {
  const safeInitials = escapeXmlText(initials)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='128' height='128' rx='64' fill='${bgColor}'/><text x='50%' y='54%' text-anchor='middle' font-size='52' font-family='Arial, sans-serif' fill='#ffffff' font-weight='700'>${safeInitials}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const getEmployeeProfileMock = (input: { id: string; fullName: string; address: string }): EmployeeProfileMock => {
  const seed = input.id || input.fullName || input.address || ''
  const h = hashString(seed)

  const initials = initialsFromFullName(input.fullName)
  const bgColor = pick(bgColors, h)
  const avatarUrl = avatarDataUrl(initials, bgColor)

  const permanentResidence = `${pick(streets, h)}, ${pick(districts, h >>> 3)}, ${pick(provinces, h >>> 6)}`
  const placeOfBirth = `${pick(streets, h >>> 4)}, ${pick(districts, h >>> 7)}, ${pick(provinces, h >>> 10)}`

  const phonePrefix = pick(phonePrefixes, h >>> 9)
  const phoneSuffix = String(h % 100000000).padStart(8, '0')
  const phone = `${phonePrefix}${phoneSuffix}`

  const emailSuffix = String(h % 10000).padStart(4, '0')
  const email = `nhanvien${emailSuffix}@ems.local`

  return {
    initials,
    avatarUrl,
    permanentResidence,
    phone,
    email,
    placeOfBirth,
    nationality: nationalityDefault,
  }
}

