// ==================== Auth ====================
export type Role = 'Admin' | 'Manager'

export interface User {
  id: string
  email: string
  fullName?: string
  role: Role
  departmentScopeId?: string | null
  projectScopeIds?: string[]
  scopes?: string[]
  avatarUrl?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

// ==================== Employee ====================
export type FixedSchedule = 'SHIFT_8_5' | 'SHIFT_9_6'
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export interface Employee {
  id: string
  fullName: string
  dob: string
  address: string
  departmentId: string
  department?: Department
  positionId: string
  position?: Position
  fixedSchedule: FixedSchedule
  employmentStatus: EmployeeStatus
  projectMembers?: ProjectMember[]
  titleHistories?: PromotionHistory[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface EmployeeDetail extends Employee {
  projects?: ProjectMember[]
  promotionHistory?: PromotionHistory[]
}

export interface CreateEmployeeInput {
  fullName: string
  dob: string
  address: string
  departmentId: string
  positionId: string
  fixedSchedule: FixedSchedule
  projectIds?: string[]
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {}

// ==================== Schedule ====================
export type ScheduleRequestType =
  | 'OFF_FULL_DAY'
  | 'OFF_AM'
  | 'OFF_PM'
  | 'REMOTE_FULL_DAY'
  | 'REMOTE_AM'
  | 'REMOTE_PM'
  | 'CHANGE_FIXED_SCHEDULE'
export type ScheduleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface ScheduleRequest {
  id: string
  employeeId: string
  employee?: {
    id: string
    fullName: string
    departmentId?: string
    fixedSchedule?: FixedSchedule
  }
  requestType: ScheduleRequestType
  requestDate: string
  requestedSchedule?: FixedSchedule | null
  reason?: string
  status: ScheduleRequestStatus
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export interface DailySummary {
  date: string
  total: number
  counts: Record<string, number>
  offFullDay: number
  offAM: number
  offPM: number
  remoteFullDay: number
  remoteAM: number
  remotePM: number
}

export interface DailyDrilldown {
  id: string
  requestType: ScheduleRequestType
  requestDate: string
  employee: {
    id: string
    fullName: string
    departmentId?: string
    fixedSchedule?: FixedSchedule
  }
}

// ==================== Daily Report ====================
export interface DailyReport {
  id: string
  employeeId: string
  employee?: {
    id: string
    fullName: string
  }
  projectId?: string | null
  project?: {
    id: string
    code: string
    name: string
  } | null
  reportDate: string
  task: string
  workContent: string
  createdAt: string
  updatedAt: string
}

// ==================== Project ====================
export type ProjectStatus = 'RUNNING' | 'PAUSED' | 'ENDED'

export interface Project {
  id: string
  name: string
  code: string
  description?: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  _count?: {
    members?: number
    customers?: number
    documents?: number
  }
  createdAt: string
  updatedAt: string
}

export interface ProjectDetail extends Project {
  members?: ProjectMember[]
  customers?: ProjectCustomer[]
  documents?: ProjectDocument[]
  revenues?: ProjectRevenue[]
}

export interface ProjectMember {
  id: string
  employeeId: string
  employee?: {
    id: string
    fullName: string
  }
  projectId: string
  project?: {
    id: string
    code: string
    name: string
  }
  roleInProject?: string | null
  joinedAt?: string | null
  leftAt?: string | null
}

export interface CreateProjectInput {
  name: string
  code: string
  description?: string
  status: ProjectStatus
  startDate: string
  endDate?: string
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

// ==================== Customer ====================
export interface Customer {
  id: string
  companyName: string
  taxCode?: string
  businessAddress?: string
  contactAddress?: string
  country?: string
  city?: string
  contactName?: string
  contactTitle?: string
  contactEmail?: string
  contactPhone?: string
  paymentTerms?: string
  notes?: string
  cooperationStatus?: string
  _count?: {
    projects?: number
  }
  createdAt: string
  updatedAt: string
}

export interface ProjectCustomer {
  id: string
  projectId: string
  customerId: string
  customer?: Customer
}

// ==================== Document ====================
export interface ProjectDocument {
  id: string
  projectId: string
  fileName: string
  storageKey: string
  sizeBytes: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}

// ==================== Revenue ====================
export type RevenueType = 'FORECAST' | 'ACTUAL'

export interface ProjectRevenue {
  id: string
  projectId: string
  revenueType: RevenueType
  amount: number
  currency: string
  periodMonth: number
  periodYear: number
  note?: string
}

export interface CreateRevenueInput {
  revenueType: RevenueType
  amount: number
  currency: string
  periodMonth: number
  periodYear: number
  note?: string
}

// ==================== Position ====================
export interface Position {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePositionInput {
  name: string
  description?: string
}

// ==================== Job Title ====================
export interface JobTitle {
  id: string
  name: string
  levelOrder: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateJobTitleInput {
  name: string
  levelOrder: number
  description?: string
}

// ==================== Promotion ====================
export interface PromotionHistory {
  id: string
  employeeId: string
  oldJobTitleId?: string | null
  oldJobTitle?: JobTitle | null
  newJobTitleId: string
  newJobTitle: JobTitle
  effectiveDate: string
  reason?: string
  createdAt: string
}

export interface CreatePromotionInput {
  newJobTitleId: string
  effectiveDate: string
  reason?: string
  strictPolicy?: boolean
}

// ==================== Department ====================
export interface Department {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

// ==================== Audit Log ====================
export interface AuditLog {
  id: string
  actorId?: string | null
  actorRole?: 'ADMIN' | 'MANAGER' | null
  action: string
  entityType: string
  entityId: string
  oldData?: unknown
  newData?: unknown
  createdAt: string
}

// ==================== API Response ====================
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  size: number
  total: number
  totalPages: number
}

export interface ApiListResponse<T> {
  items: T[]
  pagination?: {
    page: number
    size: number
    total: number
    totalPages?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  requestId?: string
}
