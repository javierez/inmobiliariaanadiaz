import { getAboutProps } from "~/server/queries/about";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const aboutProps = getAboutProps();
    return NextResponse.json(aboutProps);
  } catch (error) {
    console.error("Error in about API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
