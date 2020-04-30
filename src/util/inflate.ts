function inflate<T>(s?: string | T[]): T[] {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  try {
    return JSON.parse(s);
  } catch (error) {
    return [];
  }
}

export default inflate;
