import apiClient from './client'
import type {
  Employee,
  EmployeeDetail,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ScheduleRequest,
  DailySummary,
  DailyDrilldown,
  DailyReport,
  Project,
  ProjectDetail,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectMember,
  ProjectDocument,
  ProjectRevenue,
  CreateRevenueInput,
  Customer,
  Position,
  CreatePositionInput,
  JobTitle,
  CreateJobTitleInput,
  PromotionHistory,
  CreatePromotionInput,
  Department,
  AuditLog,
  PaginatedResponse,
  ApiListResponse,
  ScheduleRequestType,
  LeaveBalance,
  LeaveTransaction,
  JobRequisition,
  Candidate,
  Interview,
  TrainingPlan,
  TrainingRecord,
  SalaryStructure,
  Payroll,
  PayrollItem,
  ProjectBudget,
  ExpenseClaim,
  Invoice,
  Branch,
  EducationType,
  Education,
  Skill,
  CVSource,
  SubPosition,
  PositionSetting,
  Capability,
  CapabilitySetting,
  ScoreSetting,
  InterviewSchedule,
  ProjectTask,
  TimesheetEntry,
  ReviewIntern,
  TeamBuildingRequest,
  WorkingTimeRequest,
  SystemSetting,
  LeaveType,
  OffDay,
  ProjectMemberShadow,
} from '@/lib/types'

const toPaginated = <T>(response: (ApiListResponse<T> & {
  data?: T[]
  page?: number
  size?: number
  total?: number
  totalPages?: number
}) | T[]): PaginatedResponse<T> => {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: 1,
      size: response.length,
      total: response.length,
      totalPages: 1,
    }
  }

  const items = response.items ?? response.data ?? []
  const page = response.pagination?.page ?? response.page ?? 1
  const size = response.pagination?.size ?? response.size ?? items.length
  const total = response.pagination?.total ?? response.total ?? items.length
  const totalPages =
    response.pagination?.totalPages ??
    response.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(size, 1)))

  return {
    items,
    page,
    size,
    total,
    totalPages,
  }
}

