"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TebligatTaleplerFormProps {
  selectedTalepTuru: string
}

const adresTurleri = [
  { value: "e-tebligat", label: "E-Tebligat Adresi" },
  { value: "mernis", label: "Mernis Adresi" },
  { value: "vekil-e-tebligat", label: "Vekilin E-Tebligat Adresi" },
  { value: "yeni-adres", label: "Yeni Adres" },
]

const malTipleri = [
  { value: "tasinmaz", label: "Taşınmaz" },
  { value: "tasit", label: "Taşıt" },
  { value: "tasinir", label: "Taşınır" },
]

const paraBirimleri = [
  { value: "TL", label: "TL - Türk Lirası" },
  { value: "USD", label: "USD - Amerikan Doları" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - İngiliz Sterlini" },
]

export default function TebligatTaleplerForm({ selectedTalepTuru }: TebligatTaleplerFormProps) {
  const [adresTuru, setAdresTuru] = useState<string>("")
  const [vekilListesi, setVekilListesi] = useState<string>("")
  const [adresBilgisi, setAdresBilgisi] = useState<string>("")
  const [tebligatTuru, setTebligatTuru] = useState<string>("")
  const [kiymetTakdirTarihi, setKiymetTakdirTarihi] = useState<string>("")
  const [malTuru, setMalTuru] = useState<string>("")
  const [aciklama, setAciklama] = useState<string>("")
  const [taahhutTarihi, setTaahhutTarihi] = useState<string>("")
  const [kismiTemlik, setKismiTemlik] = useState<string>("hayir")
  const [temlikTutari, setTemlikTutari] = useState<string>("")
  const [paraBirimi, setParaBirimi] = useState<string>("TL")
  const [alacakli, setAlacakli] = useState<string>("")
  const [temlikEdilen, setTemlikEdilen] = useState<string>("")
  const [hacizTarihi, setHacizTarihi] = useState<string>("")

  // Reset form when talep türü changes
  useEffect(() => {
    setAdresTuru("")
    setVekilListesi("")
    setAdresBilgisi("")
    setTebligatTuru("")
    setKiymetTakdirTarihi("")
    setMalTuru("")
    setAciklama("")
    setTaahhutTarihi("")
    setKismiTemlik("hayir")
    setTemlikTutari("")
    setParaBirimi("TL")
    setAlacakli("")
    setTemlikEdilen("")
    setHacizTarihi("")
  }, [selectedTalepTuru])

  const getTebligatTurleri = () => {
    switch (adresTuru) {
      case "e-tebligat":
        return [{ value: "e-tebligat", label: "E-Tebligat" }]
      case "mernis":
        return [
          { value: "normal", label: "Normal Tebligat" },
          { value: "tk-21-2-serhli", label: "T.K.21/2 Şerhli" },
          { value: "hizli", label: "Hızlı Tebligat" },
          { value: "tk-21-2-serhli-hizli", label: "T.K.21/2 Şerhli Hızlı" },
        ]
      case "yeni-adres":
        return [
          { value: "normal", label: "Normal Tebligat" },
          { value: "hizli", label: "Hızlı Tebligat" },
        ]
      case "vekil-e-tebligat":
        return [{ value: "e-tebligat", label: "E-Tebligat" }]
      default:
        return []
    }
  }

  const renderCommonFields = () => (
    <>
      {/* Adres Türü */}
      <div className="space-y-2">
        <Label htmlFor="adres-turu" className="text-sm font-medium">
          Adres Türü
        </Label>
        <Select value={adresTuru} onValueChange={setAdresTuru}>
          <SelectTrigger id="adres-turu" className="w-full">
            <SelectValue placeholder="Adres türü seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            {adresTurleri.map((tur) => (
              <SelectItem key={tur.value} value={tur.value}>
                {tur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vekil Listesi */}
      <div className="space-y-2">
        <Label htmlFor="vekil-listesi" className="text-sm font-medium">
          Vekil Listesi
        </Label>
        <Select value={vekilListesi} onValueChange={setVekilListesi}>
          <SelectTrigger id="vekil-listesi" className="w-full">
            <SelectValue placeholder="Vekil seçiniz..." />
          </SelectTrigger>
          <SelectContent>{/* Borclu Vekili listesi database'den gelecek. Şimdilik boş */}</SelectContent>
        </Select>
      </div>

      {/* Adres Bilgisi - Only enabled when Yeni Adres is selected */}
      <div className="space-y-2">
        <Label htmlFor="adres-bilgisi" className="text-sm font-medium">
          Adres Bilgisi
        </Label>
        <Textarea
          id="adres-bilgisi"
          placeholder="Adres bilgisini giriniz..."
          value={adresBilgisi}
          onChange={(e) => setAdresBilgisi(e.target.value)}
          disabled={adresTuru !== "yeni-adres"}
          className="min-h-[80px]"
        />
      </div>

      {/* Tebligat Türü */}
      <div className="space-y-2">
        <Label htmlFor="tebligat-turu" className="text-sm font-medium">
          Tebligat Türü
        </Label>
        <Select value={tebligatTuru} onValueChange={setTebligatTuru} disabled={!adresTuru}>
          <SelectTrigger id="tebligat-turu" className="w-full">
            <SelectValue placeholder={adresTuru ? "Tebligat türü seçiniz..." : "Önce adres türü seçiniz..."} />
          </SelectTrigger>
          <SelectContent>
            {getTebligatTurleri().map((tur) => (
              <SelectItem key={tur.value} value={tur.value}>
                {tur.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const renderSpecificFields = () => {
    switch (selectedTalepTuru) {
      case "Bakiye Borç Muhtırasınin Tebliğe Çıkartılması":
        return null // Only common fields

      case "Kıymet Takdirinin Tebliğe Çıkartılması":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="kiymet-takdir-tarihi" className="text-sm font-medium">
                Kıymet Takdir Tarihi
              </Label>
              <Input
                id="kiymet-takdir-tarihi"
                type="date"
                value={kiymetTakdirTarihi}
                onChange={(e) => setKiymetTakdirTarihi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mal-turu" className="text-sm font-medium">
                Mal Türü
              </Label>
              <Select value={malTuru} onValueChange={setMalTuru}>
                <SelectTrigger id="mal-turu" className="w-full">
                  <SelectValue placeholder="Mal türü seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip.value} value={tip.value}>
                      {tip.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aciklama" className="text-sm font-medium">
                Açıklama
              </Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )

      case "Taahhudu Kabul Muhtırası Tebliği":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="taahhut-tarihi" className="text-sm font-medium">
                Taahhüt Tarihi
              </Label>
              <Input
                id="taahhut-tarihi"
                type="date"
                value={taahhutTarihi}
                onChange={(e) => setTaahhutTarihi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aciklama" className="text-sm font-medium">
                Açıklama
              </Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )

      case "Temlik Bilgisinin Bildirilmesi":
        return (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Kısmi Temlik</Label>
              <RadioGroup value={kismiTemlik} onValueChange={setKismiTemlik} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evet" id="kismi-temlik-evet" />
                  <Label htmlFor="kismi-temlik-evet" className="text-sm">
                    Evet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hayir" id="kismi-temlik-hayir" />
                  <Label htmlFor="kismi-temlik-hayir" className="text-sm">
                    Hayır
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Temlik Tutarı / Para Birimi</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Temlik tutarı..."
                  type="number"
                  value={temlikTutari}
                  onChange={(e) => setTemlikTutari(e.target.value)}
                />
                <Select value={paraBirimi} onValueChange={setParaBirimi}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paraBirimleri.map((birim) => (
                      <SelectItem key={birim.value} value={birim.value}>
                        {birim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alacakli" className="text-sm font-medium">
                Alacaklı
              </Label>
              <Input
                id="alacakli"
                placeholder="Dosyadaki Alacaklı - şimdilik boş"
                value={alacakli}
                onChange={(e) => setAlacakli(e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temlik-edilen" className="text-sm font-medium">
                Temlik Edilen
              </Label>
              <Textarea
                id="temlik-edilen"
                placeholder="Temlik edilen bilgisini giriniz..."
                value={temlikEdilen}
                onChange={(e) => setTemlikEdilen(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )

      case "Yenileme Emrinin Tebliğe Çıkartılması":
      case "icra/Ödeme Emrinin Tebliğe Çıkartılması":
        return null // Only common fields

      case "103 Davetiyesinin Tebliğe Çıkartılması":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="haciz-tarihi" className="text-sm font-medium">
                Haciz Tarihi
              </Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={hacizTarihi}
                onChange={(e) => setHacizTarihi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mal-tipi" className="text-sm font-medium">
                Mal Tipi
              </Label>
              <Select value={malTuru} onValueChange={setMalTuru}>
                <SelectTrigger id="mal-tipi" className="w-full">
                  <SelectValue placeholder="Mal tipi seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip.value} value={tip.value}>
                      {tip.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aciklama" className="text-sm font-medium">
                Açıklama
              </Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderCommonFields()}
        {renderSpecificFields()}
      </div>
    </div>
  )
}
