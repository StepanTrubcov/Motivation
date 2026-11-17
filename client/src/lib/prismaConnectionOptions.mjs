export function prismaConnectionUrl(value, limit = 3) {
  if (!value) return undefined;
  const url = new URL(value);
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit',String(Number.isInteger(limit) && limit>0 ? limit : 3));
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout','10');
  if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout','10');
  return url.toString();
}