// ==================== Employee API ====================
export const employeeApi = {
  getAll: async (params?: {
    keyword?: string
    departmentId?: string
    projectId?: string
    positionId?: string
    jobTitleId?: string
    status?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<Employee>>('/employees', params)),

  getById: (id: string) => apiClient.get<EmployeeDetail>(`/employees/${id}`),

  create: (data: CreateEmployeeInput) => apiClient.post<Employee>('/employees', data),

  update: (id: string, data: UpdateEmployeeInput) => apiClient.put<Employee>(`/employees/${id}`, data),

  delete: (id: string) => apiClient.delete(`/employees/${id}`),

  getPromotions: (id: string) => apiClient.get<PromotionHistory[]>(`/employees/${id}/promotions`),

  createPromotion: (id: string, data: CreatePromotionInput) =>
    apiClient.post<PromotionHistory>(`/employees/${id}/promotions`, data),
}

// ==================== Schedule API ====================
export const scheduleApi = {
  getRequests: async (params?: {
    status?: string
    type?: string
    employeeId?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<ScheduleRequest>>('/schedule-requests', params)),

  approve: (id: string) => apiClient.post(`/schedule-requests/${id}/approve`),

  reject: (id: string, rejectionReason: string) =>
    apiClient.post(`/schedule-requests/${id}/reject`, { rejectionReason }),

  getDailySummary: (params: {
    from: string
    to: string
    departmentId?: string
    projectId?: string
  }) => apiClient.get<DailySummary[]>('/schedules/daily-summary', params),

  getDailyDrilldown: (params: {
    date: string
    type: ScheduleRequestType
  }) => apiClient.get<DailyDrilldown[]>('/schedules/daily-drilldown', params),
}

// ==================== Daily Report API ====================
export const dailyReportApi = {
  getAll: async (params?: {
    employeeId?: string
    projectId?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<DailyReport>>('/daily-reports', params)),

  getProjectProgress: async (projectId: string, params?: {
    memberId?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<DailyReport>>(`/projects/${projectId}/daily-progress`, params)),
}

// ==================== Project API ====================
export const projectApi = {
  getAll: async (params?: {
    status?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<Project>>('/projects', params)),

  getById: (id: string) => apiClient.get<ProjectDetail>(`/projects/${id}`),

  create: (data: CreateProjectInput) => apiClient.post<Project>('/projects', data),

  update: (id: string, data: UpdateProjectInput) => apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),

  // Members
  addMember: (projectId: string, data: { employeeId: string; roleInProject?: string }) =>
    apiClient.post<ProjectMember>(`/projects/${projectId}/members`, data),

  removeMember: (projectId: string, employeeId: string) =>
    apiClient.delete(`/projects/${projectId}/members/${employeeId}`),

  // Documents
  getDocuments: async (projectId: string) =>
    (await apiClient.get<ApiListResponse<ProjectDocument>>(`/projects/${projectId}/documents`)).items,

  uploadDocument: async (projectId: string, file: File, uploadedBy?: string) => {
    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    return apiClient.post<ProjectDocument>(`/projects/${projectId}/documents`, {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      contentBase64: base64,
      uploadedBy,
    })
  },

  downloadDocument: (projectId: string, docId: string) =>
    apiClient.get<{ fileName: string; mimeType: string; contentBase64: string }>(
      `/projects/${projectId}/documents/${docId}/download`
    ),

  deleteDocument: (projectId: string, docId: string) =>
    apiClient.delete(`/projects/${projectId}/documents/${docId}`),

  // Revenues
  getRevenues: async (projectId: string) =>
    (await apiClient.get<ApiListResponse<ProjectRevenue>>(`/projects/${projectId}/revenues`)).items,

  createRevenue: (projectId: string, data: CreateRevenueInput) =>
    apiClient.post<ProjectRevenue>(`/projects/${projectId}/revenues`, data),

  updateRevenue: (projectId: string, revenueId: string, data: Partial<CreateRevenueInput>) =>
    apiClient.put<ProjectRevenue>(`/projects/${projectId}/revenues/${revenueId}`, data),

  deleteRevenue: (projectId: string, revenueId: string) =>
    apiClient.delete(`/projects/${projectId}/revenues/${revenueId}`),
}

// ==================== Customer API ====================
export const customerApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Customer>>('/customers', params)),

  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),

  create: (data: Partial<Customer>) => apiClient.post<Customer>('/customers', data),

  update: (id: string, data: Partial<Customer>) => apiClient.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) => apiClient.delete(`/customers/${id}`),

  linkToProject: (projectId: string, customerId: string) =>
    apiClient.post(`/projects/${projectId}/customers`, { customerId }),

  unlinkFromProject: (projectId: string, customerId: string) =>
    apiClient.delete(`/projects/${projectId}/customers/${customerId}`),
}

// ==================== Position API ====================
export const positionApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Position> | Position[]>('/positions', params)),

  getById: (id: string) => apiClient.get<Position>(`/positions/${id}`),

  create: (data: CreatePositionInput) => apiClient.post<Position>('/positions', data),

  update: (id: string, data: Partial<CreatePositionInput>) =>
    apiClient.put<Position>(`/positions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/positions/${id}`),
}

// ==================== Job Title API ====================
export const jobTitleApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<JobTitle> | JobTitle[]>('/job-titles', params)),

  getById: (id: string) => apiClient.get<JobTitle>(`/job-titles/${id}`),

  create: (data: CreateJobTitleInput) => apiClient.post<JobTitle>('/job-titles', data),

  update: (id: string, data: Partial<CreateJobTitleInput>) =>
    apiClient.put<JobTitle>(`/job-titles/${id}`, data),

  delete: (id: string) => apiClient.delete(`/job-titles/${id}`),
}

// ==================== Department API ====================
export const departmentApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<PaginatedResponse<Department>>('/departments', params),

  getById: (id: string) => apiClient.get<Department>(`/departments/${id}`),

  create: (data: { name: string }) => apiClient.post<Department>('/departments', data),

  update: (id: string, data: { name: string }) => apiClient.put<Department>(`/departments/${id}`, data),

  delete: (id: string) => apiClient.delete(`/departments/${id}`),
}

