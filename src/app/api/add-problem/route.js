import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  const {searchParams} = new URL(request.url);
  const problem = searchParams.get('problem');
  const answer = searchParams.get('answer');

  try {
    if (!problem || !answer) throw new Error('problem and answer required');
    await sql`INSERT INTO Problems (Problem, Answer) VALUES (${problem}, ${answer});`;
  } catch (error) {
    return NextResponse.json({error}, {status: 500});
  }

  const problems = await sql`SELECT * FROM Problems;`;
  return NextResponse.json({problems}, {status: 200});
}