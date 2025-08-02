"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw } from "lucide-react"

interface GuncelFaizOranlariModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuncelFaizOranlariModal({ isOpen, onClose }: GuncelFaizOranlariModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString("tr-TR"))

  // Interest rates data
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
    { key: "1 Yıl Kadar Vadeli Bankalara Filen Uygulanan Azami Mevduat Faiz Oranı (EUR)", value: "0.10" },
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
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Kamu Bankalarca 1 Yıl ve Daha Uzun Vadeli Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Kamu Bankalarca Ticari Döküm Vadesi Dahil Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Kamu Bankalarca Ticari Döküm Vadesi Dahil Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Kamu Bankalarca Ticari Döküm Vadesi Dahil Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vade Mevduatlara Filen Uygulanan Azami Faiz (TL)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vade Mevduatlara Filen Uygulanan Azami Faiz (USD)", value: "0.10" },
    { key: "Bankalarca 1 Yıl ve Daha Uzun Vade Mevduatlara Filen Uygulanan Azami Faiz (EUR)", value: "0.10" },
    { key: "Ticarî Krediler (Tüzel Kişi ve Kümülatif Kredi Kartları Hariç)", value: "0.10" },
  ]

  // Filter interest rates based on search term
  const filteredFaizOranlari = faizOranlari.filter((item) => item.key.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleUpdate = () => {
    setLastUpdate(new Date().toLocaleString("tr-TR"))
    console.log("Faiz oranları güncellendi")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Güncel Faiz Oranları</DialogTitle>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Faiz türü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Table className="text-xs">
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-2 px-3">
                    Faiz Türü ({filteredFaizOranlari.length} sonuç)
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-2 px-3 w-32">Oran %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaizOranlari.length > 0 ? (
                  filteredFaizOranlari.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="py-2 px-3 text-xs">{item.key}</TableCell>
                      <TableCell className="py-2 px-3 text-xs font-mono">{item.value}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                      Arama kriterinize uygun faiz türü bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-white">
          <div className="text-sm text-gray-600">Son Güncelleme: {lastUpdate}</div>
          <Button onClick={handleUpdate} size="sm" className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Güncelle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
