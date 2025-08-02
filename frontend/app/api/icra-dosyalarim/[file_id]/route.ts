import { NextResponse } from "next/server"

// Database API configuration
const DATABASE_API_BASE_URL = process.env.DATABASE_API_URL || "http://localhost:5001"

export async function GET(request: Request, context: { params: Promise<{ file_id: string }> }) {
  try {
    const { file_id } = await context.params
    if (!file_id) {
      return NextResponse.json({ error: "file_id parameter is required" }, { status: 400 })
    }

    // Fetch from the real database API
    const response = await fetch(`${DATABASE_API_BASE_URL}/api/icra-dosyalarim/${file_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file detail from database" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching file detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
