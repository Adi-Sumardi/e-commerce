import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchBiteshipAreas } from "@/lib/biteship";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const areas = await searchBiteshipAreas(query);
    return NextResponse.json({ areas });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mencari area." },
      { status: 502 }
    );
  }
}