// ==================== Analytics API ====================
export const analyticsApi = {
  getDashboardSummary: () => apiClient.get<{
    employeeCount: { active: number; inactive: number; total: number }
    projectCount: { running: number; paused: number; ended: number; total: number }
    pendingRequests: number
    todayOff: number
    todayRemote: number
    totalRevenueActual: number
    totalRevenueForecast: number
    overdueProjects: number
    missingDailyReports: number
  }>('/analytics/dashboard-summary'),

  getExceptionReports: () => apiClient.get<{
    overdueProjects: Array<{ id: string; code: string; name: string; endDate: string }>
    missingDailyReports: Array<{ employeeId: string; fullName: string; missingDays: number }>
    budgetOverruns: unknown[]
  }>('/analytics/exception-reports'),

  getRevenue: (params?: { projectId?: string; year?: number }) =>
    apiClient.get<{
      months: Array<{ month: number; forecast: number; actual: number }>
      totalForecast: number
      totalActual: number
    }>('/analytics/revenue', params),

  getResourceUtilization: (params?: { from?: string; to?: string }) =>
    apiClient.get<{
      employees: Array<{ employeeId: string; fullName: string; projectCount: number; allocationScore: number }>
      avgProjectsPerEmployee: number
    }>('/analytics/resource-utilization', params),
}

// ==================== Audit Log API ====================
export const auditLogApi = {
  getAll: async (params?: {
    actorId?: string
    action?: string
    entityType?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }) => toPaginated(await apiClient.get<ApiListResponse<AuditLog>>('/internal/audit-logs', params)),
}

// ==================== Leave Balance API ====================
export const leaveApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<LeaveBalance>>('/leave-balances', params)),

  getByEmployee: (employeeId: string, year: number) =>
    apiClient.get<LeaveBalance>(`/leave-balances/${employeeId}/${year}`),

  create: (data: { employeeId: string; year: number; annualLeave?: number; sickLeave?: number }) =>
    apiClient.post<LeaveBalance>('/leave-balances', data),

  update: (id: string, data: Partial<{ annualLeave: number; sickLeave: number }>) =>
    apiClient.put<LeaveBalance>(`/leave-balances/${id}`, data),

  getTransactions: async (employeeId: string, params?: { year?: number; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<LeaveTransaction>>(`/leave-balances/${employeeId}/transactions`, params)),
}

