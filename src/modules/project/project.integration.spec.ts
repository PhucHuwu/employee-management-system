import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus, RevenueType } from '@prisma/client';
import { projectFixtures } from './__fixtures__/project.fixture';
import { CustomerService } from './services/customer.service';
import { ProjectService } from './services/project.service';

describe('Project Module Integration', () => {
  function setup() {
    const prisma = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectMember: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      projectCustomer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      projectDocument: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      projectRevenue: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      dailyReport: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      customer: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const auditLogService = {
      log: jest.fn(),
    };

    const storageAdapter = {
      upload: jest.fn(),
      download: jest.fn(),
      delete: jest.fn(),
    };

    const projectService = new ProjectService(
      prisma as never,
      auditLogService as never,
      storageAdapter as never,
    );
    const customerService = new CustomerService(prisma as never, auditLogService as never);

    return { prisma, auditLogService, storageAdapter, projectService, customerService };
  }

  it('PHU-PRJ-008: project CRUD and unique code conflict', async () => {
    const { projectService, prisma, auditLogService } = setup();

    prisma.project.create.mockResolvedValue({
      id: projectFixtures.ids.projectA,
      ...projectFixtures.createProjectInput,
    });

    const created = await projectService.createProject(projectFixtures.createProjectInput);
    expect(created.id).toBe(projectFixtures.ids.projectA);

    prisma.$transaction.mockResolvedValue([[{ id: projectFixtures.ids.projectA }], 1]);
    const list = await projectService.listProjects({ page: 1, size: 20, status: ProjectStatus.RUNNING });
    expect(list.pagination.total).toBe(1);

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    prisma.project.findUniqueOrThrow.mockResolvedValue({
      id: projectFixtures.ids.projectA,
      code: 'PRJ-OLD',
    });
    prisma.project.update.mockResolvedValue({
      id: projectFixtures.ids.projectA,
      code: 'PRJ-NEW',
    });

    const updated = await projectService.updateProject(projectFixtures.ids.projectA, { code: 'PRJ-NEW' });
    expect(updated.code).toBe('PRJ-NEW');
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PROJECT_UPDATED' }),
    );

    prisma.$transaction.mockResolvedValue([0, 0, 0, 0, 0]);
    prisma.project.delete.mockResolvedValue({ id: projectFixtures.ids.projectA });

    const deleted = await projectService.deleteProject(projectFixtures.ids.projectA);
    expect(deleted).toEqual({ deleted: true });

    prisma.project.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate project code', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(projectService.createProject(projectFixtures.createProjectInput)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('PHU-MEM-005: add/remove member and duplicate constraint', async () => {
    const { projectService, prisma } = setup();

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    prisma.employee.findUnique.mockResolvedValue({ id: projectFixtures.ids.employeeA });
    prisma.projectMember.create.mockResolvedValue({
      id: projectFixtures.ids.memberA,
      employeeId: projectFixtures.ids.employeeA,
      projectId: projectFixtures.ids.projectA,
    });

    const added = await projectService.addMember(projectFixtures.ids.projectA, projectFixtures.createMemberInput);
    expect(added.id).toBe(projectFixtures.ids.memberA);

    prisma.projectMember.findUnique.mockResolvedValue({
      id: projectFixtures.ids.memberA,
      projectId: projectFixtures.ids.projectA,
      employeeId: projectFixtures.ids.employeeA,
    });

    const removed = await projectService.removeMember(
      projectFixtures.ids.projectA,
      projectFixtures.ids.employeeA,
    );
    expect(removed).toEqual({ deleted: true });

    prisma.projectMember.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate member', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      projectService.addMember(projectFixtures.ids.projectA, projectFixtures.createMemberInput),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('PHU-CUS-007: customer CRUD with project linking and duplicate link constraint', async () => {
    const { customerService, prisma } = setup();

    prisma.customer.create.mockResolvedValue({ id: projectFixtures.ids.customerA });
    const created = await customerService.createCustomer(projectFixtures.createCustomerInput);
    expect(created.id).toBe(projectFixtures.ids.customerA);

    prisma.$transaction.mockResolvedValue([[{ id: projectFixtures.ids.customerA }], 1]);
    const list = await customerService.listCustomers({ page: 1, size: 20 });
    expect(list.pagination.total).toBe(1);

    prisma.customer.findUnique.mockResolvedValue({ id: projectFixtures.ids.customerA });
    prisma.customer.findUniqueOrThrow.mockResolvedValue({
      id: projectFixtures.ids.customerA,
      companyName: 'Old',
    });
    prisma.customer.update.mockResolvedValue({
      id: projectFixtures.ids.customerA,
      companyName: 'New',
    });

    const updated = await customerService.updateCustomer(projectFixtures.ids.customerA, {
      companyName: 'New',
    });
    expect(updated.companyName).toBe('New');

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    prisma.projectCustomer.create.mockResolvedValue({
      id: 'link-1',
      projectId: projectFixtures.ids.projectA,
      customerId: projectFixtures.ids.customerA,
    });

    const linked = await customerService.linkCustomerToProject(projectFixtures.ids.projectA, {
      customerId: projectFixtures.ids.customerA,
    });
    expect(linked.id).toBe('link-1');

    prisma.projectCustomer.findUnique.mockResolvedValue({
      id: 'link-1',
      projectId: projectFixtures.ids.projectA,
      customerId: projectFixtures.ids.customerA,
    });

    const unlinked = await customerService.unlinkCustomerFromProject(
      projectFixtures.ids.projectA,
      projectFixtures.ids.customerA,
    );
    expect(unlinked).toEqual({ deleted: true });

    prisma.projectCustomer.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate link', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      customerService.linkCustomerToProject(projectFixtures.ids.projectA, {
        customerId: projectFixtures.ids.customerA,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('PHU-REV-007: revenue CRUD integration', async () => {
    const { projectService, prisma } = setup();

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    prisma.projectRevenue.create.mockResolvedValue({
      id: projectFixtures.ids.revenueA,
      ...projectFixtures.createRevenueInput,
      amount: new Prisma.Decimal(projectFixtures.createRevenueInput.amount),
    });

    const created = await projectService.createRevenue(
      projectFixtures.ids.projectA,
      projectFixtures.createRevenueInput,
    );
    expect(created.id).toBe(projectFixtures.ids.revenueA);

    prisma.$transaction.mockResolvedValue([[{ id: projectFixtures.ids.revenueA }], 1]);
    const list = await projectService.listRevenues(projectFixtures.ids.projectA, { page: 1, size: 20 });
    expect(list.pagination.total).toBe(1);

    prisma.projectRevenue.findFirst.mockResolvedValue({
      id: projectFixtures.ids.revenueA,
      projectId: projectFixtures.ids.projectA,
      periodMonth: 3,
      periodYear: 2026,
      revenueType: RevenueType.FORECAST,
      amount: new Prisma.Decimal(1000),
    });
    prisma.projectRevenue.update.mockResolvedValue({
      id: projectFixtures.ids.revenueA,
      revenueType: RevenueType.ACTUAL,
    });

    const updated = await projectService.updateRevenue(projectFixtures.ids.projectA, projectFixtures.ids.revenueA, {
      revenueType: RevenueType.ACTUAL,
      amount: 1200,
    });
    expect(updated.revenueType).toBe(RevenueType.ACTUAL);

    prisma.projectRevenue.findFirst.mockResolvedValue({
      id: projectFixtures.ids.revenueA,
      projectId: projectFixtures.ids.projectA,
    });

    const deleted = await projectService.deleteRevenue(
      projectFixtures.ids.projectA,
      projectFixtures.ids.revenueA,
    );
    expect(deleted).toEqual({ deleted: true });
  });

  it('PHU-DOC-008: upload/list/download/delete document flow', async () => {
    const { projectService, prisma, storageAdapter } = setup();

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    storageAdapter.upload.mockResolvedValue('docs/storage-key-1');
    prisma.projectDocument.create.mockResolvedValue({
      id: projectFixtures.ids.documentA,
      fileName: 'architecture.md',
      mimeType: 'text/markdown',
      sizeBytes: BigInt(12),
      storageKey: 'docs/storage-key-1',
    });

    const uploaded = await projectService.uploadDocument(
      projectFixtures.ids.projectA,
      projectFixtures.createDocumentInput,
    );
    expect(uploaded.id).toBe(projectFixtures.ids.documentA);

    prisma.$transaction.mockResolvedValue([
      [
        {
          id: projectFixtures.ids.documentA,
          fileName: 'architecture.md',
          mimeType: 'text/markdown',
          sizeBytes: BigInt(12),
        },
      ],
      1,
    ]);

    const listed = await projectService.listDocuments(projectFixtures.ids.projectA, { page: 1, size: 20 });
    expect(listed.pagination.total).toBe(1);

    prisma.projectDocument.findFirst.mockResolvedValue({
      id: projectFixtures.ids.documentA,
      projectId: projectFixtures.ids.projectA,
      fileName: 'architecture.md',
      mimeType: 'text/markdown',
      storageKey: 'docs/storage-key-1',
    });
    storageAdapter.download.mockResolvedValue(Buffer.from('hello world!'));

    const downloaded = await projectService.downloadDocument(
      projectFixtures.ids.projectA,
      projectFixtures.ids.documentA,
    );
    expect(downloaded.fileName).toBe('architecture.md');

    prisma.projectDocument.findFirst.mockResolvedValue({
      id: projectFixtures.ids.documentA,
      projectId: projectFixtures.ids.projectA,
      storageKey: 'docs/storage-key-1',
    });

    const deleted = await projectService.deleteDocument(
      projectFixtures.ids.projectA,
      projectFixtures.ids.documentA,
    );
    expect(deleted).toEqual({ deleted: true });
    expect(storageAdapter.delete).toHaveBeenCalledWith('docs/storage-key-1');
  });

  it('guards invalid business constraints', async () => {
    const { projectService, prisma, customerService } = setup();

    prisma.project.findUnique.mockResolvedValue({ id: projectFixtures.ids.projectA });
    prisma.employee.findUnique.mockResolvedValue({ id: projectFixtures.ids.employeeA });

    await expect(
      projectService.createProject({
        code: 'PRJ-WRONG-DATE',
        name: 'Wrong Date',
        status: ProjectStatus.RUNNING,
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      projectService.addMember(projectFixtures.ids.projectA, {
        employeeId: projectFixtures.ids.employeeA,
        joinedAt: '2026-03-10',
        leftAt: '2026-03-09',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.customer.findUnique.mockResolvedValue({ id: projectFixtures.ids.customerA });
    prisma.projectCustomer.count.mockResolvedValue(1);
    await expect(customerService.deleteCustomer(projectFixtures.ids.customerA)).rejects.toBeInstanceOf(
      ConflictException,
    );

    prisma.projectRevenue.findFirst.mockResolvedValue(null);
    await expect(
      projectService.updateRevenue(projectFixtures.ids.projectA, projectFixtures.ids.revenueA, {
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
