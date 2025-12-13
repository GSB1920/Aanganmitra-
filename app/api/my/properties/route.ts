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

  let q = supabase
    .from("properties")
    .select("id,title,city,property_type,area_sqft,asking_price")
    .eq("created_by", user.id)
    .range(from, to);

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
      for (const r of pics) {
        const arr = byProp[r.property_id] || (byProp[r.property_id] = []);
        const raw = r.image_url || "";
        const match = raw.match(/\/property-images\/(.+)$/);
        const rel = match ? match[1] : raw;
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(rel, 3600);
        const url = signed?.signedUrl ?? raw;
        arr.push(url);
        if (!covers[r.property_id]) covers[r.property_id] = url;
      }
      photosMap = byProp;
    }
    const missing = ids.filter((id) => !covers[id]);
    if (missing.length > 0) {
      const bucket = "property-images";
      for (const id of missing) {
        const { data: files } = await supabase.storage.from(bucket).list(`${id}`, { limit: 5 });
        if (files && files.length > 0) {
          const signedUrls: string[] = [];
          for (const f of files) {
            const path = `${id}/${f.name}`;
            const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
            if (signed?.signedUrl) signedUrls.push(signed.signedUrl);
          }
          if (signedUrls.length > 0) {
            covers[id] = signedUrls[0];
            photosMap[id] = signedUrls;
          }
        }
      }
    }
  }

  return NextResponse.json({ items: data ?? [], covers, photosMap });
}
