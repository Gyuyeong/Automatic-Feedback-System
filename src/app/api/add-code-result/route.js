import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const codeValue = searchParams.get("codeValue");

    try {
        if (!codeValue) throw new Error("codeValue required");
        await sql`INSERT INTO Code_Results (Code) VALUES (${codeValue})`;
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ codeValue }, { status: 200 });  // return the codeValue
}