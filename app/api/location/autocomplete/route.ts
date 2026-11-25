import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const requestedLang = searchParams.get("lang")?.toLowerCase();
    const cookieLang = req.cookies.get("googtrans")?.value?.includes("bg") ? "bg" : "en";
    const lang = requestedLang === "bg" || cookieLang === "bg" ? "bg" : "en";

    if (!query || query.length < 2) {
      return apiSuccess([]);
    }

    // Call OpenStreetMap Nominatim with Bulgarian bias, language preference, and polite User-Agent
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", query);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("countrycodes", "bg");
    nominatimUrl.searchParams.set("limit", "5");
    nominatimUrl.searchParams.set("accept-language", lang);

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "DomicCare/1.0 (support@domiccare.bg)",
        "Accept-Language": lang === "bg" ? "bg,en;q=0.5" : "en,bg;q=0.5",
      },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!res.ok) {
      console.error("[GET /api/location/autocomplete] Nominatim error:", res.status, res.statusText);
      return apiError(
        "LOCATION_SERVICE_ERROR",
        "Location service temporarily unavailable. You can enter the address manually.",
        502
      );
    }

    const rawData = (await res.json()) as NominatimPlace[];

    const suggestions = rawData.map((item) => {
      const city =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality ||
        "";
      const street = item.address?.road || "";
      return {
        id: String(item.place_id),
        displayName: item.display_name,
        city,
        street,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
    });

    return apiSuccess(suggestions);
  } catch (err: any) {
    console.error("[GET /api/location/autocomplete] Unhandled error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve address suggestions", 500);
  }
}
