"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AlacakliBilgileri } from "../types/form-types"
import { adresTurleri, iller, getIlcelerByIl } from "../utils/address-data"

interface AlacakliBilgileriTabProps {
  data: AlacakliBilgileri
  onChange: (data: AlacakliBilgileri) => void
  errors?: Partial<AlacakliBilgileri>
}

export default function AlacakliBilgileriTab({ data, onChange, errors }: AlacakliBilgileriTabProps) {
  const updateField = (field: keyof AlacakliBilgileri, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const updateAddressField = (field: keyof typeof data.adresBilgisi, value: string) => {
    onChange({
      ...data,
      adresBilgisi: {
        ...data.adresBilgisi,
        [field]: value,
        // Reset ilçe when il changes
        ...(field === "il" && { ilce: "" }),
      },
    })
  }

  const formatTcknVkn = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "")
    // Limit to 11 digits for TCKN or 10 digits for VKN
    return numericValue.slice(0, 11)
  }

  const formatPhone = (value: string) => {
    // Remove non-numeric characters except +
    const numericValue = value.replace(/[^\d+]/g, "")
    return numericValue
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏢 Alacaklı Bilgileri
            <span className="text-sm font-normal text-gray-500">(Zorunlu Alanlar)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TCKN/VKN */}
            <div className="space-y-2">
              <Label htmlFor="tcknVkn" className="text-sm font-medium text-gray-700">
                T.C. Kimlik No / Vergi Kimlik No *
              </Label>
              <Input
                id="tcknVkn"
                value={data.tcknVkn}
                onChange={(e) => updateField("tcknVkn", formatTcknVkn(e.target.value))}
                placeholder="12345678901"
                maxLength={11}
                className={errors?.tcknVkn ? "border-red-500" : ""}
              />
              {errors?.tcknVkn && <p className="text-sm text-red-600">{errors.tcknVkn}</p>}
              <p className="text-xs text-gray-500">Gerçek kişi için 11 haneli TCKN, tüzel kişi için 10 haneli VKN</p>
            </div>

            {/* Ad Soyad / Kurum Adı */}
            <div className="space-y-2">
              <Label htmlFor="adSoyad" className="text-sm font-medium text-gray-700">
                Ad Soyad / Kurum Adı *
              </Label>
              <Input
                id="adSoyad"
                value={data.adSoyad}
                onChange={(e) => updateField("adSoyad", e.target.value)}
                placeholder="Ahmet Yılmaz / ABC Şirketi Ltd. Şti."
                className={errors?.adSoyad ? "border-red-500" : ""}
              />
              {errors?.adSoyad && <p className="text-sm text-red-600">{errors.adSoyad}</p>}
            </div>

            {/* Telefon */}
            <div className="space-y-2">
              <Label htmlFor="telefon" className="text-sm font-medium text-gray-700">
                Telefon
              </Label>
              <Input
                id="telefon"
                value={data.telefon || ""}
                onChange={(e) => updateField("telefon", formatPhone(e.target.value))}
                placeholder="0212 123 45 67"
                className={errors?.telefon ? "border-red-500" : ""}
              />
              {errors?.telefon && <p className="text-sm text-red-600">{errors.telefon}</p>}
            </div>

            {/* Cep Telefonu */}
            <div className="space-y-2">
              <Label htmlFor="cepTelefonu" className="text-sm font-medium text-gray-700">
                Cep Telefonu
              </Label>
              <Input
                id="cepTelefonu"
                value={data.cepTelefonu || ""}
                onChange={(e) => updateField("cepTelefonu", formatPhone(e.target.value))}
                placeholder="0532 123 45 67"
                className={errors?.cepTelefonu ? "border-red-500" : ""}
              />
              {errors?.cepTelefonu && <p className="text-sm text-red-600">{errors.cepTelefonu}</p>}
            </div>

            {/* E-posta */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-posta Adresi
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="ornek@email.com"
                className={errors?.email ? "border-red-500" : ""}
              />
              {errors?.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adres Bilgisi Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📍 Adres Bilgisi
            <span className="text-sm font-normal text-gray-500">(Zorunlu)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Adres Türü */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Adres Türü *</Label>
              <Select
                value={data.adresBilgisi.adresTuru}
                onValueChange={(value) => updateAddressField("adresTuru", value)}
              >
                <SelectTrigger className={errors?.adresBilgisi?.adresTuru ? "border-red-500" : ""}>
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
              {errors?.adresBilgisi?.adresTuru && (
                <p className="text-sm text-red-600">{errors.adresBilgisi.adresTuru}</p>
              )}
            </div>

            {/* İl */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">İl *</Label>
              <Select value={data.adresBilgisi.il} onValueChange={(value) => updateAddressField("il", value)}>
                <SelectTrigger className={errors?.adresBilgisi?.il ? "border-red-500" : ""}>
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
              {errors?.adresBilgisi?.il && <p className="text-sm text-red-600">{errors.adresBilgisi.il}</p>}
            </div>

            {/* İlçe */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">İlçe *</Label>
              <Select
                value={data.adresBilgisi.ilce}
                onValueChange={(value) => updateAddressField("ilce", value)}
                disabled={!data.adresBilgisi.il}
              >
                <SelectTrigger className={errors?.adresBilgisi?.ilce ? "border-red-500" : ""}>
                  <SelectValue placeholder="İlçe seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {getIlcelerByIl(data.adresBilgisi.il).map((ilce) => (
                    <SelectItem key={ilce.value} value={ilce.value}>
                      {ilce.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.adresBilgisi?.ilce && <p className="text-sm text-red-600">{errors.adresBilgisi.ilce}</p>}
              {!data.adresBilgisi.il && <p className="text-xs text-gray-500">Önce il seçiniz</p>}
            </div>
          </div>

          {/* Adres */}
          <div className="space-y-2">
            <Label htmlFor="adres" className="text-sm font-medium text-gray-700">
              Adres *
            </Label>
            <Textarea
              id="adres"
              value={data.adresBilgisi.adres}
              onChange={(e) => updateAddressField("adres", e.target.value)}
              placeholder="Açık adres bilgisini giriniz (Mahalle, Sokak, Bina No, Daire No vb.)"
              rows={4}
              className={errors?.adresBilgisi?.adres ? "border-red-500" : ""}
            />
            {errors?.adresBilgisi?.adres && <p className="text-sm text-red-600">{errors.adresBilgisi.adres}</p>}
            <p className="text-xs text-gray-500">
              Tebligat için kullanılacak tam adres bilgisini eksiksiz olarak giriniz
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Notu */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Önemli Bilgi</h4>
        <p className="text-sm text-yellow-700">
          Alacaklı bilgileri, icra takibinin başlatılması ve tebligat işlemleri için kullanılacaktır. Lütfen tüm
          bilgilerin doğru ve güncel olduğundan emin olunuz.
        </p>
      </div>
    </div>
  )
}