// ==================== Recruitment API ====================
export const recruitmentApi = {
  getJobRequisitions: async (params?: { status?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<JobRequisition>>('/job-requisitions', params)),

  getJobRequisition: (id: string) => apiClient.get<JobRequisition>(`/job-requisitions/${id}`),

  createJobRequisition: (data: Partial<JobRequisition>) =>
    apiClient.post<JobRequisition>('/job-requisitions', data),

  updateJobRequisition: (id: string, data: Partial<JobRequisition>) =>
    apiClient.put<JobRequisition>(`/job-requisitions/${id}`, data),

  deleteJobRequisition: (id: string) => apiClient.delete(`/job-requisitions/${id}`),

  getCandidates: async (params?: { jobRequisitionId?: string; status?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Candidate>>('/candidates', params)),

  getCandidate: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`),

  createCandidate: (data: Partial<Candidate>) => apiClient.post<Candidate>('/candidates', data),

  updateCandidate: (id: string, data: Partial<Candidate>) => apiClient.put<Candidate>(`/candidates/${id}`, data),

  deleteCandidate: (id: string) => apiClient.delete(`/candidates/${id}`),

  getInterviews: async (params?: { candidateId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Interview>>('/interviews', params)),

  createInterview: (data: Partial<Interview>) => apiClient.post<Interview>('/interviews', data),

  updateInterview: (id: string, data: Partial<Interview>) => apiClient.put<Interview>(`/interviews/${id}`, data),

  deleteInterview: (id: string) => apiClient.delete(`/interviews/${id}`),
}

// ==================== Training API ====================
export const trainingApi = {
  getPlans: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<TrainingPlan>>('/training-plans', params)),

  getPlan: (id: string) => apiClient.get<TrainingPlan>(`/training-plans/${id}`),

  createPlan: (data: Partial<TrainingPlan>) => apiClient.post<TrainingPlan>('/training-plans', data),

  updatePlan: (id: string, data: Partial<TrainingPlan>) => apiClient.put<TrainingPlan>(`/training-plans/${id}`, data),

  deletePlan: (id: string) => apiClient.delete(`/training-plans/${id}`),

  getRecords: async (params?: { employeeId?: string; trainingPlanId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<TrainingRecord>>('/training-records', params)),

  createRecord: (data: Partial<TrainingRecord>) => apiClient.post<TrainingRecord>('/training-records', data),

  updateRecord: (id: string, data: Partial<TrainingRecord>) => apiClient.put<TrainingRecord>(`/training-records/${id}`, data),

  deleteRecord: (id: string) => apiClient.delete(`/training-records/${id}`),

  getExpiringSoon: () => apiClient.get<TrainingRecord[]>('/training-records/expiring-soon'),
}

// ==================== Payroll API ====================
export const payrollApi = {
  getSalaryStructures: async (params?: { employeeId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<SalaryStructure>>('/salary-structures', params)),

  createSalaryStructure: (data: Partial<SalaryStructure>) =>
    apiClient.post<SalaryStructure>('/salary-structures', data),

  updateSalaryStructure: (id: string, data: Partial<SalaryStructure>) =>
    apiClient.put<SalaryStructure>(`/salary-structures/${id}`, data),

  deleteSalaryStructure: (id: string) => apiClient.delete(`/salary-structures/${id}`),

  getPayrolls: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Payroll>>('/payrolls', params)),

  getPayroll: (id: string) => apiClient.get<Payroll & { items: PayrollItem[] }>(`/payrolls/${id}`),

  createPayroll: (data: { month: number; year: number }) => apiClient.post<Payroll>('/payrolls', data),

  calculatePayroll: (id: string) => apiClient.post<Payroll>(`/payrolls/${id}/calculate`, {}),

  approvePayroll: (id: string) => apiClient.post<Payroll>(`/payrolls/${id}/approve`, {}),

  payPayroll: (id: string) => apiClient.post<Payroll>(`/payrolls/${id}/pay`, {}),

  updatePayrollItem: (payrollId: string, itemId: string, data: Partial<PayrollItem>) =>
    apiClient.put<PayrollItem>(`/payrolls/${payrollId}/items/${itemId}`, data),
}

// ==================== Project Budget API ====================
export const projectBudgetApi = {
  getAll: async (params?: { projectId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ProjectBudget>>('/project-budgets', params)),

  getById: (id: string) => apiClient.get<ProjectBudget>(`/project-budgets/${id}`),

  create: (data: Partial<ProjectBudget>) => apiClient.post<ProjectBudget>('/project-budgets', data),

  update: (id: string, data: Partial<ProjectBudget>) =>
    apiClient.put<ProjectBudget>(`/project-budgets/${id}`, data),

  delete: (id: string) => apiClient.delete(`/project-budgets/${id}`),

  getBudgetVsActual: (projectId: string) =>
    apiClient.get<{
      projectId: string
      projectName: string
      budgets: Array<{ category: string; budgeted: number; actual: number; variance: number }>
      totalBudgeted: number
      totalActual: number
      totalRevenue: number
    }>(`/project-budgets/budget-vs-actual/${projectId}`),
}

// ==================== Expense Claim API ====================
export const expenseClaimApi = {
  getAll: async (params?: { status?: string; projectId?: string; employeeId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ExpenseClaim>>('/expense-claims', params)),

  getById: (id: string) => apiClient.get<ExpenseClaim>(`/expense-claims/${id}`),

  create: (data: Partial<ExpenseClaim>) => apiClient.post<ExpenseClaim>('/expense-claims', data),

  update: (id: string, data: Partial<ExpenseClaim>) =>
    apiClient.put<ExpenseClaim>(`/expense-claims/${id}`, data),

  delete: (id: string) => apiClient.delete(`/expense-claims/${id}`),

  approve: (id: string) => apiClient.post<ExpenseClaim>(`/expense-claims/${id}/approve`, {}),

  reject: (id: string, rejectionReason?: string) =>
    apiClient.post<ExpenseClaim>(`/expense-claims/${id}/reject`, { rejectionReason }),
}

// ==================== Invoice API ====================
export const invoiceApi = {
  getAll: async (params?: { status?: string; projectId?: string; customerId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Invoice>>('/invoices', params)),

  getById: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`),

  create: (data: Omit<Partial<Invoice>, 'items'> & { items?: Array<{ description: string; quantity: number; unitPrice: number }> }) =>
    apiClient.post<Invoice>('/invoices', data),

  update: (id: string, data: Omit<Partial<Invoice>, 'items'> & { items?: Array<{ description: string; quantity: number; unitPrice: number }> }) =>
    apiClient.put<Invoice>(`/invoices/${id}`, data),

  delete: (id: string) => apiClient.delete(`/invoices/${id}`),

  send: (id: string) => apiClient.post<Invoice>(`/invoices/${id}/send`, {}),

  pay: (id: string) => apiClient.post<Invoice>(`/invoices/${id}/pay`, {}),

  generateFromRevenue: (data: { projectId: string; month: number; year: number }) =>
    apiClient.post<Invoice>('/invoices/generate-from-revenue', data),

  getAccountsReceivable: () =>
    apiClient.get<{
      aging: Record<string, { count: number; amount: number; invoices: Invoice[] }>
      totalOutstanding: number
    }>('/invoices/accounts-receivable'),
}

// ==================== Master Data API ====================
export const branchApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Branch>>('/branches', params)),
  getById: (id: string) => apiClient.get<Branch>(`/branches/${id}`),
  create: (data: Partial<Branch>) => apiClient.post<Branch>('/branches', data),
  update: (id: string, data: Partial<Branch>) => apiClient.put<Branch>(`/branches/${id}`, data),
  delete: (id: string) => apiClient.delete(`/branches/${id}`),
}

