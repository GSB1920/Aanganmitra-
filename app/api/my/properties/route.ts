import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "12");
  const query = (searchParams.get("q") ?? "").trim();
  const sort = (searchParams.get("sort") ?? "newest").trim();

  const from = page * limit;
  const to = from + limit - 1;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let q = supabase
    .from("properties")
    .select("id,title,city,property_type,area_sqft,asking_price,listing_type")
    .range(from, to);

  // Filter based on role
  // Admin & Internal: View All
  // Broker (or others): View Own Only
  if (profile?.role !== "admin" && profile?.role !== "internal") {
    q = q.eq("created_by", user.id);
  }

  if (query) q = q.ilike("title", `%${query}%`);
  switch (sort) {
    case "oldest":
      q = q.order("created_at", { ascending: true });
      break;
    case "price_asc":
      q = q.order("asking_price", { ascending: true });
      break;
    case "price_desc":
      q = q.order("asking_price", { ascending: false });
      break;
    case "area_desc":
      q = q.order("area_sqft", { ascending: false });
      break;
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (data ?? []).map((p) => p.id);
  let covers: Record<string, string> = {};
  let photosMap: Record<string, string[]> = {};
  if (ids.length > 0) {
    const { data: pics } = await supabase
      .from("property_photos")
      .select("property_id,image_url,order_index")
      .in("property_id", ids)
      .order("order_index", { ascending: true });
    if (pics && pics.length > 0) {
      const bucket = "property-images";
      const byProp: Record<string, string[]> = {};
      
      await Promise.all(pics.map(async (r) => {
        const raw = r.image_url || "";
        const match = raw.match(/\/property-images\/(.+)$/);
        const rel = match ? match[1] : raw;
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(rel, 3600);
        const url = signed?.signedUrl ?? raw;
        
        // We need to push to array, but parallel execution makes order unpredictable within the array if we just push.
        // However, we can group them first or just accept that order is maintained by the client if it sorts by something, 
        // but here we are building the map.
        // Let's use a temporary structure or just synchronized push (JS is single threaded event loop, so push is safe, but order of completion varies).
        // Since we want to preserve order_index, we should sort them later or process them in order.
        // Actually, pics is already ordered by order_index.
        // If we map to promises and await all, we get an array of results in the same order as pics.
        return { property_id: r.property_id, url };
      })).then((results) => {
        results.forEach(({ property_id, url }) => {
          const arr = byProp[property_id] || (byProp[property_id] = []);
          arr.push(url);
          if (!covers[property_id]) covers[property_id] = url;
        });
      });
      
      photosMap = byProp;
    }
    const missing = ids.filter((id) => !covers[id]);
    if (missing.length > 0) {
      const bucket = "property-images";
      await Promise.all(missing.map(async (id) => {
        const { data: files } = await supabase.storage.from(bucket).list(`${id}`, { limit: 5 });
        if (files && files.length > 0) {
          const signedUrls = await Promise.all(files.map(async (f) => {
            const path = `${id}/${f.name}`;
            const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
            return signed?.signedUrl;
          }));
          const validUrls = signedUrls.filter(Boolean) as string[];
          if (validUrls.length > 0) {
            covers[id] = validUrls[0];
            photosMap[id] = validUrls;
          }
        }
      }));
    }
  }

  return NextResponse.json({ items: data ?? [], covers, photosMap });
}
