import { NextResponse } from "next/server"

export async function GET(request: Request, context: { params: Promise<{ file_id: string; borclu_id: string }> }) {
  try {
    const { file_id, borclu_id } = await context.params

    if (!file_id || !borclu_id) {
      return NextResponse.json({ error: "file_id and borclu_id parameters are required" }, { status: 400 })
    }

    // Proxy to Flask API
    const flaskApiUrl = process.env.FLASK_API_URL || "http://localhost:5001"
    const response = await fetch(`${flaskApiUrl}/api/icra-dosyalarim/${file_id}/${borclu_id}/arac-sorgulama`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching arac-sorgulama data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}