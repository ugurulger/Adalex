import { NextResponse } from "next/server"
import { icraDosyalariSampleData } from "../../../icra-dosyalarim/components/uyap-icra-detay-modal/utils/sample-data"

export async function GET(request: Request, context: { params: { file_id: string } }) {
  try {
    console.log("API: File detail called with context:", JSON.stringify(context, null, 2))

    const { file_id } = context.params
    console.log("Extracted file_id:", file_id)

    if (!file_id) {
      console.error("file_id parameter is missing")
      return NextResponse.json({ error: "file_id parameter is required" }, { status: 400 })
    }

    const fileId = Number.parseInt(file_id)
    console.log("Parsed file_id:", fileId)

    if (isNaN(fileId)) {
      console.error("Invalid file_id:", file_id)
      return NextResponse.json({ error: "Invalid file_id parameter" }, { status: 400 })
    }

    // Find the file in sample data using the file_id field
    const file = icraDosyalariSampleData.find((item) => item.file_id === fileId)
    console.log("Found file:", file ? `ID: ${file.file_id}, Klasor: ${file.klasor}` : "Not found")
    console.log(
      "Available file_ids:",
      icraDosyalariSampleData.map((item) => item.file_id),
    )

    if (!file) {
      console.error("File not found for file_id:", fileId)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Transform to API response format
    const detailData = {
      file_id: file.file_id,
      klasor: file.klasor,
      dosyaNo: file.no,
      borcluAdi: file.borcluAdi,
      alacakliAdi: file.alacakliAdi,
      foyTuru: file.foyTuru,
      durum: file.durum,
      takipTarihi: file.takipTarihi,
      icraMudurlugu: file.icraMudurlugu,
      takipSekli: file.takipSekli,
      alacakliVekili: file.alacakliVekili,
      borcMiktari: file.borcMiktari,
      faizOrani: file.faizOrani || "",
      guncelBorc: file.guncelBorc,
      borcluList:
        file.borcluList?.map((borclu, index) => ({
          borclu_id: borclu.borclu_id || (index + 1).toString(),
          file_id: file.file_id,
          ad: borclu.ad,
          tcKimlik: borclu.tcKimlik,
          telefon: borclu.telefon,
          adres: borclu.adres,
          vekil: borclu.vekil || "",
        })) || [],
    }

    console.log("Returning detail data for file_id:", detailData.file_id)
    return NextResponse.json(detailData)
  } catch (error) {
    console.error("Error fetching file detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
