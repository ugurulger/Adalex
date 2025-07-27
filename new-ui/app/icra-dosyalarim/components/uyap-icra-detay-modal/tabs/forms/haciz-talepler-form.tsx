"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { bankaListesi } from "../../utils/banka-listesi"
import { adliyeListesi } from "../../utils/adliye-listesi"

interface HacizTaleplerFormProps {
  selectedTalepTuru: string
}

const hesapTipleri = [
  "Vadesiz Türk Parası Hesabı",
  "Yatırım Hesabı Serbest Bakiye",
  "Vadesiz Yabancı Para Hesabı",
  "Kıymetli Maden Hesabı (Vadesiz Altın Hesabı Dahil)",
  "B Tipi Yatırım Fonu (B Tipi Likit ve Kısa Vadeli Tahvil-Bono Fonu)",
  "Hazine Bonosu & Devlet Tahvili (TL)",
  "Repo",
  "Diğer Fonlar ve A Tipi Yatırım Fonu",
  "Vadeli Türk Parası Hesabı",
  "Vadeli Yabancı Para Hesabı",
  "Kıymetli Maden Hesabı (Vadeli Altın Hesabı dahil)",
  "Anapara Koruma Amaçlı ve Anapara Garantili Fonlar",
  "Hisse Senedi",
  "Diğer (Hazine Bonosu & Devlet Tahvili/YP), Eurobond, VOB, Özel Sektör Tahvili v.b. menkul kıymetler)",
  "Alış Satış Emri Olan Kıymetler (Niteliği Değişebilen Varlıklar)",
]

const calismaDurumlari = ["Çalışan Kamu", "Çalışan Özel", "Emekli Kamu", "Emekli Özel"]

const maasHacizSecenekleri = [
  "Maaşın 1/4'u",
  "Tazminatlarının, Sosyal Hak ve Alacaklarının Tamamı",
  "Emekli İkramiyesinin Haczi",
  "Nafaka İse Aylık Nafaka Tutarı",
]

const sehirler = Object.keys(adliyeListesi)

