import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const requestedLang = searchParams.get("lang")?.toLowerCase();
    const cookieLang = req.cookies.get("googtrans")?.value?.includes("bg") ? "bg" : "en";
    const lang = requestedLang === "bg" || cookieLang === "bg" ? "bg" : "en";

    if (!lat || !lon) {
      return apiError("INVALID_PARAMS", "Both 'lat' and 'lon' query parameters are required", 400);
    }

    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    nominatimUrl.searchParams.set("lat", lat);
    nominatimUrl.searchParams.set("lon", lon);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("accept-language", lang);

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "DomicCare/1.0 (support@domiccare.bg)",
        "Accept-Language": lang === "bg" ? "bg,en;q=0.5" : "en,bg;q=0.5",
      },
    });

    if (!res.ok) {
      console.error("[GET /api/location/reverse] Nominatim error:", res.status, res.statusText);
      return apiError(
        "LOCATION_SERVICE_ERROR",
        "Could not determine location from coordinates",
        502
      );
    }

    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.state || "";
    const street = addr.road ? `${addr.road}${addr.house_number ? " " + addr.house_number : ""}` : "";
    
    // Format a concise clean label for the primary care area or address
    const conciseArea = [city, addr.country || "Bulgaria"].filter(Boolean).join(", ");
    const fullAddress = data.display_name || conciseArea;

    return apiSuccess({
      area: conciseArea || city,
      city,
      street,
      displayName: fullAddress,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    });
  } catch (err: any) {
    console.error("[GET /api/location/reverse] Error:", err);
    return apiError("INTERNAL_ERROR", "Failed to reverse geocode location", 500);
  }
}
