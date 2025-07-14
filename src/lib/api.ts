export async function fetchModules(): Promise<Module[]> {
  const res = await fetch('/api/modules.json');
  if (!res.ok) throw new Error('Failed to load modules');
  return await res.json();
}
