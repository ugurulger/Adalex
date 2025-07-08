import { NextResponse } from "next/server"
import { gibSorguSonucuData } from "../../../../../icra-dosyalarim/components/uyap-icra-detay-modal/utils/sample-data"

export async function GET(request: Request, context: { params: { file_id: string; borclu_id: string } }) {
  try {
    const { file_id, borclu_id } = context.params

    if (!file_id || !borclu_id) {
      return NextResponse.json({ error: "file_id and borclu_id parameters are required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    const response = {
      file_id: Number.parseInt(file_id),
      borclu_id: Number.parseInt(borclu_id),
      gibSorguSonucu: gibSorguSonucuData,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching GIB data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
