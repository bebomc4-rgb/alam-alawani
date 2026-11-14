// صور المنتجات من نفس الموقع مع كاش دائم على Cloudflare
export async function onRequest({ params, request, waitUntil }) {
  const id = String(params.id || '').replace(/\D/g, '');
  if (!id) return new Response('bad', { status: 400 });
  const u = new URL(request.url);
  const w = Math.min(1600, Math.max(100, parseInt(u.searchParams.get('w') || '600')));
  const h = Math.min(2000, Math.max(100, parseInt(u.searchParams.get('h') || String(w))));
  const cache = caches.default;
  const key = new Request(`https://img.cache/${id}/${w}x${h}`);
  let res = await cache.match(key);
  if (res) return res;
  const src = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;
  const r = await fetch(src, { headers: { Accept: 'image/webp,image/*' }, cf: { cacheTtl: 31536000, cacheEverything: true } });
  if (!r.ok) return Response.redirect(new URL(`/p/${id}.webp`, u).toString(), 302);
  res = new Response(r.body, { headers: { 'Content-Type': r.headers.get('Content-Type') || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' } });
  waitUntil(cache.put(key, res.clone()));
  return res;
}
