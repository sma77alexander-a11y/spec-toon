const toonFiles = import.meta.glob('../../examples/{valid,conversions}/*.toon', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const jsonFiles = import.meta.glob('../../examples/conversions/*.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface Sample {
  name: string
  toon: string
  json?: string
}

export const samples: Sample[] = Object.entries(toonFiles)
  .map(([path, toon]) => {
    const name = path.split('/').pop()!.replace('.toon', '')
    const jsonPath = path.replace('.toon', '.json')
    return { name, toon, json: jsonFiles[jsonPath] }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
