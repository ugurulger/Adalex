import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Proxy to Flask API
    const flaskApiUrl = process.env.FLASK_API_URL || "http://localhost:5001"
    const response = await fetch(`${flaskApiUrl}/api/uyap/trigger-sorgulama`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in trigger-sorgulama proxy:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Sorgulama sırasında hata oluştu" 
    }, { status: 500 })
  }
} 