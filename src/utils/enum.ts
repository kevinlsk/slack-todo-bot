
export function stringToEnum<T>(obj: any, value: string, defaultValue: T): T {
  return Object.values(obj).includes(value) ? value as unknown as T : defaultValue;
}