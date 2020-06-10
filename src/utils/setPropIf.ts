export function setPropIf<T>(
  predicateFn: (resource: T) => boolean,
  key: string,
  value: unknown
) {
  return (resource: T): T =>
    predicateFn(resource) ? { ...resource, [key]: value } : { ...resource };
}