export const educationTypeApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<EducationType>>('/education-types', params)),
  getById: (id: string) => apiClient.get<EducationType>(`/education-types/${id}`),
  create: (data: Partial<EducationType>) => apiClient.post<EducationType>('/education-types', data),
  update: (id: string, data: Partial<EducationType>) => apiClient.put<EducationType>(`/education-types/${id}`, data),
  delete: (id: string) => apiClient.delete(`/education-types/${id}`),
}

export const educationApi = {
  getAll: async (params?: { educationTypeId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Education>>('/educations', params)),
  getById: (id: string) => apiClient.get<Education>(`/educations/${id}`),
  create: (data: Partial<Education>) => apiClient.post<Education>('/educations', data),
  update: (id: string, data: Partial<Education>) => apiClient.put<Education>(`/educations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/educations/${id}`),
}

export const skillApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Skill>>('/skills', params)),
  getById: (id: string) => apiClient.get<Skill>(`/skills/${id}`),
  create: (data: Partial<Skill>) => apiClient.post<Skill>('/skills', data),
  update: (id: string, data: Partial<Skill>) => apiClient.put<Skill>(`/skills/${id}`, data),
  delete: (id: string) => apiClient.delete(`/skills/${id}`),
}

export const cvSourceApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<CVSource>>('/cv-sources', params)),
  getById: (id: string) => apiClient.get<CVSource>(`/cv-sources/${id}`),
  create: (data: Partial<CVSource>) => apiClient.post<CVSource>('/cv-sources', data),
  update: (id: string, data: Partial<CVSource>) => apiClient.put<CVSource>(`/cv-sources/${id}`, data),
  delete: (id: string) => apiClient.delete(`/cv-sources/${id}`),
}

export const subPositionApi = {
  getAll: async (params?: { positionId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<SubPosition>>('/sub-positions', params)),
  getById: (id: string) => apiClient.get<SubPosition>(`/sub-positions/${id}`),
  create: (data: Partial<SubPosition>) => apiClient.post<SubPosition>('/sub-positions', data),
  update: (id: string, data: Partial<SubPosition>) => apiClient.put<SubPosition>(`/sub-positions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sub-positions/${id}`),
}

export const positionSettingApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<PositionSetting>>('/position-settings', params)),
  getById: (id: string) => apiClient.get<PositionSetting>(`/position-settings/${id}`),
  create: (data: Partial<PositionSetting>) => apiClient.post<PositionSetting>('/position-settings', data),
  update: (id: string, data: Partial<PositionSetting>) => apiClient.put<PositionSetting>(`/position-settings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/position-settings/${id}`),
}

export const capabilityApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<Capability>>('/capabilities', params)),
  getById: (id: string) => apiClient.get<Capability>(`/capabilities/${id}`),
  create: (data: Partial<Capability>) => apiClient.post<Capability>('/capabilities', data),
  update: (id: string, data: Partial<Capability>) => apiClient.put<Capability>(`/capabilities/${id}`, data),
  delete: (id: string) => apiClient.delete(`/capabilities/${id}`),
}

