import { NextResponse } from "next/server"

// Database API configuration
const DATABASE_API_BASE_URL = process.env.DATABASE_API_URL || "http://localhost:5001"

// GET /api/icra-dosyalarim - Get list of all files
export async function GET() {
  try {
    console.log("API: Fetching icra dosyalari list from database API")
    console.log("Database API URL:", DATABASE_API_BASE_URL)

    // Fetch data from the database API
    const response = await fetch(`${DATABASE_API_BASE_URL}/api/icra-dosyalarim`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error("Database API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: "Failed to fetch data from database" }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("Database API response length:", data.length)
    
    if (data.length > 0) {
      console.log("First item structure:", JSON.stringify(data[0], null, 2))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching files list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
