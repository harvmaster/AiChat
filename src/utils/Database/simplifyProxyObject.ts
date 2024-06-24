export const simplifyProxyObject = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(simplifyProxyObject) as any;
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, simplifyProxyObject(value)])) as any;
}

export default simplifyProxyObject;