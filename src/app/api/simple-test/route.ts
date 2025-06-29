import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Simple test working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    message: "POST test working",
    timestamp: new Date().toISOString(),
  });
}
