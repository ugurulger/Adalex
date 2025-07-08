"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TalepAciklamasi } from "../types/form-types"

interface TalepAciklamasiTabProps {
  data: TalepAciklamasi
  onChange: (data: TalepAciklamasi) => void
  errors?: Partial<TalepAciklamasi>
  takipTuru: string
}

export default function TalepAciklamasiTab({ data, onChange, errors, takipTuru }: TalepAciklamasiTabProps) {
  const updateField = (field: keyof TalepAciklamasi, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const icraYollari = [
    { value: "genel", label: "Genel Haciz Yolu" },
    { value: "ozel", label: "Özel Haciz Yolu" },
    { value: "tahliye", label: "Tahliye Yolu" },
  ]

  const talepTipleri = [
    { value: "odeme", label: "Ödeme Talebi" },
    { value: "tahliye", label: "Tahliye Talebi" },
    { value: "teslim", label: "Teslim Talebi" },
    { value: "ifaya_davet", label: "İfaya Davet" },
  ]

  // Takip türüne göre varsayılan talep metni
  const getDefaultTalepMetni = (takipTuru: string) => {
    switch (takipTuru) {
      case "1":
        return `Sayın İcra Müd������rü,

Borçlu/borçlulardan alacağımızın tahsili için İcra ve İflas Kanunu'nun 68. maddesi gereğince ilamsız icra takibi başlatılmasını talep ederiz.

Alacağımızın yasal faizi ile birlikte tahsil edilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      case "2":
        return `Sayın İcra Müdürü,

Ekli ilam gereğince borçlu/borçlulardan alacağımızın tahsili için İcra ve İflas Kanunu'nun 32. maddesi gereğince ilamlı icra takibi başlatılmasını talep ederiz.

İlamda belirtilen miktarın yasal faizi ile birlikte tahsil edilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      case "3":
        return `Sayın İcra Müdürü,

Kiracı/kiracıların tahliyesi için İcra ve İflas Kanunu'nun 68. maddesi gereğince ilamsız tahliye takibi başlatılmasını talep ederiz.

Tahliye işleminin en kısa sürede gerçekleştirilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      case "4":
        return `Sayın İcra Müdürü,

İpotekli taşınmazın satışı suretiyle alacağımızın tahsili için İcra ve İflas Kanunu'nun 145. maddesi gereğince ipotek takibi başlatılmasını talep ederiz.

Alacağımızın yasal faizi ile birlikte tahsil edilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      case "5":
        return `Sayın İcra Müdürü,

Rehinli taşınırın satışı suretiyle alacağımızın tahsili için İcra ve İflas Kanunu'nun 155. maddesi gereğince rehin takibi başlatılmasını talep ederiz.

Alacağımızın yasal faizi ile birlikte tahsil edilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      case "6":
        return `Sayın İcra Müdürü,

Kambiyo senedinden doğan alacağımızın tahsili için İcra ve İflas Kanunu'nun 167. maddesi gereğince kambiyo senetleri takibi başlatılmasını talep ederiz.

Senet bedelinin yasal faizi ile birlikte tahsil edilmesini, takip masraflarının borçludan alınmasını saygılarımızla arz ederiz.`

      default:
        return ""
    }
  }

  // Takip türü değiştiğinde varsayılan talep metnini ayarla
  useEffect(() => {
    if (takipTuru && !data.talepMetni) {
      updateField("talepMetni", getDefaultTalepMetni(takipTuru))
    }
  }, [takipTuru, data.talepMetni])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Talep Açıklaması
            <span className="text-sm font-normal text-gray-500">(Zorunlu Alanlar)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İcra Yolu */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">İcra Yolu *</Label>
              <Select value={data.icraYolu} onValueChange={(value) => updateField("icraYolu", value)}>
                <SelectTrigger className={errors?.icraYolu ? "border-red-500" : ""}>
                  <SelectValue placeholder="İcra yolunu seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {icraYollari.map((yol) => (
                    <SelectItem key={yol.value} value={yol.value}>
                      {yol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.icraYolu && <p className="text-sm text-red-600">{errors.icraYolu}</p>}
            </div>

            {/* Talep Tipi */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Talep Tipi *</Label>
              <Select value={data.talepTipi} onValueChange={(value) => updateField("talepTipi", value)}>
                <SelectTrigger className={errors?.talepTipi ? "border-red-500" : ""}>
                  <SelectValue placeholder="Talep tipini seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {talepTipleri.map((tip) => (
                    <SelectItem key={tip.value} value={tip.value}>
                      {tip.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.talepTipi && <p className="text-sm text-red-600">{errors.talepTipi}</p>}
            </div>
          </div>

          {/* Talep Metni */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Talep Metni *</Label>
            <Textarea
              value={data.talepMetni}
              onChange={(e) => updateField("talepMetni", e.target.value)}
              placeholder="İcra müdürlüğüne yapılacak talep metnini giriniz..."
              rows={12}
              className={`font-mono text-sm ${errors?.talepMetni ? "border-red-500" : ""}`}
            />
            {errors?.talepMetni && <p className="text-sm text-red-600">{errors.talepMetni}</p>}
            <p className="text-xs text-gray-500">
              Talep metni otomatik olarak seçilen takip türüne göre oluşturulmuştur. Gerekirse düzenleyebilirsiniz.
            </p>
          </div>

          {/* 48/e-9 Açıklaması */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              İİK 48/e-9 Maddesi Gereği Açıklama
              <span className="text-xs text-gray-500 ml-2">(Gerekirse)</span>
            </Label>
            <Textarea
              value={data.aciklama48e9}
              onChange={(e) => updateField("aciklama48e9", e.target.value)}
              placeholder="İcra ve İflas Kanunu'nun 48/e-9 maddesi gereği yapılacak açıklama..."
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Bu alan sadece İİK 48/e-9 maddesi kapsamında açıklama yapılması gerektiğinde doldurulur.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h4 className="font-medium text-orange-900 mb-2">💡 Talep Açıklaması Hakkında</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Talep metni icra müdürlüğüne gönderilecek resmi dilekçenin içeriğidir</li>
          <li>• Seçilen takip türüne göre otomatik olarak uygun metin oluşturulur</li>
          <li>• Gerekirse talep metnini özel durumunuza göre düzenleyebilirsiniz</li>
          <li>• Hukuki terimler ve ifadeler doğru kullanılmalıdır</li>
        </ul>
      </div>
    </div>
  )
}
