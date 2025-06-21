"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { VekilBilgileri } from "../types/form-types"

interface VekilBilgileriTabProps {
  data: VekilBilgileri
  onChange: (data: VekilBilgileri) => void
  errors?: Partial<VekilBilgileri>
}

export default function VekilBilgileriTab({ data, onChange, errors }: VekilBilgileriTabProps) {
  const updateField = (field: keyof VekilBilgileri, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const formatTckn = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    return numericValue.slice(0, 11)
  }

  const formatBaroNo = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    return numericValue
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👨‍💼 Vekil Bilgileri
            <span className="text-sm font-normal text-gray-500">(İsteğe Bağlı)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TCKN */}
            <div className="space-y-2">
              <Label htmlFor="tckn" className="text-sm font-medium text-gray-700">
                T.C. Kimlik Numarası
              </Label>
              <Input
                id="tckn"
                value={data.tckn}
                onChange={(e) => updateField("tckn", formatTckn(e.target.value))}
                placeholder="12345678901"
                maxLength={11}
                className={errors?.tckn ? "border-red-500" : ""}
              />
              {errors?.tckn && <p className="text-sm text-red-600">{errors.tckn}</p>}
            </div>

            {/* Ad Soyad */}
            <div className="space-y-2">
              <Label htmlFor="adSoyad" className="text-sm font-medium text-gray-700">
                Ad Soyad
              </Label>
              <Input
                id="adSoyad"
                value={data.adSoyad}
                onChange={(e) => updateField("adSoyad", e.target.value)}
                placeholder="Av. Fatma Demir"
                className={errors?.adSoyad ? "border-red-500" : ""}
              />
              {errors?.adSoyad && <p className="text-sm text-red-600">{errors.adSoyad}</p>}
            </div>

            {/* Baro Numarası */}
            <div className="space-y-2">
              <Label htmlFor="baroNo" className="text-sm font-medium text-gray-700">
                Baro Numarası
              </Label>
              <Input
                id="baroNo"
                value={data.baroNo}
                onChange={(e) => updateField("baroNo", formatBaroNo(e.target.value))}
                placeholder="12345"
                className={errors?.baroNo ? "border-red-500" : ""}
              />
              {errors?.baroNo && <p className="text-sm text-red-600">{errors.baroNo}</p>}
            </div>

            {/* Büro Adı */}
            <div className="space-y-2">
              <Label htmlFor="buroAdi" className="text-sm font-medium text-gray-700">
                Büro Adı
              </Label>
              <Input
                id="buroAdi"
                value={data.buroAdi}
                onChange={(e) => updateField("buroAdi", e.target.value)}
                placeholder="Prosedür Hukuk Bürosu"
                className={errors?.buroAdi ? "border-red-500" : ""}
              />
              {errors?.buroAdi && <p className="text-sm text-red-600">{errors.buroAdi}</p>}
            </div>
          </div>

          {/* Adres */}
          <div className="space-y-2">
            <Label htmlFor="adres" className="text-sm font-medium text-gray-700">
              Büro Adresi
            </Label>
            <Textarea
              id="adres"
              value={data.adres}
              onChange={(e) => updateField("adres", e.target.value)}
              placeholder="Büro adresini giriniz..."
              rows={4}
              className={errors?.adres ? "border-red-500" : ""}
            />
            {errors?.adres && <p className="text-sm text-red-600">{errors.adres}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-900 mb-2">💡 Vekil Bilgileri Hakkında</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Vekil bilgileri isteğe bağlıdır, boş bırakılabilir</li>
          <li>• Vekil atanması durumunda tüm tebligatlar vekile yapılır</li>
          <li>• Baro numarası ilgili baronun kayıtlarında bulunmalıdır</li>
          <li>• Vekalet belgesi ayrıca sisteme yüklenmelidir</li>
        </ul>
      </div>
    </div>
  )
}
