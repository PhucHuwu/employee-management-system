export const makeId = (prefix: string, index: number): string =>
  `${prefix}-0000-4000-8000-${index.toString().padStart(12, '0')}`