export const capabilitySettingApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<CapabilitySetting>>('/capability-settings', params)),
  getById: (id: string) => apiClient.get<CapabilitySetting>(`/capability-settings/${id}`),
  create: (data: Partial<CapabilitySetting>) => apiClient.post<CapabilitySetting>('/capability-settings', data),
  update: (id: string, data: Partial<CapabilitySetting>) => apiClient.put<CapabilitySetting>(`/capability-settings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/capability-settings/${id}`),
  clone: (id: string, data: { userType: string; positionId: string }) =>
    apiClient.post<CapabilitySetting>(`/capability-settings/${id}/clone`, data),
}

export const scoreSettingApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ScoreSetting>>('/score-settings', params)),
  getById: (id: string) => apiClient.get<ScoreSetting>(`/score-settings/${id}`),
  create: (data: Partial<ScoreSetting>) => apiClient.post<ScoreSetting>('/score-settings', data),
  update: (id: string, data: Partial<ScoreSetting>) => apiClient.put<ScoreSetting>(`/score-settings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/score-settings/${id}`),
}

export const interviewScheduleApi = {
  getAll: async (params?: { candidateId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<InterviewSchedule>>('/interview-schedules', params)),
  getById: (id: string) => apiClient.get<InterviewSchedule>(`/interview-schedules/${id}`),
  create: (data: Partial<InterviewSchedule>) => apiClient.post<InterviewSchedule>('/interview-schedules', data),
  update: (id: string, data: Partial<InterviewSchedule>) => apiClient.put<InterviewSchedule>(`/interview-schedules/${id}`, data),
  delete: (id: string) => apiClient.delete(`/interview-schedules/${id}`),
  sendMail: (id: string) => apiClient.post<void>(`/interview-schedules/${id}/send-mail`, {}),
}

// ==================== Project Task API ====================
export const projectTaskApi = {
  getAll: async (params?: { projectId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ProjectTask>>('/project-tasks', params)),
  getById: (id: string) => apiClient.get<ProjectTask>(`/project-tasks/${id}`),
  create: (data: Partial<ProjectTask>) => apiClient.post<ProjectTask>('/project-tasks', data),
  update: (id: string, data: Partial<ProjectTask>) => apiClient.put<ProjectTask>(`/project-tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/project-tasks/${id}`),
}

// ==================== Timesheet Entry API ====================
export const timesheetEntryApi = {
  getAll: async (params?: { employeeId?: string; projectId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<TimesheetEntry>>('/timesheet-entries', params)),
  getById: (id: string) => apiClient.get<TimesheetEntry>(`/timesheet-entries/${id}`),
  create: (data: Partial<TimesheetEntry>) => apiClient.post<TimesheetEntry>('/timesheet-entries', data),
  update: (id: string, data: Partial<TimesheetEntry>) => apiClient.put<TimesheetEntry>(`/timesheet-entries/${id}`, data),
  delete: (id: string) => apiClient.delete(`/timesheet-entries/${id}`),
  submit: (id: string) => apiClient.post<TimesheetEntry>(`/timesheet-entries/${id}/submit`, {}),
  approve: (id: string) => apiClient.post<TimesheetEntry>(`/timesheet-entries/${id}/approve`, {}),
  reject: (id: string) => apiClient.post<TimesheetEntry>(`/timesheet-entries/${id}/reject`, {}),
}

// ==================== Review Intern API ====================
export const reviewInternApi = {
  getAll: async (params?: { reviewerId?: string; internId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ReviewIntern>>('/review-interns', params)),
  getById: (id: string) => apiClient.get<ReviewIntern>(`/review-interns/${id}`),
  create: (data: Partial<ReviewIntern>) => apiClient.post<ReviewIntern>('/review-interns', data),
  update: (id: string, data: Partial<ReviewIntern>) => apiClient.put<ReviewIntern>(`/review-interns/${id}`, data),
  delete: (id: string) => apiClient.delete(`/review-interns/${id}`),
  submitReview: (id: string) => apiClient.post<ReviewIntern>(`/review-interns/${id}/submit-review`, {}),
  approve: (id: string) => apiClient.post<ReviewIntern>(`/review-interns/${id}/approve`, {}),
  reject: (id: string) => apiClient.post<ReviewIntern>(`/review-interns/${id}/reject`, {}),
  sendMail: (id: string) => apiClient.post<void>(`/review-interns/${id}/send-mail`, {}),
  updateToHrm: (id: string) => apiClient.post<void>(`/review-interns/${id}/update-to-hrm`, {}),
}

// ==================== Team Building Request API ====================
export const teamBuildingRequestApi = {
  getAll: async (params?: { projectId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<TeamBuildingRequest>>('/team-building-requests', params)),
  getById: (id: string) => apiClient.get<TeamBuildingRequest>(`/team-building-requests/${id}`),
  create: (data: Partial<TeamBuildingRequest>) => apiClient.post<TeamBuildingRequest>('/team-building-requests', data),
  update: (id: string, data: Partial<TeamBuildingRequest>) => apiClient.put<TeamBuildingRequest>(`/team-building-requests/${id}`, data),
  delete: (id: string) => apiClient.delete(`/team-building-requests/${id}`),
  approve: (id: string) => apiClient.post<TeamBuildingRequest>(`/team-building-requests/${id}/approve`, {}),
  reject: (id: string) => apiClient.post<TeamBuildingRequest>(`/team-building-requests/${id}/reject`, {}),
  cancel: (id: string) => apiClient.post<TeamBuildingRequest>(`/team-building-requests/${id}/cancel`, {}),
}

// ==================== Working Time Request API ====================
export const workingTimeRequestApi = {
  getAll: async (params?: { employeeId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<WorkingTimeRequest>>('/working-time-requests', params)),
  getById: (id: string) => apiClient.get<WorkingTimeRequest>(`/working-time-requests/${id}`),
  create: (data: Partial<WorkingTimeRequest>) => apiClient.post<WorkingTimeRequest>('/working-time-requests', data),
  delete: (id: string) => apiClient.delete(`/working-time-requests/${id}`),
  approve: (id: string) => apiClient.post<WorkingTimeRequest>(`/working-time-requests/${id}/approve`, {}),
  reject: (id: string) => apiClient.post<WorkingTimeRequest>(`/working-time-requests/${id}/reject`, {}),
}

// ==================== System Setting API ====================
export const systemSettingApi = {
  getAll: async (params?: { category?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<SystemSetting>>('/system-settings', params)),
  getById: (id: string) => apiClient.get<SystemSetting>(`/system-settings/${id}`),
  getByKey: (key: string) => apiClient.get<SystemSetting>(`/system-settings/by-key/${key}`),
  create: (data: Partial<SystemSetting>) => apiClient.post<SystemSetting>('/system-settings', data),
  update: (id: string, data: Partial<SystemSetting>) => apiClient.put<SystemSetting>(`/system-settings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/system-settings/${id}`),
}

// ==================== Leave Type API ====================
export const leaveTypeApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<LeaveType>>('/leave-types', params)),
  getById: (id: string) => apiClient.get<LeaveType>(`/leave-types/${id}`),
  create: (data: Partial<LeaveType>) => apiClient.post<LeaveType>('/leave-types', data),
  update: (id: string, data: Partial<LeaveType>) => apiClient.put<LeaveType>(`/leave-types/${id}`, data),
  delete: (id: string) => apiClient.delete(`/leave-types/${id}`),
}

// ==================== Off Day API ====================
export const offDayApi = {
  getAll: async (params?: { page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<OffDay>>('/off-days', params)),
  getById: (id: string) => apiClient.get<OffDay>(`/off-days/${id}`),
  create: (data: Partial<OffDay>) => apiClient.post<OffDay>('/off-days', data),
  update: (id: string, data: Partial<OffDay>) => apiClient.put<OffDay>(`/off-days/${id}`, data),
  delete: (id: string) => apiClient.delete(`/off-days/${id}`),
}

// ==================== Project Member Shadow API ====================
export const projectMemberShadowApi = {
  getAll: async (params?: { projectId?: string; page?: number; size?: number }) =>
    toPaginated(await apiClient.get<ApiListResponse<ProjectMemberShadow>>('/project-member-shadows', params)),
  getById: (id: string) => apiClient.get<ProjectMemberShadow>(`/project-member-shadows/${id}`),
  create: (data: Partial<ProjectMemberShadow>) => apiClient.post<ProjectMemberShadow>('/project-member-shadows', data),
  delete: (id: string) => apiClient.delete(`/project-member-shadows/${id}`),
}
