import { NextResponse } from "next/server"
import { icraDosyalariSampleData } from "../../icra-dosyalarim/components/uyap-icra-detay-modal/utils/sample-data"

// GET /api/icra-dosyalarim - Get list of all files
export async function GET() {
  try {
    console.log("API: Fetching icra dosyalari list")
    console.log("Sample data length:", icraDosyalariSampleData.length)
    console.log("First item structure:", JSON.stringify(icraDosyalariSampleData[0], null, 2))

    // Transform sample data to API response format
    const listData = icraDosyalariSampleData.map((item) => ({
      file_id: item.file_id, // Use file_id directly from sample data
      klasor: item.klasor,
      dosyaNo: item.no,
      borcluAdi: item.borcluAdi,
      alacakliAdi: item.alacakliAdi,
      foyTuru: item.foyTuru,
      durum: item.durum,
      takipTarihi: item.takipTarihi,
      icraMudurlugu: item.icraMudurlugu,
    }))

    console.log("Transformed data first item:", JSON.stringify(listData[0], null, 2))
    return NextResponse.json(listData)
  } catch (error) {
    console.error("Error fetching files list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
