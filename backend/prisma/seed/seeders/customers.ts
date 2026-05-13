import type { SeedContext } from '../context'

export const seedCustomers = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: ids.customers.alpha,
      companyName: 'Alpha Solutions Co., Ltd',
      taxCode: '0101234567',
      businessAddress: '1 Lê Lợi, Hồ Chí Minh',
      contactAddress: '1 Lê Lợi, Hồ Chí Minh',
      country: 'Vietnam',
      city: 'Hồ Chí Minh',
      contactName: 'Trần Minh Khang',
      contactTitle: 'Director',
      contactEmail: 'khang@alpha.example',
      contactPhone: '0901111111',
      paymentTerms: 'NET 30',
      notes: 'Strategic customer',
      cooperationStatus: 'ACTIVE',
    },
    {
      id: ids.customers.beta,
      companyName: 'Beta Manufacturing JSC',
      taxCode: '0207654321',
      businessAddress: '99 Nguyễn Trãi, Hà Nội',
      contactAddress: '99 Nguyễn Trãi, Hà Nội',
      country: 'Vietnam',
      city: 'Hà Nội',
      contactName: 'Lê Hoàng Gia',
      contactTitle: 'PMO Lead',
      contactEmail: 'gia@beta.example',
      contactPhone: '0902222222',
      paymentTerms: 'NET 45',
      notes: 'Manufacturing vertical',
      cooperationStatus: 'ACTIVE',
    },
    {
      id: ids.customers.gamma,
      companyName: 'Gamma Holdings',
      taxCode: '0309988776',
      businessAddress: '5 Trần Phú, Đà Nẵng',
      contactAddress: '5 Trần Phú, Đà Nẵng',
      country: 'Vietnam',
      city: 'Đà Nẵng',
      contactName: 'Ngô Bảo Châu',
      contactTitle: 'Head of IT',
      contactEmail: 'chau@gamma.example',
      contactPhone: '0903333333',
      paymentTerms: 'NET 15',
      notes: 'Pilot customer',
      cooperationStatus: 'PAUSED',
    },
  ]

  const extraCustomers = [
    { companyName: 'Delta Logistics', city: 'Hà Nội', contactName: 'Nguyễn Hải Sơn' },
    { companyName: 'Epsilon Retail', city: 'Hồ Chí Minh', contactName: 'Trần Mỹ Linh' },
    { companyName: 'Zeta Software', city: 'Đà Nẵng', contactName: 'Lê Quang Trung' },
    { companyName: 'Theta Healthcare', city: 'Cần Thơ', contactName: 'Phạm Thu Hương' },
  ]

  for (const item of baseItems) {
    await prisma.customer.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  for (const [index, item] of extraCustomers.entries()) {
    const id = makeId('71000000', index + 1)
    if (!state.customerIds.includes(id)) state.customerIds.push(id)

    await prisma.customer.upsert({
      where: { id },
      update: {
        companyName: item.companyName,
        businessAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        contactAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        city: item.city,
        country: 'Vietnam',
        contactName: item.contactName,
        contactEmail: `contact${index + 10}@example.com`,
        contactPhone: `09100000${index}`,
        cooperationStatus: 'ACTIVE',
      },
      create: {
        id,
        companyName: item.companyName,
        taxCode: `04${index}1234567`,
        businessAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        contactAddress: `${index + 10} Trần Hưng Đạo, ${item.city}`,
        city: item.city,
        country: 'Vietnam',
        contactName: item.contactName,
        contactEmail: `contact${index + 10}@example.com`,
        contactPhone: `09100000${index}`,
        paymentTerms: 'NET 30',
        cooperationStatus: 'ACTIVE',
      },
    })
  }
}

