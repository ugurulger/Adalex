"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { IlamBilgileri, IlamKalemi } from "../types/form-types"

interface IlamBilgileriTabProps {
  data: IlamBilgileri
  onChange: (data: IlamBilgileri) => void
  errors?: Partial<IlamBilgileri>
  takipTuru: string
}

export default function IlamBilgileriTab({ data, onChange, errors, takipTuru }: IlamBilgileriTabProps) {
  const updateField = (field: keyof IlamBilgileri, value: any) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const addIlamKalemi = () => {
    const newKalem: IlamKalemi = {
      id: Math.max(...data.ilamKalemleri.map((k) => k.id), 0) + 1,
      kalemAdi: "",
      tutar: "",
      aciklama: "",
    }
    updateField("ilamKalemleri", [...data.ilamKalemleri, newKalem])
  }

  const removeIlamKalemi = (id: number) => {
    if (data.ilamKalemleri.length > 1) {
      updateField(
        "ilamKalemleri",
        data.ilamKalemleri.filter((kalem) => kalem.id !== id),
      )
    }
  }

  const updateIlamKalemi = (id: number, field: keyof IlamKalemi, value: any) => {
    updateField(
      "ilamKalemleri",
      data.ilamKalemleri.map((kalem) =>
        kalem.id === id
          ? {
              ...kalem,
              [field]: value,
            }
          : kalem,
      ),
    )
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.,]/g, "")
    return numericValue
  }

  // İlamlı takip değilse bu sekmeyi gösterme
  if (takipTuru !== "2") {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">İlam Bilgileri</h3>
          <p className="text-gray-600">Bu bölüm sadece İlamlı İcra Takibi için gereklidir.</p>
          <p className="text-sm text-gray-500 mt-2">Seçtiğiniz takip türü için bu bilgileri girmenize gerek yoktur.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* İlam Genel Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚖️ İlam Genel Bilgileri
            <span className="text-sm font-normal text-gray-500">(İlamlı Takip İçin Zorunlu)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mahkeme Adı */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Mahkeme Adı *</Label>
              <Input
                value={data.mahkemeAdi}
                onChange={(e) => updateField("mahkemeAdi", e.target.value)}
                placeholder="Örn: İstanbul 1. Asliye Hukuk Mahkemesi"
                className={errors?.mahkemeAdi ? "border-red-500" : ""}
              />
              {errors?.mahkemeAdi && <p className="text-sm text-red-600">{errors.mahkemeAdi}</p>}
            </div>

            {/* Karar Yılı */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Karar Yılı *</Label>
              <Input
                value={data.kararYili}
                onChange={(e) => updateField("kararYili", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="2024"
                maxLength={4}
                className={errors?.kararYili ? "border-red-500" : ""}
              />
              {errors?.kararYili && <p className="text-sm text-red-600">{errors.kararYili}</p>}
            </div>

            {/* Dosya Numarası */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Dosya Numarası *</Label>
              <Input
                value={data.dosyaNo}
                onChange={(e) => updateField("dosyaNo", e.target.value)}
                placeholder="Örn: 2024/123 Esas"
                className={errors?.dosyaNo ? "border-red-500" : ""}
              />
              {errors?.dosyaNo && <p className="text-sm text-red-600">{errors.dosyaNo}</p>}
            </div>

            {/* Karar Tarihi */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Karar Tarihi *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors?.kararTarihi ? "border-red-500" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.kararTarihi ? format(data.kararTarihi, "dd.MM.yyyy", { locale: tr }) : "Tarih seçiniz"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.kararTarihi}
                    onSelect={(date) => updateField("kararTarihi", date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors?.kararTarihi && <p className="text-sm text-red-600">{errors.kararTarihi}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İlam Kalemleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">💰 İlam Kalemleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.ilamKalemleri.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Henüz ilam kalemi eklenmemiş</p>
              <Button onClick={addIlamKalemi} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                İlk Kalemi Ekle
              </Button>
            </div>
          )}

          {data.ilamKalemleri.map((kalem, index) => (
            <div key={kalem.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">İlam Kalemi #{index + 1}</h4>
                {data.ilamKalemleri.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeIlamKalemi(kalem.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kalem Adı */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Kalem Adı *</Label>
                  <Input
                    value={kalem.kalemAdi}
                    onChange={(e) => updateIlamKalemi(kalem.id, "kalemAdi", e.target.value)}
                    placeholder="Örn: Ana Para, Vekalet Ücreti, Yargılama Gideri"
                  />
                </div>

                {/* Tutar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tutar (TL) *</Label>
                  <Input
                    value={kalem.tutar}
                    onChange={(e) => updateIlamKalemi(kalem.id, "tutar", formatCurrency(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Açıklama</Label>
                <Textarea
                  value={kalem.aciklama}
                  onChange={(e) => updateIlamKalemi(kalem.id, "aciklama", e.target.value)}
                  placeholder="İlam kalemi ile ilgili açıklama..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          {data.ilamKalemleri.length > 0 && (
            <div className="flex justify-center">
              <Button onClick={addIlamKalemi} variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Kalem Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 İlam Bilgileri Hakkında</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• İlam bilgileri mahkeme kararında yazılan bilgilerle birebir uyumlu olmalıdır</li>
          <li>• İlam kalemleri mahkeme kararında belirtilen tüm kalemleri içermelidir</li>
          <li>• Karar tarihi, ilamın kesinleşme tarihinden önce olmalıdır</li>
          <li>• Dosya numarası mahkeme kayıtlarında bulunan numara ile aynı olmalıdır</li>
        </ul>
      </div>
    </div>
  )
}
