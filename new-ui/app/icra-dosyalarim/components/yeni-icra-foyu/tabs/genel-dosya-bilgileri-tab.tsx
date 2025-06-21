"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { GenelBilgiler } from "../types/form-types"

interface GenelDosyaBilgileriTabProps {
  data: GenelBilgiler
  onChange: (data: GenelBilgiler) => void
  errors?: Partial<GenelBilgiler>
}

export default function GenelDosyaBilgileriTab({ data, onChange, errors }: GenelDosyaBilgileriTabProps) {
  const takipTurleri = [
    { value: "1", label: "İlamsız İcra Takibi" },
    { value: "2", label: "İlamlı İcra Takibi" },
    { value: "3", label: "İlamsız Tahliye Takibi" },
    { value: "4", label: "İpotek Takibi" },
    { value: "5", label: "Rehin Takibi" },
    { value: "6", label: "Kambiyo Senetleri Takibi" },
  ]

  const updateField = (field: keyof GenelBilgiler, value: any) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Genel Dosya Bilgileri
          <span className="text-sm font-normal text-gray-500">(Zorunlu Alanlar)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Takip Türü */}
          <div className="space-y-2">
            <Label htmlFor="takipTuru" className="text-sm font-medium text-gray-700">
              Takip Türü *
            </Label>
            <Select value={data.takipTuru} onValueChange={(value) => updateField("takipTuru", value)}>
              <SelectTrigger className={errors?.takipTuru ? "border-red-500" : ""}>
                <SelectValue placeholder="Takip türünü seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {takipTurleri.map((tur) => (
                  <SelectItem key={tur.value} value={tur.value}>
                    {tur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.takipTuru && <p className="text-sm text-red-600">{errors.takipTuru}</p>}
          </div>

          {/* Dosya Tipi */}
          <div className="space-y-2">
            <Label htmlFor="dosyaTipi" className="text-sm font-medium text-gray-700">
              Dosya Tipi *
            </Label>
            <Input
              id="dosyaTipi"
              value={data.dosyaTipi}
              onChange={(e) => updateField("dosyaTipi", e.target.value)}
              placeholder="Örn: Alacak Takibi, Tahliye Takibi"
              className={errors?.dosyaTipi ? "border-red-500" : ""}
            />
            {errors?.dosyaTipi && <p className="text-sm text-red-600">{errors.dosyaTipi}</p>}
          </div>

          {/* Takip Tarihi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Takip Tarihi *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors?.takipTarihi ? "border-red-500" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.takipTarihi ? format(data.takipTarihi, "dd.MM.yyyy", { locale: tr }) : "Tarih seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.takipTarihi}
                  onSelect={(date) => updateField("takipTarihi", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors?.takipTarihi && <p className="text-sm text-red-600">{errors.takipTarihi}</p>}
          </div>

          {/* Mahiyet Kodu */}
          <div className="space-y-2">
            <Label htmlFor="mahiyetKodu" className="text-sm font-medium text-gray-700">
              Mahiyet Kodu
            </Label>
            <Input
              id="mahiyetKodu"
              value={data.mahiyetKodu}
              onChange={(e) => updateField("mahiyetKodu", e.target.value)}
              placeholder="Mahiyet kodunu giriniz"
              className={errors?.mahiyetKodu ? "border-red-500" : ""}
            />
            {errors?.mahiyetKodu && <p className="text-sm text-red-600">{errors.mahiyetKodu}</p>}
          </div>
        </div>

        {/* Açıklama */}
        <div className="space-y-2">
          <Label htmlFor="aciklama" className="text-sm font-medium text-gray-700">
            Genel Açıklama
          </Label>
          <Textarea
            id="aciklama"
            value={data.aciklama}
            onChange={(e) => updateField("aciklama", e.target.value)}
            placeholder="Dosya ile ilgili genel açıklamalarınızı buraya yazabilirsiniz..."
            rows={4}
            className={errors?.aciklama ? "border-red-500" : ""}
          />
          {errors?.aciklama && <p className="text-sm text-red-600">{errors.aciklama}</p>}
        </div>

        {/* Takip Türü Bilgi Kartı */}
        {data.takipTuru && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              {takipTurleri.find((t) => t.value === data.takipTuru)?.label} Hakkında
            </h4>
            <p className="text-sm text-blue-700">
              {data.takipTuru === "1" &&
                "İlamsız icra takibi, mahkeme kararı olmaksızın başlatılan takip türüdür. Borçlu 7 gün içinde itiraz edebilir."}
              {data.takipTuru === "2" &&
                "İlamlı icra takibi, mahkeme kararı veya icra edilebilir belge ile başlatılan takip türüdür."}
              {data.takipTuru === "3" &&
                "İlamsız tahliye takibi, kira sözleşmesi sona eren kiracıların tahliyesi için başlatılır."}
              {data.takipTuru === "4" &&
                "İpotek takibi, ipotekli taşınmaz malların satışı için başlatılan özel takip türüdür."}
              {data.takipTuru === "5" && "Rehin takibi, rehinli taşınır malların satışı için başlatılan takip türüdür."}
              {data.takipTuru === "6" &&
                "Kambiyo senetleri takibi, çek, bono ve poliçe gibi senetler için özel takip türüdür."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
