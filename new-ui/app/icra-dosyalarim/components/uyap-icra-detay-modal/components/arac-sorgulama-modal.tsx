"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface AracSorgulamaModalProps {
  isOpen: boolean
  onClose: () => void
  borcluAdi: string
  tcKimlik: string
  dosyaNo?: string
  fileId?: string
  borcluId?: string
  uyapStatus?: "Bağlı Değil" | "Bağlanıyor" | "Bağlı"
  onUyapToggle?: () => void
  isConnecting?: boolean
}

interface Mahrumiyet {
  "Takyidat Sirasi": string
  "Ekleyen Birim": string
  "Ekleme Tarihi": string
  "Serh Turu": string
  "Kurum Adi": string
}

interface Arac {
  No: string
  Plaka: string
  Marka: string
  Model: string
  Tipi: string
  Renk: string
  Cins: string
  Mahrumiyet: Mahrumiyet[]
}

export default function AracSorgulamaModal({
  isOpen,
  onClose,
  borcluAdi,
  tcKimlik,
  dosyaNo,
  fileId,
  borcluId,
  uyapStatus = "Bağlı",
  onUyapToggle,
  isConnecting = false,
}: AracSorgulamaModalProps) {
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)
  const [selectedArac, setSelectedArac] = useState<Arac | null>(null)
  const [isMahrumiyetModalOpen, setIsMahrumiyetModalOpen] = useState(false)
  const [queryData, setQueryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/arac-sorgulama`)
      
      if (response.ok) {
        const data = await response.json()
        setQueryData(data)
      }
    } catch (error) {
      console.error("Error fetching current arac data:", error)
      // Don't show error for fetch, just silently fail
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && fileId && borcluId) {
      fetchCurrentData()
    }
  }, [isOpen, fileId, borcluId])

  // Disabled polling for now - will be implemented later with proper database integration
  // useEffect(() => {
  //   if (!isOpen) return

  //   const interval = setInterval(() => {
  //     fetchCurrentData()
  //   }, 5000) // Check every 5 seconds

  //   return () => clearInterval(interval)
  // }, [isOpen, fileId, borcluId])

  // Use API data only
  const aracSorguSonucu = queryData?.aracSorguSonucu?.EGM

  const handleSorgula = () => {
    // This will be implemented later with web scraping
    console.log('UYAP sorgulama başlatılacak - web scraping ile')
    setLastQueryTime(new Date())
  }

  const handleMahrumiyetClick = (arac: Arac) => {
    setSelectedArac(arac)
    setIsMahrumiyetModalOpen(true)
  }

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset any modal-specific state if needed
    }
  }, [isOpen])

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                🚗 Araç Sorgulama Sonuçları
                <Badge
                  onClick={isConnecting ? undefined : onUyapToggle}
                  className={cn(
                    "text-xs px-2 py-1 cursor-pointer transition-all duration-300 hover:scale-105 select-none",
                    uyapStatus === "Bağlı"
                      ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                      : uyapStatus === "Bağlanıyor"
                        ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                        : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
                    isConnecting && "animate-pulse-slow",
                  )}
                  style={{
                    animationDuration: isConnecting ? "3s" : undefined,
                  }}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div>
                      <span>Uyap: Bağlanıyor...</span>
                    </div>
                  ) : (
                    `Uyap: ${uyapStatus}`
                  )}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Borçlu kişinin araç bilgilerini UYAP üzerinden sorgulama sonuçları ve mahrumiyet kayıtları
            </DialogDescription>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Dosya No:</span> {dosyaNo}
              <span className="font-medium ml-2">Borçlu:</span> {borcluAdi}
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Veriler yükleniyor...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data State */}
            {!isLoading && !aracSorguSonucu && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">🚗</div>
                    <p className="text-gray-600">Henüz araç verisi bulunmuyor</p>
                    <p className="text-sm text-gray-500 mt-1">UYAP'ta sorgula butonuna tıklayarak veri çekebilirsiniz</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sorgu Sonucu */}
            {!isLoading && aracSorguSonucu && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    📊 Sorgu Sonucu
                    <span className="text-sm font-normal text-green-700">
                      ✅ {aracSorguSonucu.Araclar?.length || 0} Araç Bulundu
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Araçlar Tablosu */}
            {!isLoading && aracSorguSonucu && aracSorguSonucu.Sonuc === "bulundu" && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🚗 Araç Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700 text-xs">No</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Plaka</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Marka</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Model</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Tipi</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Renk</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Cins</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Mahrumiyet</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aracSorguSonucu.Araclar.map((arac: Arac) => (
                          <TableRow key={arac.No} className="hover:bg-gray-50">
                            <TableCell className="text-xs py-2">{arac.No}</TableCell>
                            <TableCell className="font-medium text-xs py-2">{arac.Plaka}</TableCell>
                            <TableCell className="text-xs py-2">{arac.Marka}</TableCell>
                            <TableCell className="text-xs py-2">{arac.Model}</TableCell>
                            <TableCell className="text-xs py-2">{arac.Tipi}</TableCell>
                            <TableCell className="text-xs py-2">{arac.Renk}</TableCell>
                            <TableCell className="text-xs py-2">{arac.Cins}</TableCell>
                            <TableCell className="text-xs py-2">
                              <span
                                className={cn(
                                  "text-xs px-2 py-1 font-bold",
                                  arac.Mahrumiyet.length > 0 ? "text-red-800" : "text-green-800",
                                )}
                              >
                                {arac.Mahrumiyet.length > 0 ? `${arac.Mahrumiyet.length} Kayıt` : "Temiz"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs py-2">
                              {arac.Mahrumiyet.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMahrumiyetClick(arac)}
                                  className="h-7 px-2 text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Mahrumiyet
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Refresh indicator - disabled for now */}
          {/* <div className="text-center text-xs text-muted-foreground pb-2">
            <p>Veriler otomatik olarak güncelleniyor...</p>
          </div> */}

          {/* Fixed Footer - Minimized Height */}
          <div className="flex-shrink-0 px-6 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600 px-2 py-1 rounded">
                <span className="font-medium">Son Sorgu Tarihi:</span>{" "}
                {lastQueryTime ? formatDateTime(lastQueryTime) : "Henüz sorgu yapılmadı"}
              </div>
              <Button
                onClick={handleSorgula}
                size="sm"
                className="h-7 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300"
              >
                <Search className="w-3 h-3 mr-1" />
                UYAP'ta Sorgula
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mahrumiyet Modal */}
      <Dialog open={isMahrumiyetModalOpen} onOpenChange={setIsMahrumiyetModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900">
              📋 Mahrumiyet Bilgileri - {selectedArac?.Plaka}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Seçilen aracın mahrumiyet kayıtları ve takyidat bilgileri
            </DialogDescription>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Araç:</span> {selectedArac?.Marka} {selectedArac?.Model} •
              <span className="font-medium ml-2">Plaka:</span> {selectedArac?.Plaka}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  ⚠️ Mahrumiyet Kayıtları
                  <span className="text-xs px-2 py-1 text-red-800 font-bold">
                    {selectedArac?.Mahrumiyet.length || 0} Kayıt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 text-xs">Sıra</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Ekleyen Birim</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Ekleme Tarihi</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Şerh Türü</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Kurum Adı</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedArac?.Mahrumiyet.map((mahrumiyet, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="text-xs py-2 font-medium">{mahrumiyet["Takyidat Sirasi"]}</TableCell>
                          <TableCell className="text-xs py-2">{mahrumiyet["Ekleyen Birim"]}</TableCell>
                          <TableCell className="text-xs py-2">{mahrumiyet["Ekleme Tarihi"]}</TableCell>
                          <TableCell className="text-xs py-2">
                            <span
                              className={cn(
                                "text-xs px-2 py-1 font-bold",
                                mahrumiyet["Serh Turu"] === "HACİZLİ(H)" ? "text-red-800" : "text-yellow-800",
                              )}
                            >
                              {mahrumiyet["Serh Turu"]}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs py-2">{mahrumiyet["Kurum Adi"]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsMahrumiyetModalOpen(false)}
                variant="outline"
                size="sm"
                className="h-8 px-4 text-xs"
              >
                Kapat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
