// ==================== Auth ====================
export type Role = 'Admin' | 'Manager' | 'Employee'

export interface User {
  id: string
  email: string
  fullName?: string
  role: Role
  departmentScopeId?: string | null
  projectScopeIds?: string[]
  scopeEmployeeIds?: string[]
  employeeId?: string | null
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

// ==================== Leave Balance ====================
export interface LeaveBalance {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  year: number
  annualLeave: number
  sickLeave: number
  unpaidTaken: number
  createdAt: string
  updatedAt: string
}

export interface LeaveTransaction {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  year: number
  days: number
  type: ScheduleRequestType
  description?: string
  createdAt: string
}

// ==================== Recruitment ====================
export type JobRequisitionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FILLED' | 'CANCELLED'
export type CandidateStatus =
  | 'NEW'
  | 'SCHEDULED_TEST'
  | 'FAILED_TEST'
  | 'REJECTED_TEST'
  | 'SCHEDULED_INTERVIEW'
  | 'PASSED_INTERVIEW'
  | 'FAILED_INTERVIEW'
  | 'REJECTED_INTERVIEW'
  | 'ACCEPTED_OFFER'
  | 'REJECTED_OFFER'
  | 'ONBOARDED'
  | 'REJECTED_APPLY'
export type InterviewResult = 'PENDING' | 'PASSED' | 'FAILED' | 'NO_SHOW'

export type RequisitionType = 'STAFF' | 'INTERN'

export interface JobRequisition {
  id: string
  title: string
  description?: string
  department: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  status: JobRequisitionStatus
  type?: RequisitionType
  requestedBy: string
  openedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  positionId?: string
  position?: Position
  subPositionId?: string
  subPosition?: SubPosition
  _count?: { candidates?: number }
}

export interface Candidate {
  id: string
  fullName: string
  email: string
  phone?: string
  resumeUrl?: string
  cvUrl?: string
  avatarUrl?: string
  source?: string
  status: CandidateStatus
  appliedAt: string
  notes?: string
  jobRequisitionId: string
  jobRequisition?: JobRequisition
  interviews?: Interview[]
  educationId?: string
  education?: Education
  branchId?: string
  branch?: Branch
  cvSourceId?: string
  cvSource?: CVSource
  assignTo?: string
  createdAt: string
  updatedAt: string
}

export interface Interview {
  id: string
  scheduledAt: string
  round: number
  interviewer: string
  result: InterviewResult
  score?: number
  notes?: string
  candidateId: string
  candidate?: Candidate
  createdAt: string
  updatedAt: string
}

// ==================== Training ====================
export interface TrainingPlan {
  id: string
  title: string
  description?: string
  provider?: string
  location?: string
  startDate: string
  endDate: string
  cost?: number
  createdAt: string
  updatedAt: string
  _count?: { records?: number }
}

export interface TrainingRecord {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  trainingPlanId: string
  trainingPlan?: TrainingPlan
  completionDate?: string
  certificateUrl?: string
  certificateExpiry?: string
  score?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// ==================== Payroll ====================
export type PayrollStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID'

export interface SalaryStructure {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  baseSalary: number
  allowance: number
  bonus: number
  effectiveFrom: string
  effectiveTo?: string
  createdAt: string
  updatedAt: string
}

export interface Payroll {
  id: string
  month: number
  year: number
  status: PayrollStatus
  generatedAt: string
  approvedAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  _count?: { items?: number }
}

export interface PayrollItem {
  id: string
  payrollId: string
  employeeId: string
  employee?: { id: string; fullName: string }
  baseSalary: number
  allowance: number
  bonus: number
  deductions: number
  tax: number
  netPay: number
  workingDays: number
  actualDays: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// ==================== Project Budget ====================
export type BudgetCategory = 'LABOR' | 'EQUIPMENT' | 'OVERHEAD'

export interface ProjectBudget {
  id: string
  projectId: string
  project?: { id: string; name: string }
  category: BudgetCategory
  budgetedAmount: number
  actualAmount: number
  note?: string
  createdAt: string
  updatedAt: string
}

// ==================== Expense Claim ====================
export type ExpenseClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ExpenseClaim {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  projectId: string
  project?: { id: string; name: string }
  amount: number
  category: string
  description?: string
  receiptUrl?: string
  status: ExpenseClaimStatus
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// ==================== Invoice ====================
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  customerId: string
  customer?: { id: string; companyName: string }
  projectId: string
  project?: { id: string; name: string }
  invoiceDate: string
  dueDate: string
  totalAmount: number
  taxAmount: number
  status: InvoiceStatus
  sentAt?: string
  paidAt?: string
  items?: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

// ==================== Master Data ====================
export interface Branch {
  id: string
  name: string
  displayName: string
  color?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface EducationType {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Education {
  id: string
  name: string
  color?: string
  educationTypeId: string
  educationType?: EducationType
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CVSource {
  id: string
  name: string
  color?: string
  referenceTo?: string
  createdAt: string
  updatedAt: string
}

export interface SubPosition {
  id: string
  name: string
  color?: string
  positionId: string
  position?: Position
  createdAt: string
  updatedAt: string
}

export interface PositionSetting {
  id: string
  userType: string
  lmsConfig?: string
  subPositionId: string
  subPosition?: SubPosition
  createdAt: string
  updatedAt: string
}

// ==================== Capability ====================
export type CapabilityType = 'POINT' | 'TEXT'

export interface Capability {
  id: string
  name: string
  from?: string
  guideline?: string
  type: CapabilityType
  createdAt: string
  updatedAt: string
}

export interface CapabilitySetting {
  id: string
  userType: string
  positionId: string
  position?: Position
  items?: CapabilitySettingItem[]
  createdAt: string
  updatedAt: string
}

export interface CapabilitySettingItem {
  id: string
  capabilitySettingId: string
  capabilityId: string
  capability?: Capability
  coefficient: number
  guideline?: string
  createdAt: string
  updatedAt: string
}

export interface ScoreSetting {
  id: string
  userType: string
  positionId: string
  position?: Position
  scoreFrom: number
  scoreTo: number
  level: string
  createdAt: string
  updatedAt: string
}

export interface InterviewSchedule {
  id: string
  candidateId: string
  candidate?: Candidate
  scheduledAt: string
  location?: string
  meetingLink?: string
  interviewers?: { id: string; fullName: string }[]
  createdAt: string
  updatedAt: string
}

// ==================== Project Task ====================
export interface ProjectTask {
  id: string
  name: string
  code: string
  description?: string
  projectId: string
  project?: Project
  createdAt: string
  updatedAt: string
}

// ==================== Timesheet Entry ====================
export type TimesheetEntryStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TimesheetEntry {
  id: string
  entryDate: string
  normalWorkingTime: number
  overtime: number
  note?: string
  status: TimesheetEntryStatus
  employeeId: string
  employee?: { id: string; fullName: string }
  projectId: string
  project?: Project
  taskId: string
  task?: ProjectTask
  createdAt: string
  updatedAt: string
}

// ==================== Review Intern ====================
export type ReviewInternStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'REJECTED'

export interface ReviewInternDetail {
  id: string
  reviewInternId: string
  capabilityId: string
  capability?: Capability
  score?: number
  comment?: string
}

export interface ReviewIntern {
  id: string
  month: number
  year: number
  totalScore?: number
  level?: string
  status: ReviewInternStatus
  internId: string
  intern?: { id: string; fullName: string }
  reviewerId: string
  reviewer?: { id: string; fullName: string }
  details?: ReviewInternDetail[]
  createdAt: string
  updatedAt: string
}

// ==================== Team Building Request ====================
export type TeamBuildingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface TeamBuildingRequest {
  id: string
  note?: string
  totalMoney?: number
  attachmentUrl?: string
  status: TeamBuildingStatus
  pmId: string
  pm?: { id: string; fullName: string }
  projectId: string
  project?: Project
  participants?: { id: string; employeeId: string; employee?: { id: string; fullName: string } }[]
  createdAt: string
  updatedAt: string
}

// ==================== Working Time Request ====================
export type WorkingTimeTemplate = 'SHIFT_8_5' | 'SHIFT_9_6'
export type WorkingTimeStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface WorkingTimeRequest {
  id: string
  template: WorkingTimeTemplate
  status: WorkingTimeStatus
  employeeId: string
  employee?: { id: string; fullName: string }
  createdAt: string
  updatedAt: string
}

// ==================== System Setting ====================
export interface SystemSetting {
  id: string
  key: string
  value: string
  category: string
  createdAt: string
  updatedAt: string
}

// ==================== Leave Type ====================
export interface LeaveType {
  id: string
  name: string
  color?: string
  isPaid: boolean
  createdAt: string
  updatedAt: string
}

// ==================== Off Day ====================
export interface OffDay {
  id: string
  offDate: string
  name: string
  note?: string
  createdAt: string
  updatedAt: string
}

// ==================== Project Member Shadow ====================
export interface ProjectMemberShadow {
  id: string
  projectMemberId: string
  projectMember?: ProjectMember
  targetEmployeeId: string
  targetEmployee?: { id: string; fullName: string }
  createdAt: string
  updatedAt: string
}

// ==================== API Response ====================
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  requestId?: string
}
