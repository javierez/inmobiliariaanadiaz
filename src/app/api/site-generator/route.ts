"use server";

import { type NextRequest, NextResponse } from "next/server";

const RAILWAY_URL =
  process.env.SITE_GENERATOR_URL ??
  "https://vesta-site-generator-production.up.railway.app";
const RAILWAY_KEY = process.env.SITE_GENERATOR_API_KEY ?? "";

async function proxyToRailway(path: string, init?: RequestInit) {
  const res = await fetch(`${RAILWAY_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAILWAY_KEY}`,
      ...init?.headers,
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/site-generator — trigger generation
export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToRailway("/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// GET /api/site-generator?jobId=xxx — check job status
// GET /api/site-generator — list all jobs
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  const path = jobId ? `/api/jobs/${jobId}` : "/api/jobs";
  return proxyToRailway(path);
}
