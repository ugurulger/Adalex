"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PratikFaizHesaplamaModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (data: {
    tutar: string
    faizTuru: string
    faizTipi: string
    faizOrani: string
    faizBaslangicTarihi: string
    faizBitisTarihi: string
  }) => void
  initialAsilAlacak?: string
  initialDovizCinsi?: string
}

export default function PratikFaizHesaplamaModal({
  isOpen,
  onClose,
  onConfirm,
  initialAsilAlacak = "",
  initialDovizCinsi = "TL",
}: PratikFaizHesaplamaModalProps) {
  const [asilAlacakMiktar, setAsilAlacakMiktar] = useState("")
  const [dovizCinsi, setDovizCinsi] = useState("TL")
  const [faizBaslangicTarihi, setFaizBaslangicTarihi] = useState("")
  const [faizBitisTarihi, setFaizBitisTarihi] = useState(new Date().toISOString().split("T")[0])
  const [faizTuru, setFaizTuru] = useState("")
  const [faizTuruOpen, setFaizTuruOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [manuelFaizOrani, setManuelFaizOrani] = useState("")
  const [faizTipi, setFaizTipi] = useState("")

  // Set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setAsilAlacakMiktar(initialAsilAlacak)
      setDovizCinsi(initialDovizCinsi || "TL")
    }
  }, [isOpen, initialAsilAlacak, initialDovizCinsi])

  // Interest rates data (same as in Güncel Faiz Oranları)
  const faizOranlari = [
    { key: "Adi Kanuni Faiz", value: "0.10" },
    { key: "Reeskont - Iskonto Faizi", value: "0.10" },
    { key: "Reeskont - Avans Faizi", value: "0.10" },
    { key: "Ticari İlgilere Teminat Faizi", value: "0.10" },
    { key: "Reeskont Avans (Uyap)", value: "0.10" },
    { key: "TTK 1530 Maddesince Temerrüt Faizi", value: "0.10" },
    { key: "Yİ-ÜFE (On İki Aylık Ortalamaları Göre)", value: "0.10" },
    { key: "TÜFE (On İki Aylık Ortalamaları Göre)", value: "0.10" },
    { key: "Yİ-ÜFE (Bir Önceki Yılın Aynı Ayına Göre)", value: "0.10" },
    { key: "TÜFE (Bir Önceki Yılın Aynı Ayına Göre)", value: "0.10" },
    { key: "TCMB'na Uygulanançlı Bildirilen En Yüksek Mevduat Faiz Oranı (TL)", value: "0.10" },
    { key: "TCMB'na Uygulanançlı Bildirilen En Yüksek Mevduat Faiz Oranı (USD)", value: "0.10" },
    { key: "TCMB'na Uygulanançlı Bildirilen En Yüksek Mevduat Faiz Oranı (EUR)", value: "0.10" },
    { key: "1 Yıl Kadar Vadeli Bankalara Filen Uygulanan Azami Mevduat Faiz Oranı (TL)", value: "0.10" },
    { key: "1 Yıl Kadar Vadeli Bankalara Filen Uygulanan Azami Mevduat Faiz Oranı (USD)", value: "0.10" },
    { key: "1 Yıl Kadar Vadeli Bankalara Filen Uygulanan Azami Faiz Oranı (EUR)", value: "0.10" },
    { key: "Kamu Bankalarına Filen Uygulananan Azami Mevduat Faiz Oranı (TL)", value: "0.10" },
    { key: "1 Yıl Kadar Vadeli Kamu Bankalarına Filen Uygulananan Azami Mevduat Faiz Oranı (USD)", value: "0.10" },
    { key: "1 Yıl Kadar Vadeli Kamu Bankalarına Filen Uygulananan Azami Mevduat Faiz Oranı (EUR)", value: "0.10" },
    { key: "6183 Sayılı K. 51.Madde Gecikme Faizi", value: "0.10" },
    { key: "6183 Sayılı K. 51.Madde Gecikme Faizi (Aylık)", value: "0.10" },
    { key: "1 Yıl ve Daha Uzun Vadeli Bankalarca Filen Uygulanan Azami Mevduat Faiz Oranı (TL)", value: "0.10" },
    { key: "1 Yıl ve Daha Uzun Vadeli Bankalarca Filen Uygulanan Azami Mevduat Faiz Oranı (USD)", value: "0.10" },
    { key: "1 Yıl ve Daha Uzun Vadeli Bankalarca Filen Uygulanan Azami Mevduat Faiz Oranı (EUR)", value: "0.10" },
    { key: "1 Yıl ve Daha Uzun Vadeli Kamu Bankalarınca Filen Uygulanan Azami Mevduat Faiz Oranı (TL)", value: "0.10" },
    {
      key: "1 Yıl ve Daha Uzun Vadeli Kamu Bankalarınca Filen Uygulanan Azami Mevduat Faiz Oranı (USD)",
      value: "0.10",
    },
    {
      key: "1 Yıl ve Daha Uzun Vadeli Kamu Bankalarınca Filen Uygulanan Azami Mevduat Faiz Oranı (EUR)",
      value: "0.10",
    },
    { key: "Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (FRF)", value: "0.10" },
    { key: "Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (DEM)", value: "0.10" },
    { key: "Azami Mevduat Faiz (TL)", value: "0.10" },
    { key: "Azami Mevduat Faiz (USD)", value: "0.10" },
    { key: "Azami Mevduat Faiz (EUR)", value: "0.10" },
    { key: "Azami Mevduat Faiz (DEM)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (FRF)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl Kadar Vadeli Mevduatlara Filen Uygulanan Azami Faiz (DEM)", value: "0.10" },
    { key: "Kamu Azami Mevduat Faiz (TL)", value: "0.10" },
    { key: "Kamu Azami Mevduat Faiz (USD)", value: "0.10" },
    { key: "Kamu Azami Mevduat Faiz (EUR)", value: "0.10" },
    { key: "Kamu Azami Mevduat Faiz (DEM)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (FRF)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (DEM)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (FRF)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (DEM)", value: "0.10" },
    { key: "Ticarî Krediler (Tüzel Kişi ve Kümülatif Kredi Kartları Hariç)", value: "0.10" },
  ]

  // Filter interest rates based on search term
  const filteredFaizOranlari = faizOranlari.filter((item) => item.key.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get selected interest rate value
  const selectedFaizOrani = faizOranlari.find((item) => item.key === faizTuru)?.value || ""

  // Currency options
  const dovizCinsleri = ["TL", "USD", "EUR", "GBP", "CHF", "JPY"]

  // Interest type options
  const faizTipleri = ["Günlük", "Aylık", "Yıllık 365", "Yıllık 360", "360 Gün Hesabı"]

  // Calculate mock tutar (this would be replaced with actual calculation logic)
  const calculateTutar = () => {
    if (asilAlacakMiktar && (faizTuru || manuelFaizOrani) && faizTipi) {
      // Mock calculation - replace with actual logic
      const principal = Number.parseFloat(asilAlacakMiktar) || 0
      const rate = Number.parseFloat(selectedFaizOrani || manuelFaizOrani) || 0
      return (principal * rate).toFixed(2)
    }
    return "0.00"
  }

  const handleConfirm = () => {
    const tutar = calculateTutar()
    const usedFaizOrani = faizTuru ? selectedFaizOrani : manuelFaizOrani

    if (onConfirm) {
      onConfirm({
        tutar,
        faizTuru,
        faizTipi,
        faizOrani: usedFaizOrani,
        faizBaslangicTarihi,
        faizBitisTarihi,
      })
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Pratik Faiz Hesaplama</DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Asıl Alacak */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Asıl Alacak</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Miktar"
                    value={asilAlacakMiktar}
                    onChange={(e) => setAsilAlacakMiktar(e.target.value)}
                    className="flex-1"
                    type="number"
                  />
                  <Select value={dovizCinsi} onValueChange={setDovizCinsi}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Döviz" />
                    </SelectTrigger>
                    <SelectContent>
                      {dovizCinsleri.map((doviz) => (
                        <SelectItem key={doviz} value={doviz}>
                          {doviz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Faiz Başlangıç Tarihi */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Faiz Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={faizBaslangicTarihi}
                  onChange={(e) => setFaizBaslangicTarihi(e.target.value)}
                />
              </div>

              {/* Faiz Bitiş Tarihi */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Faiz Bitiş Tarihi</Label>
                <Input type="date" value={faizBitisTarihi} onChange={(e) => setFaizBitisTarihi(e.target.value)} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Faiz Türü */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Faiz Türü</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Popover open={faizTuruOpen} onOpenChange={setFaizTuruOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={faizTuruOpen}
                          className="w-full justify-between bg-transparent"
                        >
                          {faizTuru ? faizOranlari.find((item) => item.key === faizTuru)?.key : "Faiz türü seçin..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Faiz türü ara..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>Faiz türü bulunamadı.</CommandEmpty>
                            <CommandGroup>
                              {filteredFaizOranlari.map((item) => (
                                <CommandItem
                                  key={item.key}
                                  value={item.key}
                                  onSelect={(currentValue) => {
                                    setFaizTuru(currentValue === faizTuru ? "" : currentValue)
                                    setFaizTuruOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn("mr-2 h-4 w-4", faizTuru === item.key ? "opacity-100" : "opacity-0")}
                                  />
                                  {item.key}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-20">
                    <Input value={selectedFaizOrani} readOnly className="bg-gray-50 text-center" placeholder="0.00" />
                  </div>
                </div>
              </div>

              {/* Faiz Oranı */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Faiz Oranı {!faizTuru && "(Manuel Giriş)"}</Label>
                <Input
                  placeholder="Faiz oranı"
                  value={faizTuru ? selectedFaizOrani : manuelFaizOrani}
                  onChange={(e) => setManuelFaizOrani(e.target.value)}
                  disabled={!!faizTuru}
                  type="number"
                  step="0.01"
                />
              </div>

              {/* Faiz Tipi */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Faiz Tipi</Label>
                <Select value={faizTipi} onValueChange={setFaizTipi}>
                  <SelectTrigger>
                    <SelectValue placeholder="Faiz tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {faizTipleri.map((tip) => (
                      <SelectItem key={tip} value={tip}>
                        {tip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-4">Hesaplama Sonuçları</h3>
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Başlangıç</TableHead>
                    <TableHead className="font-semibold text-gray-700">Bitiş</TableHead>
                    <TableHead className="font-semibold text-gray-700">Faiz Detayı</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-3">{faizBaslangicTarihi || "-"}</TableCell>
                    <TableCell className="py-3">{faizBitisTarihi || "-"}</TableCell>
                    <TableCell className="py-3 text-gray-500">Burası sonra tanımlanacak</TableCell>
                    <TableCell className="py-3 font-medium">{calculateTutar()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Tamam Button */}
        <div className="flex-shrink-0 border-t pt-4 flex justify-end">
          <Button onClick={handleConfirm} className="px-6">
            Tamam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
