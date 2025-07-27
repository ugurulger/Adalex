"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "../types/form-types"

interface AlacakliBilgisiPageProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function AlacakliBilgisiPage({ formData, updateFormData }: AlacakliBilgisiPageProps) {
  const handleAlacakliTipiChange = (value: string) => {
    updateFormData({
      alacakliTipi: value,
      // Reset fields when type changes
      alacakliAdSoyad: "",
      alacakliTcKimlik: "",
      alacakliSirketUnvani: "",
      alacakliVergiNumarasi: "",
    })
  }

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="alacakli-tipi" className="text-sm font-medium">
                Alacaklı Tipi <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.alacakliTipi} onValueChange={handleAlacakliTipiChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Alacaklı tipini seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gercek_kisi">Gerçek Kişi</SelectItem>
                  <SelectItem value="tuzel_kisi">Tüzel Kişi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.alacakliTipi === "gercek_kisi" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alacakli-ad-soyad" className="text-sm font-medium">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="alacakli-ad-soyad"
                      value={formData.alacakliAdSoyad}
                      onChange={(e) => updateFormData({ alacakliAdSoyad: e.target.value })}
                      placeholder="Ad ve soyadını giriniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alacakli-tc-kimlik" className="text-sm font-medium">
                      TC Kimlik No <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="alacakli-tc-kimlik"
                      value={formData.alacakliTcKimlik}
                      onChange={(e) => updateFormData({ alacakliTcKimlik: e.target.value })}
                      placeholder="TC Kimlik numarasını giriniz"
                      maxLength={11}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.alacakliTipi === "tuzel_kisi" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alacakli-sirket-unvani" className="text-sm font-medium">
                      Şirket Ünvanı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="alacakli-sirket-unvani"
                      value={formData.alacakliSirketUnvani}
                      onChange={(e) => updateFormData({ alacakliSirketUnvani: e.target.value })}
                      placeholder="Şirket ünvanını giriniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alacakli-vergi-numarasi" className="text-sm font-medium">
                      Vergi Numarası <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="alacakli-vergi-numarasi"
                      value={formData.alacakliVergiNumarasi}
                      onChange={(e) => updateFormData({ alacakliVergiNumarasi: e.target.value })}
                      placeholder="Vergi numarasını giriniz"
                      maxLength={10}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.alacakliTipi && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="alacakli-telefon" className="text-sm font-medium">
                    Telefon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="alacakli-telefon"
                    value={formData.alacakliTelefon}
                    onChange={(e) => updateFormData({ alacakliTelefon: e.target.value })}
                    placeholder="Telefon numarasını giriniz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alacakli-adres" className="text-sm font-medium">
                    Adres <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="alacakli-adres"
                    value={formData.alacakliAdres}
                    onChange={(e) => updateFormData({ alacakliAdres: e.target.value })}
                    placeholder="Adres bilgilerini giriniz"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
