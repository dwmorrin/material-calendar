function inflate(s?: string | (string | number)[]): (string | number)[] {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  try {
    return JSON.parse(s);
  } catch (error) {
    return [];
  }
}

export default inflate;
