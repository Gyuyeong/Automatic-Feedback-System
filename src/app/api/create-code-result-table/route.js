import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const result =
            await sql`CREATE TABLE IF NOT EXISTS Code_Result ( id SERIAL PRIMARY KEY, Code TEXT NOT NULL, Image BYTEA )`;
        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}