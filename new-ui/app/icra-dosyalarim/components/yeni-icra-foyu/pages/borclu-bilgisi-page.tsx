"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "../types/form-types"

interface BorcluBilgisiPageProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function BorcluBilgisiPage({ formData, updateFormData }: BorcluBilgisiPageProps) {
  const handleBorcluTipiChange = (value: string) => {
    updateFormData({
      borcluTipi: value,
      // Reset fields when type changes
      borcluAdSoyad: "",
      borcluTcKimlik: "",
      borcluSirketUnvani: "",
      borcluVergiNumarasi: "",
    })
  }

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="borclu-tipi" className="text-sm font-medium">
                Borçlu Tipi <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.borcluTipi} onValueChange={handleBorcluTipiChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Borçlu tipini seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gercek_kisi">Gerçek Kişi</SelectItem>
                  <SelectItem value="tuzel_kisi">Tüzel Kişi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.borcluTipi === "gercek_kisi" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borclu-ad-soyad" className="text-sm font-medium">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="borclu-ad-soyad"
                      value={formData.borcluAdSoyad}
                      onChange={(e) => updateFormData({ borcluAdSoyad: e.target.value })}
                      placeholder="Ad ve soyadını giriniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borclu-tc-kimlik" className="text-sm font-medium">
                      TC Kimlik No <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="borclu-tc-kimlik"
                      value={formData.borcluTcKimlik}
                      onChange={(e) => updateFormData({ borcluTcKimlik: e.target.value })}
                      placeholder="TC Kimlik numarasını giriniz"
                      maxLength={11}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.borcluTipi === "tuzel_kisi" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borclu-sirket-unvani" className="text-sm font-medium">
                      Şirket Ünvanı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="borclu-sirket-unvani"
                      value={formData.borcluSirketUnvani}
                      onChange={(e) => updateFormData({ borcluSirketUnvani: e.target.value })}
                      placeholder="Şirket ünvanını giriniz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borclu-vergi-numarasi" className="text-sm font-medium">
                      Vergi Numarası <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="borclu-vergi-numarasi"
                      value={formData.borcluVergiNumarasi}
                      onChange={(e) => updateFormData({ borcluVergiNumarasi: e.target.value })}
                      placeholder="Vergi numarasını giriniz"
                      maxLength={10}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.borcluTipi && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="borclu-telefon" className="text-sm font-medium">
                    Telefon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="borclu-telefon"
                    value={formData.borcluTelefon}
                    onChange={(e) => updateFormData({ borcluTelefon: e.target.value })}
                    placeholder="Telefon numarasını giriniz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borclu-adres" className="text-sm font-medium">
                    Adres <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="borclu-adres"
                    value={formData.borcluAdres}
                    onChange={(e) => updateFormData({ borcluAdres: e.target.value })}
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
