import { CandidateStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedCandidates = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.candidates.candidate1,
      fullName: 'Đỗ Văn Hùng',
      email: 'hung.dv@email.com',
      phone: '0912345671',
      source: 'TopCV',
      status: CandidateStatus.NEW,
      jobRequisitionId: ids.jobRequisitions.reqBE,
      educationId: ids.educations.ptit,
      branchId: ids.branches.hanoi,
      cvSourceId: ids.cvSources.topcv,
    },
    {
      id: ids.candidates.candidate2,
      fullName: 'Vũ Thị Lan',
      email: 'lan.vt@email.com',
      phone: '0912345672',
      source: 'LinkedIn',
      status: CandidateStatus.SCHEDULED_INTERVIEW,
      jobRequisitionId: ids.jobRequisitions.reqFE,
      educationId: ids.educations.fpt,
      branchId: ids.branches.hcm,
      cvSourceId: ids.cvSources.linkedin,
    },
    {
      id: ids.candidates.candidate3,
      fullName: 'Phan Văn Minh',
      email: 'minh.pv@email.com',
      phone: '0912345673',
      source: 'Referral',
      status: CandidateStatus.ONBOARDED,
      jobRequisitionId: ids.jobRequisitions.reqQA,
      educationId: ids.educations.hust,
      branchId: ids.branches.danang,
      cvSourceId: ids.cvSources.referral,
    },
    {
      id: ids.candidates.candidate4,
      fullName: 'Bùi Thị Hương',
      email: 'huong.bt@email.com',
      phone: '0912345674',
      source: 'VietnamWorks',
      status: CandidateStatus.FAILED_TEST,
      jobRequisitionId: ids.jobRequisitions.reqBE,
      educationId: ids.educations.codegym,
      branchId: ids.branches.hanoi,
      cvSourceId: ids.cvSources.vietnamworks,
    },
    {
      id: ids.candidates.candidate5,
      fullName: 'Trương Văn Khải',
      email: 'khai.tv@email.com',
      phone: '0912345675',
      source: 'ITviec',
      status: CandidateStatus.ACCEPTED_OFFER,
      jobRequisitionId: ids.jobRequisitions.reqIntern,
      educationId: ids.educations.nash,
      branchId: ids.branches.hcm,
      cvSourceId: ids.cvSources.itviec,
    },
    {
      id: ids.candidates.candidate6,
      fullName: 'Lý Thị Ngọc',
      email: 'ngoc.lt@email.com',
      phone: '0912345676',
      source: 'Facebook',
      status: CandidateStatus.SCHEDULED_TEST,
      jobRequisitionId: ids.jobRequisitions.reqFE,
      educationId: ids.educations.funix,
      branchId: ids.branches.danang,
      cvSourceId: ids.cvSources.facebook,
    },
    {
      id: ids.candidates.candidate7,
      fullName: 'Mai Văn Phúc',
      email: 'phuc.mv@email.com',
      phone: '0912345677',
      source: 'TopCV',
      status: CandidateStatus.PASSED_INTERVIEW,
      jobRequisitionId: ids.jobRequisitions.reqBE,
      educationId: ids.educations.hust,
      branchId: ids.branches.hanoi,
      cvSourceId: ids.cvSources.topcv,
    },
    {
      id: ids.candidates.candidate8,
      fullName: 'Tạ Thị Quỳnh',
      email: 'quynh.tt@email.com',
      phone: '0912345678',
      source: 'Referral',
      status: CandidateStatus.REJECTED_OFFER,
      jobRequisitionId: ids.jobRequisitions.reqQA,
      educationId: ids.educations.ptit,
      branchId: ids.branches.cantho,
      cvSourceId: ids.cvSources.referral,
    },
  ]

  for (const item of items) {
    await prisma.candidate.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  // Add candidate skills
  const candidateSkills = [
    { candidateId: ids.candidates.candidate1, skillId: ids.skills.nodejs },
    { candidateId: ids.candidates.candidate1, skillId: ids.skills.sql },
    { candidateId: ids.candidates.candidate2, skillId: ids.skills.react },
    { candidateId: ids.candidates.candidate2, skillId: ids.skills.typescript },
    { candidateId: ids.candidates.candidate3, skillId: ids.skills.java },
    { candidateId: ids.candidates.candidate3, skillId: ids.skills.docker },
    { candidateId: ids.candidates.candidate4, skillId: ids.skills.dotnet },
    { candidateId: ids.candidates.candidate5, skillId: ids.skills.python },
    { candidateId: ids.candidates.candidate5, skillId: ids.skills.aws },
    { candidateId: ids.candidates.candidate6, skillId: ids.skills.react },
    { candidateId: ids.candidates.candidate6, skillId: ids.skills.figma },
    { candidateId: ids.candidates.candidate7, skillId: ids.skills.nodejs },
    { candidateId: ids.candidates.candidate7, skillId: ids.skills.typescript },
    { candidateId: ids.candidates.candidate8, skillId: ids.skills.java },
  ]

  for (const cs of candidateSkills) {
    await prisma.candidateSkill.upsert({
      where: {
        candidateId_skillId: {
          candidateId: cs.candidateId,
          skillId: cs.skillId,
        },
      },
      update: {},
      create: cs,
    })
  }
}