export default function HacizTaleplerForm({ selectedTalepTuru }: HacizTaleplerFormProps) {
  const [selectedBankalar, setSelectedBankalar] = useState<string[]>([])
  const [selectedHesapTipleri, setSelectedHesapTipleri] = useState<string[]>([])
  const [hacizTuru, setHacizTuru] = useState<string>("haciz-muzekkere")
  const [tebligTarihi, setTebligTarihi] = useState<Date>()
  const [maasHariç, setMaasHariç] = useState<boolean>(true)
  const [calismaDurumu, setCalismaDurumu] = useState<string>("")
  const [maasVerenKurum, setMaasVerenKurum] = useState<string>("")
  const [selectedMaasHacizSecenekleri, setSelectedMaasHacizSecenekleri] = useState<string[]>([])
  const [nafakaTutari, setNafakaTutari] = useState<string>("")
  const [aciklama, setAciklama] = useState<string>("")
  const [selectedSehir, setSelectedSehir] = useState<string>("")
  const [selectedAdliye, setSelectedAdliye] = useState<string>("")
  const [otomatikImzala, setOtomatikImzala] = useState<boolean>(true)

  const handleBankaChange = (banka: string, checked: boolean) => {
    if (checked) {
      setSelectedBankalar([...selectedBankalar, banka])
    } else {
      setSelectedBankalar(selectedBankalar.filter((b) => b !== banka))
    }
  }

  const handleHesapTipiChange = (hesapTipi: string, checked: boolean) => {
    if (checked) {
      setSelectedHesapTipleri([...selectedHesapTipleri, hesapTipi])
    } else {
      setSelectedHesapTipleri(selectedHesapTipleri.filter((h) => h !== hesapTipi))
    }
  }

  const handleMaasHacizSecenekChange = (secenek: string, checked: boolean) => {
    if (checked) {
      setSelectedMaasHacizSecenekleri([...selectedMaasHacizSecenekleri, secenek])
    } else {
      setSelectedMaasHacizSecenekleri(selectedMaasHacizSecenekleri.filter((s) => s !== secenek))
    }
  }

  const renderBankaHacziForm = () => (
    <div className="space-y-6">
      {/* Banka Seç */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Banka Seç (Çoklu Seçim)</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
          {bankaListesi.map((banka) => (
            <div key={banka} className="flex items-center space-x-2">
              <Checkbox
                id={`banka-${banka}`}
                checked={selectedBankalar.includes(banka)}
                onCheckedChange={(checked) => handleBankaChange(banka, checked as boolean)}
              />
              <Label htmlFor={`banka-${banka}`} className="text-sm cursor-pointer">
                {banka}
              </Label>
            </div>
          ))}
        </div>
        {selectedBankalar.length > 0 && (
          <div className="text-xs text-gray-600">Seçilen bankalar: {selectedBankalar.join(", ")}</div>
        )}
      </div>

      {/* Hesap Seç */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Hesap Seç (Çoklu Seçim)</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
          {hesapTipleri.map((hesapTipi) => (
            <div key={hesapTipi} className="flex items-center space-x-2">
              <Checkbox
                id={`hesap-${hesapTipi}`}
                checked={selectedHesapTipleri.includes(hesapTipi)}
                onCheckedChange={(checked) => handleHesapTipiChange(hesapTipi, checked as boolean)}
              />
              <Label htmlFor={`hesap-${hesapTipi}`} className="text-sm cursor-pointer">
                {hesapTipi}
              </Label>
            </div>
          ))}
        </div>
        {selectedHesapTipleri.length > 0 && (
          <div className="text-xs text-gray-600">Seçilen hesap tipleri: {selectedHesapTipleri.join(", ")}</div>
        )}
      </div>

      {/* Radio Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Haciz Türü</Label>
        <RadioGroup value={hacizTuru} onValueChange={setHacizTuru}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="haciz-muzekkere" id="haciz-muzekkere" />
            <Label htmlFor="haciz-muzekkere">Haciz Müzekkeresi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="89-1-ihbarname" id="89-1-ihbarname" />
            <Label htmlFor="89-1-ihbarname">89/1 Haciz İhbarnamesi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="89-2-ihbarname" id="89-2-ihbarname" />
            <Label htmlFor="89-2-ihbarname">89/2 Haciz İhbarnamesi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="89-3-ihbarname" id="89-3-ihbarname" />
            <Label htmlFor="89-3-ihbarname">89/3 Haciz İhbarnamesi</Label>
          </div>
        </RadioGroup>
      </div>

      {/* 89/2 Haciz İhbarnamesi seçildiğinde */}
      {hacizTuru === "89-2-ihbarname" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">1. Haciz İhbarnamesi Tebliğ Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !tebligTarihi && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tebligTarihi ? format(tebligTarihi, "PPP", { locale: tr }) : "Tarih seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={tebligTarihi} onSelect={setTebligTarihi} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="maas-hesabi-haric" checked={maasHariç} onCheckedChange={setMaasHariç} />
            <Label htmlFor="maas-hesabi-haric">Maaş Hesabı Hariç</Label>
          </div>
        </div>
      )}
    </div>
  )

  const renderMaasHacziForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Çalışma Durumu</Label>
        <Select value={calismaDurumu} onValueChange={setCalismaDurumu}>
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

      {(calismaDurumu === "Çalışan Kamu" || calismaDurumu === "Çalışan Özel") && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Maaş Veren Kurum</Label>
          <Select value={maasVerenKurum} onValueChange={setMaasVerenKurum}>
            <SelectTrigger>
              <SelectValue placeholder="Kurum seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tbd">Aracı kurum (TBD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium">Haciz Seçenekleri (Çoklu Seçim)</Label>
        <div className="space-y-2">
          {maasHacizSecenekleri.map((secenek) => (
            <div key={secenek} className="flex items-center space-x-2">
              <Checkbox
                id={`maas-${secenek}`}
                checked={selectedMaasHacizSecenekleri.includes(secenek)}
                onCheckedChange={(checked) => handleMaasHacizSecenekChange(secenek, checked as boolean)}
              />
              <Label htmlFor={`maas-${secenek}`} className="text-sm cursor-pointer">
                {secenek}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedMaasHacizSecenekleri.includes("Nafaka İse Aylık Nafaka Tutarı") && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tutar</Label>
            <Input
              type="number"
              value={nafakaTutari}
              onChange={(e) => setNafakaTutari(e.target.value)}
              placeholder="Nafaka tutarını giriniz..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Açıklama</Label>
            <Textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Açıklama giriniz..."
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderModalBasedForm = (modalType: string) => (
    <div className="space-y-6">
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center text-gray-500 space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-base font-medium">{modalType} Tablosu</p>
          <p className="text-sm">
            {modalType} modalından çekilen tablo burada görüntülenecek ve son sütuna "Haciz Talebine Ekle" butonu
            eklenecek.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="otomatik-imzala" checked={otomatikImzala} onCheckedChange={setOtomatikImzala} />
        <Label htmlFor="otomatik-imzala">Evrakı otomatik imzala</Label>
      </div>
    </div>
  )

  const renderTasinirHacizForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Açıklama</Label>
        <Textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Taşınır haciz talebi açıklaması giriniz..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="otomatik-imzala" checked={otomatikImzala} onCheckedChange={setOtomatikImzala} />
        <Label htmlFor="otomatik-imzala">Evrakı otomatik imzala</Label>
      </div>
    </div>
  )

  const renderTasinirHacizTalimatiForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Şehir Seçiniz</Label>
        <Select value={selectedSehir} onValueChange={setSelectedSehir}>
          <SelectTrigger>
            <SelectValue placeholder="Şehir seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            {sehirler.map((sehir) => (
              <SelectItem key={sehir} value={sehir}>
                {sehir}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSehir && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Adliye Seçiniz</Label>
          <Select value={selectedAdliye} onValueChange={setSelectedAdliye}>
            <SelectTrigger>
              <SelectValue placeholder="Adliye seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {adliyeListesi[selectedSehir]?.map((adliye) => (
                <SelectItem key={adliye} value={adliye}>
                  {adliye}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )

  const renderIhbarnameForm = (ihbarnameType: string) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Dosyadaki 3. Şahıslar</Label>
        <Input placeholder="Şimdilik boş bırakılacak..." disabled />
      </div>

      {(ihbarnameType === "89-2" || ihbarnameType === "89-3") && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tebliğ Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !tebligTarihi && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tebligTarihi ? format(tebligTarihi, "PPP", { locale: tr }) : "Tarih seçiniz"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={tebligTarihi} onSelect={setTebligTarihi} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Adres Türü</Label>
        <Input placeholder="Şimdilik boş bırakılacak..." disabled />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Adres</Label>
        <Textarea placeholder="Şimdilik boş bırakılacak..." disabled rows={3} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Tebligat Türü</Label>
        <Input placeholder="Şimdilik boş bırakılacak..." disabled />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Takip Kesinleşmiş Diğer Borçlu Seç</Label>
        <Input placeholder="Şimdilik boş bırakılacak..." disabled />
      </div>
    </div>
  )

  const renderFormContent = () => {
    switch (selectedTalepTuru) {
      case "Banka Haczi Talebi":
        return renderBankaHacziForm()
      case "Maaş Haczi Talebi":
        return renderMaasHacziForm()
      case "Alacaklı Olduğu Dosya":
        return renderModalBasedForm("Gayrimenkul")
      case "Araç Haczi Talebi":
        return renderModalBasedForm("Araç")
      case "Posta Çeki Haczi Talebi":
        return renderModalBasedForm("Posta Çeki")
      case "Taşınır Haciz Talebi":
        return renderTasinirHacizForm()
      case "Taşınır Haciz Talimatı Talebi":
        return renderTasinirHacizTalimatiForm()
      case "SGK Mosip Haczi Talebi":
        return (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-base font-medium">Bu kısım kullanılmayacak</p>
              <p className="text-sm">SGK Mosip Haczi Talebi şu anda mevcut değil</p>
            </div>
          </div>
        )
      case "Gayrimenkul Haczi Talebi":
        return renderModalBasedForm("Gayrimenkul")
      case "89-1 İhbarname Talebi":
        return renderIhbarnameForm("89-1")
      case "89-2 İhbarname Talebi":
        return renderIhbarnameForm("89-2")
      case "89-3 İhbarname Talebi":
        return renderIhbarnameForm("89-3")
      default:
        return (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-base font-medium">Form İçeriği Hazırlanıyor</p>
              <p className="text-sm">"{selectedTalepTuru}" için form alanları hazırlanıyor</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderFormContent()}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            // Handle form submission
            console.log("Talep Ekle clicked for:", selectedTalepTuru)
          }}
        >
          Talep Ekle
        </Button>
      </div>
    </div>
  )
}
