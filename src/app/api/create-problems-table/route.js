import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = 
      await sql`CREATE TABLE IF NOT EXISTS Problems (id SERIAL PRIMARY KEY, Name TEXT NOT NULL, Problem TEXT NOT NULL, Requirements TEXT, Answer TEXT NOT NULL);`;
    return NextResponse.json({result}, {status:200});
  } catch (error) {
    return NextResponse.json({error}, {status:500});
  }
}