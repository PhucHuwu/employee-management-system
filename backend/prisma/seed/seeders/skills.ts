import type { SeedContext } from '../context'

export const seedSkills = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.skills.react, name: 'React' },
    { id: ids.skills.nodejs, name: 'Node.js' },
    { id: ids.skills.dotnet, name: '.NET Core' },
    { id: ids.skills.java, name: 'Java' },
    { id: ids.skills.python, name: 'Python' },
    { id: ids.skills.aws, name: 'AWS' },
    { id: ids.skills.docker, name: 'Docker' },
    { id: ids.skills.sql, name: 'SQL' },
    { id: ids.skills.typescript, name: 'TypeScript' },
    { id: ids.skills.figma, name: 'Figma' },
  ]

  for (const item of items) {
    await prisma.skill.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
