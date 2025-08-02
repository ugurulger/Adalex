"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { getProvinces, getCourthouses } from "../../utils/adliye-listesi"
import { bankaListesi } from "../../utils/banka-listesi"

interface GenelTaleplerFormProps {
  selectedTalepTuru: string
}

const malTipleri = ["Taşınmaz", "Taşıt", "Taşınır"]

const kapanmaNedenleri = [
  "İnfaz",
  "Takipsizlik",
  "Vazgeçme/Feragat",
  "Haricen Tahsil",
  "Aciz Vesikası",
  "Yetkisizlik",
  "Takipte İflas Yolunun Seçilmesi",
  "Takibin İptali",
  "Rehin Açığı Belgesi",
  "Birleştirme",
  "İİK.150/e Maddesi Gereğince Takibin Düşmesi",
  "İİK.193. Madde Gereği Zaman Aşımı (İİK 39)",
  "KHK Gereği Düşme",
  "7420 Sayılı Kanunun Geçici 3.Maddesi Kapsamında Feragat",
]

const calismaDurumlari = ["Çalışan Kamu", "Çalışan Özel", "Emekli Kamu", "Emekli Özel"]

export default function GenelTaleplerForm({ selectedTalepTuru }: GenelTaleplerFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [selectedBankalar, setSelectedBankalar] = useState<string[]>([])
  const [selectedIl, setSelectedIl] = useState<string>("")

  const provinces = getProvinces()
  const courthouses = selectedIl ? getCourthouses(selectedIl) : []

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleBankaSelection = (banka: string, checked: boolean) => {
    if (checked) {
      setSelectedBankalar((prev) => [...prev, banka])
    } else {
      setSelectedBankalar((prev) => prev.filter((b) => b !== banka))
    }
  }

  const renderFormFields = () => {
    switch (selectedTalepTuru) {
      case "Aciz Belgesi Hazırlanması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Araç Üzerindeki Haciz Şerhinin Kaldırılması":
      case "Araç Üzerindeki Yakalama Şerhinin Kaldırılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="plaka">Plaka</Label>
              <Input
                id="plaka"
                placeholder="Plaka giriniz..."
                value={formData.plaka || ""}
                onChange={(e) => handleInputChange("plaka", e.target.value)}
              />
            </div>
          </div>
        )

      case "Bankadan Hacizli Paranın İstenilmesi":
        return (
          <div className="space-y-4">
            <div>
              <Label>Banka Seç (Çoklu Seçim)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {bankaListesi.map((banka) => (
                  <div key={banka} className="flex items-center space-x-2">
                    <Checkbox
                      id={banka}
                      checked={selectedBankalar.includes(banka)}
                      onCheckedChange={(checked) => handleBankaSelection(banka, checked as boolean)}
                    />
                    <Label htmlFor={banka} className="text-sm">
                      {banka}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Borçlu Tarafından Yapılan Ödemelerin Hesaba Aktarılması":
      case "Dosyadaki Avansın İadesi":
        return (
          <div className="space-y-4">
            <div>
              <Label>Hesap Kime Ait</Label>
              <RadioGroup
                value={formData.hesapSahibi || ""}
                onValueChange={(value) => handleInputChange("hesapSahibi", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alacakli" id="alacakli" />
                  <Label htmlFor="alacakli">Alacaklı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vekil" id="vekil" />
                  <Label htmlFor="vekil">Vekil</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="iban">IBAN No</Label>
              <Input
                id="iban"
                placeholder="TR______"
                value={formData.iban || ""}
                onChange={(e) => handleInputChange("iban", e.target.value)}
              />
            </div>
          </div>
        )

      case "Dosya Hesabının Yapılması ve Dosyaya Kaydedilmesi":
      case "Takibin Kesinleşmesi":
        return (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">Bu talep türü için herhangi bir ek bilgi gerekmemektedir.</p>
          </div>
        )

      case "Dosyada Hacizli Malın Satışı":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mal-tipi">Mal Tipi</Label>
              <Select value={formData.malTipi || ""} onValueChange={(value) => handleInputChange("malTipi", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Mal tipi seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip} value={tip}>
                      {tip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Dosyadaki Hacizlerin Kaldırılması":
      case "İİK.121. Maddeye Göre Yetki Verilmesi":
      case "İİK.150/C Şerhi Eklenmesi":
      case "Rehinin Paraya Çevrilmesi Şerhi Talebi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Dosyadaki IBAN Bilgisinin Güncellenmesi":
        return (
          <div className="space-y-4">
            <div>
              <Label>Hesap Kime Ait</Label>
              <RadioGroup
                value={formData.hesapSahibi || ""}
                onValueChange={(value) => handleInputChange("hesapSahibi", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alacakli" id="alacakli" />
                  <Label htmlFor="alacakli">Alacaklı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vekil" id="vekil" />
                  <Label htmlFor="vekil">Vekil</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case "Dosyanın İşlemden Kaldırılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="kapanma-nedeni">Kapanma Nedeni</Label>
              <Select
                value={formData.kapanmaNedeni || ""}
                onValueChange={(value) => handleInputChange("kapanmaNedeni", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kapanma nedeni seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {kapanmaNedenleri.map((neden) => (
                    <SelectItem key={neden} value={neden}>
                      {neden}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Dosyanın Yetkili İcra Dairesine Gönderilmesi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="il">İl</Label>
              <Select value={selectedIl} onValueChange={setSelectedIl}>
                <SelectTrigger>
                  <SelectValue placeholder="İl seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adliye">Adliye</Label>
              <Select
                value={formData.adliye || ""}
                onValueChange={(value) => handleInputChange("adliye", value)}
                disabled={!selectedIl}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedIl ? "Adliye seçiniz..." : "Önce il seçiniz..."} />
                </SelectTrigger>
                <SelectContent>
                  {courthouses.map((courthouse) => (
                    <SelectItem key={courthouse} value={courthouse}>
                      {courthouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Hacizli Malın Kıymet Takdiri için Talimat Yazılması":
      case "Hacizli Malın Satışı için Talimat Yazılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mal-tipi">Mal Tipi</Label>
              <Select value={formData.malTipi || ""} onValueChange={(value) => handleInputChange("malTipi", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Mal tipi seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip} value={tip}>
                      {tip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="il">İl</Label>
              <Select value={selectedIl} onValueChange={setSelectedIl}>
                <SelectTrigger>
                  <SelectValue placeholder="İl seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adliye">Adliye</Label>
              <Select
                value={formData.adliye || ""}
                onValueChange={(value) => handleInputChange("adliye", value)}
                disabled={!selectedIl}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedIl ? "Adliye seçiniz..." : "Önce il seçiniz..."} />
                </SelectTrigger>
                <SelectContent>
                  {courthouses.map((courthouse) => (
                    <SelectItem key={courthouse} value={courthouse}>
                      {courthouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Hacizli Taşınır Malların Muhafaza Altına Alınması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
          </div>
        )

      case "Haricen Tahsilat Bildirimi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tahsilat-tarihi">Tahsilat Tarihi</Label>
              <Input
                id="tahsilat-tarihi"
                type="date"
                value={formData.tahsilatTarihi || ""}
                onChange={(e) => handleInputChange("tahsilatTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tahsilat-tutari">Tahsilat Tutarı</Label>
              <Input
                id="tahsilat-tutari"
                type="number"
                placeholder="Tutar giriniz..."
                value={formData.tahsilatTutari || ""}
                onChange={(e) => handleInputChange("tahsilatTutari", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Kıymet Takdirinin Yapılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mal-tipi">Mal Tipi</Label>
              <Select value={formData.malTipi || ""} onValueChange={(value) => handleInputChange("malTipi", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Mal tipi seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip} value={tip}>
                      {tip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Maaş Üzerindeki Hacizlerin Kaldırılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="calisma-durumu">Çalışma Durumu</Label>
              <Select
                value={formData.calismaDurumu || ""}
                onValueChange={(value) => handleInputChange("calismaDurumu", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Çalışma durumu seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {calismaDurumlari.map((durum) => (
                    <SelectItem key={durum} value={durum}>
                      {durum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Muhafaza Altındaki Malların Haciz Baki Kalarak Yeddiemin Değişikliği":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="muhafaza-tarihi">Muhafaza Tarihi</Label>
              <Input
                id="muhafaza-tarihi"
                type="date"
                value={formData.muhafazaTarihi || ""}
                onChange={(e) => handleInputChange("muhafazaTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="yeni-yeddiemin">Yeni Yeddiemin Ad/Soyad - TC/Vergi No</Label>
              <Input
                id="yeni-yeddiemin"
                placeholder="Ad/Soyad - TC/Vergi No giriniz..."
                value={formData.yeniYeddiemin || ""}
                onChange={(e) => handleInputChange("yeniYeddiemin", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Rehin Açığı Belgesi Hazırlanması":
        return (
          <div className="space-y-4">
            <div>
              <Label>Belge Tipi</Label>
              <RadioGroup
                value={formData.belgeTipi || ""}
                onValueChange={(value) => handleInputChange("belgeTipi", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gecici" id="gecici" />
                  <Label htmlFor="gecici">Geçici Rehin Açığı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kesin" id="kesin" />
                  <Label htmlFor="kesin">Kesin Rehin Açığı</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "Taşınmaz Haczinin Kaldırılması":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="haciz-tarihi">Haciz Tarihi</Label>
              <Input
                id="haciz-tarihi"
                type="date"
                value={formData.hacizTarihi || ""}
                onChange={(e) => handleInputChange("hacizTarihi", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      case "100. Maddeye Yarar Bilgi İstenilmesi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mal-tipi">Mal Tipi</Label>
              <Select value={formData.malTipi || ""} onValueChange={(value) => handleInputChange("malTipi", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Mal tipi seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {malTipleri.map((tip) => (
                    <SelectItem key={tip} value={tip}>
                      {tip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Açıklama giriniz..."
                value={formData.aciklama || ""}
                onChange={(e) => handleInputChange("aciklama", e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">Bu talep türü için form henüz hazırlanmamıştır.</p>
          </div>
        )
    }
  }

  return <div className="p-6 bg-white rounded-lg border">{renderFormFields()}</div>
}
