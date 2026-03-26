import type { SeedContext } from '../context'

export const seedProjectDocuments = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: '93000000-0000-0000-0000-000000000001',
      projectId: ids.projects.emsCore,
      fileName: 'requirements-v1.pdf',
      storageKey: 'seed/ems-core/requirements-v1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(245760),
      uploadedBy: ids.users.admin,
    },
    {
      id: '93000000-0000-0000-0000-000000000002',
      projectId: ids.projects.emsCore,
      fileName: 'system-design-v2.docx',
      storageKey: 'seed/ems-core/system-design-v2.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: BigInt(163840),
      uploadedBy: ids.users.managerEngineering,
    },
    {
      id: '93000000-0000-0000-0000-000000000003',
      projectId: ids.projects.mobileApp,
      fileName: 'mobile-ui-kit.fig',
      storageKey: 'seed/mobile-app/mobile-ui-kit.fig',
      mimeType: 'application/octet-stream',
      sizeBytes: BigInt(81920),
      uploadedBy: ids.users.managerEngineering,
    },
  ]

  for (const item of baseItems) {
    await prisma.projectDocument.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  let docIndex = 1
  for (const projectId of state.projectIds) {
    for (const [fileIndex, ext] of ['pdf', 'docx', 'xlsx'].entries()) {
      const id = makeId('98000000', docIndex)
      const fileName = `seed-document-${fileIndex + 1}.${ext}`
      const storageKey = `seed/${projectId}/${fileName}`
      const mimeType =
        ext === 'pdf'
          ? 'application/pdf'
          : ext === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

      await prisma.projectDocument.upsert({
        where: { id },
        update: {
          projectId,
          fileName,
          storageKey,
          mimeType,
          sizeBytes: BigInt(1024 * 50 * (fileIndex + 1)),
          uploadedBy: ids.users.admin,
        },
        create: {
          id,
          projectId,
          fileName,
          storageKey,
          mimeType,
          sizeBytes: BigInt(1024 * 50 * (fileIndex + 1)),
          uploadedBy: ids.users.admin,
        },
      })

      docIndex += 1
    }
  }
}

