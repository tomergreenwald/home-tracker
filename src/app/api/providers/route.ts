import { NextResponse } from "next/server";
import { getProviders } from "@/lib/reference";

export async function GET() {
  const providers = await getProviders();
  return NextResponse.json(providers);
}
