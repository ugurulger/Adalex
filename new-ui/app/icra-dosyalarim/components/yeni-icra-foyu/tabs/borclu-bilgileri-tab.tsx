"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { BorcluBilgileri } from "../types/form-types"
import { adresTurleri, iller, getIlcelerByIl } from "../utils/address-data"

interface BorcluBilgileriTabProps {
  data: BorcluBilgileri[]
  onChange: (data: BorcluBilgileri[]) => void
  errors?: Array<Partial<BorcluBilgileri>>
}

export default function BorcluBilgileriTab({ data, onChange, errors }: BorcluBilgileriTabProps) {
  const addBorclu = () => {
    const newBorclu: BorcluBilgileri = {
      id: Math.max(...data.map((b) => b.id), 0) + 1,
      tcknVkn: "",
      adSoyad: "",
      adresBilgisi: {
        adresTuru: "",
        il: "",
        ilce: "",
        adres: "",
      },
      rol: "BORÇLU",
    }
    onChange([...data, newBorclu])
  }

  const removeBorclu = (id: number) => {
    if (data.length > 1) {
      onChange(data.filter((borclu) => borclu.id !== id))
    }
  }

  const updateBorclu = (id: number, field: keyof BorcluBilgileri, value: any) => {
    onChange(
      data.map((borclu) =>
        borclu.id === id
          ? {
              ...borclu,
              [field]: value,
            }
          : borclu,
      ),
    )
  }

  const updateBorcluAddress = (id: number, field: keyof BorcluBilgileri["adresBilgisi"], value: string) => {
    onChange(
      data.map((borclu) =>
        borclu.id === id
          ? {
              ...borclu,
              adresBilgisi: {
                ...borclu.adresBilgisi,
                [field]: value,
                // Reset ilçe when il changes
                ...(field === "il" && { ilce: "" }),
              },
            }
          : borclu,
      ),
    )
  }

  const formatTcknVkn = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    return numericValue.slice(0, 11)
  }

  const rolOptions = [
    { value: "BORÇLU", label: "Borçlu" },
    { value: "KEFIL", label: "Kefil" },
    { value: "MÜTESELSIL_BORÇLU", label: "Müteselsil Borçlu" },
  ]

  return (
    <div className="space-y-6">
      {data.map((borclu, index) => {
        const borcluErrors = errors?.[index] || {}
        return (
          <Card key={borclu.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  👤 Borçlu #{index + 1}
                  {index === 0 && <span className="text-sm font-normal text-gray-500">(Ana Borçlu)</span>}
                </div>
                {data.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBorclu(borclu.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TCKN/VKN */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">T.C. Kimlik No / Vergi Kimlik No *</Label>
                  <Input
                    value={borclu.tcknVkn}
                    onChange={(e) => updateBorclu(borclu.id, "tcknVkn", formatTcknVkn(e.target.value))}
                    placeholder="12345678901"
                    maxLength={11}
                    className={borcluErrors.tcknVkn ? "border-red-500" : ""}
                  />
                  {borcluErrors.tcknVkn && <p className="text-sm text-red-600">{borcluErrors.tcknVkn}</p>}
                </div>

                {/* Ad Soyad / Kurum Adı */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Ad Soyad / Kurum Adı *</Label>
                  <Input
                    value={borclu.adSoyad}
                    onChange={(e) => updateBorclu(borclu.id, "adSoyad", e.target.value)}
                    placeholder="Mehmet Demir / XYZ Ltd. Şti."
                    className={borcluErrors.adSoyad ? "border-red-500" : ""}
                  />
                  {borcluErrors.adSoyad && <p className="text-sm text-red-600">{borcluErrors.adSoyad}</p>}
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Rol</Label>
                  <Select value={borclu.rol} onValueChange={(value) => updateBorclu(borclu.id, "rol", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rolOptions.map((rol) => (
                        <SelectItem key={rol.value} value={rol.value}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Adres Bilgisi */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">📍 Adres Bilgisi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Adres Türü */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Adres Türü *</Label>
                    <Select
                      value={borclu.adresBilgisi.adresTuru}
                      onValueChange={(value) => updateBorcluAddress(borclu.id, "adresTuru", value)}
                    >
                      <SelectTrigger className={borcluErrors.adresBilgisi?.adresTuru ? "border-red-500" : ""}>
                        <SelectValue placeholder="Adres türünü seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {adresTurleri.map((tur) => (
                          <SelectItem key={tur.value} value={tur.value}>
                            {tur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {borcluErrors.adresBilgisi?.adresTuru && (
                      <p className="text-sm text-red-600">{borcluErrors.adresBilgisi.adresTuru}</p>
                    )}
                  </div>

                  {/* İl */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">İl *</Label>
                    <Select
                      value={borclu.adresBilgisi.il}
                      onValueChange={(value) => updateBorcluAddress(borclu.id, "il", value)}
                    >
                      <SelectTrigger className={borcluErrors.adresBilgisi?.il ? "border-red-500" : ""}>
                        <SelectValue placeholder="İl seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {iller.map((il) => (
                          <SelectItem key={il.value} value={il.value}>
                            {il.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {borcluErrors.adresBilgisi?.il && (
                      <p className="text-sm text-red-600">{borcluErrors.adresBilgisi.il}</p>
                    )}
                  </div>

                  {/* İlçe */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">İlçe *</Label>
                    <Select
                      value={borclu.adresBilgisi.ilce}
                      onValueChange={(value) => updateBorcluAddress(borclu.id, "ilce", value)}
                      disabled={!borclu.adresBilgisi.il}
                    >
                      <SelectTrigger className={borcluErrors.adresBilgisi?.ilce ? "border-red-500" : ""}>
                        <SelectValue placeholder="İlçe seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getIlcelerByIl(borclu.adresBilgisi.il).map((ilce) => (
                          <SelectItem key={ilce.value} value={ilce.value}>
                            {ilce.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {borcluErrors.adresBilgisi?.ilce && (
                      <p className="text-sm text-red-600">{borcluErrors.adresBilgisi.ilce}</p>
                    )}
                  </div>
                </div>

                {/* Adres */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Adres *</Label>
                  <Textarea
                    value={borclu.adresBilgisi.adres}
                    onChange={(e) => updateBorcluAddress(borclu.id, "adres", e.target.value)}
                    placeholder="Açık adres bilgisini giriniz (Mahalle, Sokak, Bina No, Daire No vb.)"
                    rows={3}
                    className={borcluErrors.adresBilgisi?.adres ? "border-red-500" : ""}
                  />
                  {borcluErrors.adresBilgisi?.adres && (
                    <p className="text-sm text-red-600">{borcluErrors.adresBilgisi.adres}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Borçlu Ekle Butonu */}
      <div className="flex justify-center">
        <Button onClick={addBorclu} variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Borçlu Ekle
        </Button>
      </div>

      {/* Bilgi Notu */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Borçlu Bilgileri Hakkında</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ana borçlu mutlaka girilmelidir</li>
          <li>• Kefil veya müteselsil borçlu varsa ekleyebilirsiniz</li>
          <li>• Tüm borçlular için güncel adres bilgisi önemlidir</li>
          <li>• Tebligat işlemleri bu adres bilgilerine göre yapılacaktır</li>
        </ul>
      </div>
    </div>
  )
}
