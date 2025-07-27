"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import GenelTaleplerForm from "./forms/genel-talepler-form"
import TebligatTaleplerForm from "./forms/tebligat-talepler-form"
import HacizTaleplerForm from "./forms/haciz-talepler-form"

const talepTipleri = [
  { value: "haciz", label: "Haciz Talepleri" },
  { value: "tebligat", label: "Tebligat Talepleri" },
  { value: "genel", label: "Genel Talepler" },
]

const talepTurleri = {
  haciz: [
    "Alacaklı Olduğu Dosya",
    "Araç Haczi Talebi",
    "Banka Haczi Talebi",
    "Gayrimenkul Haczi Talebi",
    "Maaş Haczi Talebi",
    "Posta Çeki Haczi Talebi",
    "SGK Mosip Haczi Talebi",
    "Taşınır Haciz Talebi",
    "Taşınır Haciz Talimatı Talebi",
    "89-1 İhbarname Talebi",
    "89-2 İhbarname Talebi",
    "89-3 İhbarname Talebi",
  ],
  tebligat: [
    "Bakiye Borç Muhtırasınin Tebliğe Çıkartılması",
    "icra/Ödeme Emrinin Tebliğe Çıkartılması",
    "Kıymet Takdirinin Tebliğe Çıkartılması",
    "Taahhudu Kabul Muhtırası Tebliği",
    "Temlik Bilgisinin Bildirilmesi",
    "Yenileme Emrinin Tebliğe Çıkartılması",
    "103 Davetiyesinin Tebliğe Çıkartılması",
  ],
  genel: [
    "Aciz Belgesi Hazırlanması",
    "Araç Üzerindeki Haciz Şerhinin Kaldırılması",
    "Araç Üzerindeki Yakalama Şerhinin Kaldırılması",
    "Bankadan Hacizli Paranın İstenilmesi",
    "Borçlu Tarafından Yapılan Ödemelerin Hesaba Aktarılması",
    "Dosya Hesabının Yapılması ve Dosyaya Kaydedilmesi",
    "Dosyada Hacizli Malın Satışı",
    "Dosyadaki Avansın İadesi",
    "Dosyadaki Hacizlerin Kaldırılması",
    "Dosyadaki IBAN Bilgisinin Güncellenmesi",
    "Dosyanın İşlemden Kaldırılması",
    "Dosyanın Yetkili İcra Dairesine Gönderilmesi",
    "Hacizli Malın Kıymet Takdiri için Talimat Yazılması",
    "Hacizli Malın Satışı için Talimat Yazılması",
    "Hacizli Taşınır Malların Muhafaza Altına Alınması",
    "Haricen Tahsilat Bildirimi",
    "İİK.121. Maddeye Göre Yetki Verilmesi",
    "İİK.150/C Şerhi Eklenmesi",
    "Kıymet Takdirinin Yapılması",
    "Maaş Üzerindeki Hacizlerin Kaldırılması",
    "Muhafaza Altındaki Malların Haciz Baki Kalarak Yeddiemin Değişikliği",
    "Rehin Açığı Belgesi Hazırlanması",
    "Rehinin Paraya Çevrilmesi Şerhi Talebi",
    "Takibin Kesinleşmesi",
    "Taşınmaz Haczinin Kaldırılması",
    "100. Maddeye Yarar Bilgi İstenilmesi",
  ],
}

export default function EvrakOlusturTab() {
  const [selectedTalepTipi, setSelectedTalepTipi] = useState<string>("")
  const [selectedTalepTuru, setSelectedTalepTuru] = useState<string>("")

  const handleTalepTipiChange = (value: string) => {
    setSelectedTalepTipi(value)
    setSelectedTalepTuru("") // Reset talep türü when talep tipi changes
  }

  const currentTalepTurleri = selectedTalepTipi ? talepTurleri[selectedTalepTipi as keyof typeof talepTurleri] : []

  const renderFormContent = () => {
    if (!selectedTalepTipi || !selectedTalepTuru) {
      return (
        <div className="min-h-[300px] p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500 space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base font-medium">Form İçeriği Hazırlanıyor</p>
            <p className="text-sm">Talep tipi ve türü seçildikten sonra ilgili form alanları burada görüntülenecek</p>
          </div>
        </div>
      )
    }

    // Render specific forms based on selection
    if (selectedTalepTipi === "haciz") {
      return <HacizTaleplerForm selectedTalepTuru={selectedTalepTuru} />
    }

    if (selectedTalepTipi === "genel") {
      return <GenelTaleplerForm selectedTalepTuru={selectedTalepTuru} />
    }

    if (selectedTalepTipi === "tebligat") {
      return <TebligatTaleplerForm selectedTalepTuru={selectedTalepTuru} />
    }

    // Placeholder for other form types
    return (
      <div className="min-h-[300px] p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500 space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-base font-medium">Form İçeriği Hazırlanıyor</p>
          <p className="text-sm">"{selectedTalepTuru}" için form alanları yakında eklenecek</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dropdown Menus Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Talep Tipi Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="talep-tipi" className="text-sm font-medium">
              Talep Tipi Seçiniz
            </Label>
            <Select value={selectedTalepTipi} onValueChange={handleTalepTipiChange}>
              <SelectTrigger id="talep-tipi" className="w-full">
                <SelectValue placeholder="Talep tipi seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {talepTipleri.map((tip) => (
                  <SelectItem key={tip.value} value={tip.value}>
                    {tip.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Talep Türü Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="talep-turu" className="text-sm font-medium">
              Talep Türü Seçiniz
            </Label>
            <Select value={selectedTalepTuru} onValueChange={setSelectedTalepTuru} disabled={!selectedTalepTipi}>
              <SelectTrigger id="talep-turu" className="w-full">
                <SelectValue placeholder={selectedTalepTipi ? "Talep türü seçiniz..." : "Önce talep tipi seçiniz..."} />
              </SelectTrigger>
              <SelectContent>
                {currentTalepTurleri.map((tur, index) => (
                  <SelectItem key={index} value={tur}>
                    {tur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="space-y-4">{renderFormContent()}</div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline">İptal</Button>
        <Button className="bg-orange-600 hover:bg-orange-700" disabled={!selectedTalepTipi || !selectedTalepTuru}>
          Evrak Oluştur
        </Button>
      </div>
    </div>
  )
}
