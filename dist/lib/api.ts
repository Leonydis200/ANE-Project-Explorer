export async function fetchModules() {
  const res = await fetch('/api/modules.json')
  if (!res.ok) throw new Error('Failed to fetch modules')
  return res.json()
}
