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
