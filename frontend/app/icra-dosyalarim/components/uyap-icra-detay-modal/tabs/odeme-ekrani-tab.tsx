"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "../utils/currency"

export default function OdemeEkraniTab() {
  // Payment form states
  const [selectedTaraf, setSelectedTaraf] = useState("")
  const [selectedGiderTuru, setSelectedGiderTuru] = useState("")
  const [selectedHarcTuru, setSelectedHarcTuru] = useState("")
  const [adet, setAdet] = useState<number>(1)
  const [tutar, setTutar] = useState("")
  const [aciklama, setAciklama] = useState("")
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error" | "info"; message: string } | null>(
    null,
  )

  // Payment entries state
  const [paymentEntries, setPaymentEntries] = useState([
    {
      id: 1,
      taraf: "Alacaklı",
      giderTuru: "Harç",
      harcTuru: "İcra Harç",
      adet: 1,
      tutar: 250.5,
      tarih: "15.01.2024",
      aciklama: "İlk takip harcı",
    },
    {
      id: 2,
      taraf: "Borçlu",
      giderTuru: "Masraf",
      harcTuru: "Tebligat Masrafı",
      adet: 2,
      tutar: 45.0,
      tarih: "20.01.2024",
      aciklama: "Tebligat gideri",
    },
    {
      id: 3,
      taraf: "Alacaklı",
      giderTuru: "Harç",
      harcTuru: "Satış Harcı",
      adet: 1,
      tutar: 180.75,
      tarih: "25.01.2024",
      aciklama: "",
    },
  ])

  const tarafOptions = ["Alacaklı", "Borçlu", "Üçüncü Kişi"]
  const giderTuruOptions = ["Harç", "Masraf", "Vekalet Ücreti", "Diğer"]
  const harcTuruOptions = {
    Harç: ["İcra Harç", "Satış Harcı", "Haciz Harcı", "Tebligat Harcı"],
    Masraf: ["Tebligat Masrafı", "İlan Masrafı", "Ekspertiz Masrafı", "Ulaşım Masrafı"],
    "Vekalet Ücreti": ["Avukat Ücreti", "İcra Vekalet Ücreti"],
    Diğer: ["Çeşitli Giderler", "Mahkeme Masrafı"],
  }

  // Check if all mandatory fields are filled
  const isFormValid = selectedTaraf && selectedGiderTuru && selectedHarcTuru && tutar

  const handleAddPayment = () => {
    if (!isFormValid) {
      setUploadMessage({ type: "error", message: "Lütfen gerekli alanları doldurun." })
      return
    }

    const newEntry = {
      id: paymentEntries.length + 1,
      taraf: selectedTaraf,
      giderTuru: selectedGiderTuru,
      harcTuru: selectedHarcTuru,
      adet: adet,
      tutar: Number.parseFloat(tutar.replace(",", ".")),
      tarih: new Date().toLocaleDateString("tr-TR"),
      aciklama: aciklama,
    }

    setPaymentEntries([...paymentEntries, newEntry])

    // Reset form
    setSelectedTaraf("")
    setSelectedGiderTuru("")
    setSelectedHarcTuru("")
    setAdet(1)
    setTutar("")
    setAciklama("")

    setUploadMessage({ type: "success", message: "Ödeme kaydı başarıyla eklendi!" })
  }

  const calculateTotals = () => {
    const harcToplami = paymentEntries
      .filter((entry) => entry.giderTuru === "Harç")
      .reduce((sum, entry) => sum + entry.tutar * entry.adet, 0)

    const masrafToplami = paymentEntries
      .filter((entry) => entry.giderTuru === "Masraf")
      .reduce((sum, entry) => sum + entry.tutar * entry.adet, 0)

    const vekaletToplami = paymentEntries
      .filter((entry) => entry.giderTuru === "Vekalet Ücreti")
      .reduce((sum, entry) => sum + entry.tutar * entry.adet, 0)

    const digerToplami = paymentEntries
      .filter((entry) => entry.giderTuru === "Diğer")
      .reduce((sum, entry) => sum + entry.tutar * entry.adet, 0)

    const genelToplam = harcToplami + masrafToplami + vekaletToplami + digerToplami

    // Additional totals for new cards
    const gelenOdemeler = 15000.0 // Sample data
    const reddiyatlarToplami = 2500.0 // Sample data
    const kalanMasraf = masrafToplami - 1000.0 // Sample calculation
    const kalanTahsilat = genelToplam - gelenOdemeler // Sample calculation

    return {
      harcToplami,
      masrafToplami,
      vekaletToplami,
      digerToplami,
      genelToplam,
      gelenOdemeler,
      reddiyatlarToplami,
      kalanMasraf,
      kalanTahsilat,
    }
  }

  return (
    <div className="space-y-4">
      {/* Vertical Layout - All blocks stacked */}

      {/* 1. Ödeme Ekle Form - Top Block */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          💰 Ödeme Ekle
          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Yeni Kayıt</Badge>
        </h3>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <Label className="text-xs font-medium text-gray-600">Taraf *</Label>
            <Select value={selectedTaraf} onValueChange={setSelectedTaraf}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Taraf seçin..." />
              </SelectTrigger>
              <SelectContent>
                {tarafOptions.map((taraf) => (
                  <SelectItem key={taraf} value={taraf}>
                    {taraf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Gider Türü *</Label>
            <Select
              value={selectedGiderTuru}
              onValueChange={(value) => {
                setSelectedGiderTuru(value)
                setSelectedHarcTuru("") // Reset harç türü when gider türü changes
              }}
            >
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Gider türü seçin..." />
              </SelectTrigger>
              <SelectContent>
                {giderTuruOptions.map((gider) => (
                  <SelectItem key={gider} value={gider}>
                    {gider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Harç Türü *</Label>
            <Select value={selectedHarcTuru} onValueChange={setSelectedHarcTuru} disabled={!selectedGiderTuru}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Harç türü seçin..." />
              </SelectTrigger>
              <SelectContent>
                {selectedGiderTuru &&
                  harcTuruOptions[selectedGiderTuru as keyof typeof harcTuruOptions]?.map((harc) => (
                    <SelectItem key={harc} value={harc}>
                      {harc}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Adet *</Label>
            <Input
              type="number"
              min="1"
              value={adet}
              onChange={(e) => setAdet(Number.parseInt(e.target.value) || 1)}
              className="mt-1 h-8 text-xs"
              placeholder="1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Tutar (TL) *</Label>
            <Input
              type="text"
              value={tutar}
              onChange={(e) => {
                // Allow only numbers, comma and dot
                const value = e.target.value.replace(/[^0-9.,]/g, "")
                setTutar(value)
              }}
              className="mt-1 h-8 text-xs"
              placeholder="0,00"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Açıklama</Label>
            <Input
              type="text"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              className="mt-1 h-8 text-xs"
              placeholder="İsteğe bağlı açıklama..."
            />
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            onClick={handleAddPayment}
            disabled={!isFormValid}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 h-8 text-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ➕ Ekle
          </Button>
        </div>
      </div>

      {/* 2. Toplam Özetler - Middle Block */}
      {paymentEntries.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">📈 Toplam Özetler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <div className="text-center p-2 bg-emerald-100 rounded border border-emerald-300">
              <p className="text-xs text-gray-600">Gelen Ödemeler</p>
              <p className="text-sm font-bold text-emerald-700">{formatCurrency(calculateTotals().gelenOdemeler)}</p>
            </div>
            <div className="text-center p-2 bg-red-100 rounded border border-red-300">
              <p className="text-xs text-gray-600">Reddiyatlar</p>
              <p className="text-sm font-bold text-red-700">{formatCurrency(calculateTotals().reddiyatlarToplami)}</p>
            </div>
            <div className="text-center p-2 bg-indigo-100 rounded border border-indigo-300">
              <p className="text-xs text-gray-600">Harç Toplamı</p>
              <p className="text-sm font-bold text-indigo-700">{formatCurrency(calculateTotals().harcToplami)}</p>
            </div>
            <div className="text-center p-2 bg-amber-100 rounded border border-amber-300">
              <p className="text-xs text-gray-600">Masraf Toplamı</p>
              <p className="text-sm font-bold text-amber-700">{formatCurrency(calculateTotals().masrafToplami)}</p>
            </div>
            <div className="text-center p-2 bg-pink-100 rounded border border-pink-300">
              <p className="text-xs text-gray-600">Kalan Masraf</p>
              <p className="text-sm font-bold text-pink-700">{formatCurrency(calculateTotals().kalanMasraf)}</p>
            </div>
            <div className="text-center p-2 bg-cyan-100 rounded border border-cyan-300">
              <p className="text-xs text-gray-600">Kalan Tahsilat</p>
              <p className="text-sm font-bold text-cyan-700">{formatCurrency(calculateTotals().kalanTahsilat)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ödeme Kayıtları - Bottom Block (Responsive) */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          📊 Ödeme Kayıtları
          <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">{paymentEntries.length} Kayıt</Badge>
        </h3>

        {/* Mobile Card View - Visible on small screens */}
        <div className="block lg:hidden space-y-2">
          {paymentEntries.map((entry) => (
            <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{entry.harcTuru}</p>
                    <p className="text-xs text-gray-600">
                      {entry.giderTuru} • {entry.taraf}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(entry.tutar * entry.adet)}</p>
                    <p className="text-xs text-gray-500">
                      {entry.adet} x {formatCurrency(entry.tutar)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{entry.tarih}</span>
                  <span>{entry.aciklama || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Hidden on small screens */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Tarih
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Taraf
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Gider Türü
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Harç Türü
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Adet
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Birim
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Toplam
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-1 px-1 w-[12.5%] text-left">
                    Açıklama
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-gray-50">
                    <TableCell className="text-xs py-1 px-1 truncate text-left">{entry.tarih}</TableCell>
                    <TableCell className="font-medium text-xs py-1 px-1 truncate text-left">{entry.taraf}</TableCell>
                    <TableCell className="text-xs py-1 px-1 truncate text-left">{entry.giderTuru}</TableCell>
                    <TableCell className="text-xs py-1 px-1 truncate text-left">{entry.harcTuru}</TableCell>
                    <TableCell className="text-xs py-1 px-1 text-left">{entry.adet}</TableCell>
                    <TableCell className="font-mono text-xs py-1 px-1 truncate text-left">
                      {formatCurrency(entry.tutar)}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-xs py-1 px-1 truncate text-left">
                      {formatCurrency(entry.tutar * entry.adet)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 py-1 px-1 truncate text-left">
                      {entry.aciklama || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {paymentEntries.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2 text-gray-300">💰</div>
            <p className="text-sm font-medium">Henüz ödeme kaydı yok</p>
            <p className="text-xs">Yukarıdaki formu kullanarak ödeme ekleyebilirsiniz</p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {uploadMessage && (
        <div
          className={`p-2 rounded text-xs ${
            uploadMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {uploadMessage.message}
        </div>
      )}
    </div>
  )
}
