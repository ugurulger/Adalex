"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface GayrimenkulSorgulamaModalProps {
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

interface GayrimenkulSorgulamaData {
  file_id: number
  borclu_id: string
  gayrimenkulSorguSonucu: {
    sonuc: string
    tasinmazlar: Tasinmaz[]
  }
  timestamp: string
}

interface TakdiyatBilgisi {
  no: string
  tipi: string
  aciklama: string
}

interface HisseBilgisi {
  no: string
  aciklama: string
  hisse_tipi: string
  durum: string
  takdiyat_bilgisi: TakdiyatBilgisi[]
}

interface Tasinmaz {
  no: string
  tapu_mudurlugu: string
  il_ilce: string
  mahalle: string
  vasfi: string
  yuzolcumu: string
  mevki: string
  ada_no: string
  parcel_no: string
  bagimsiz_bolum: string
  hisse_bilgisi: HisseBilgisi[]
}

export default function GayrimenkulSorgulamaModal({
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
}: GayrimenkulSorgulamaModalProps) {
  const [selectedTasinmaz, setSelectedTasinmaz] = useState<Tasinmaz | null>(null)
  const [isHisseModalOpen, setIsHisseModalOpen] = useState(false)
  const [selectedHisse, setSelectedHisse] = useState<HisseBilgisi | null>(null)
  const [isTakdiyatModalOpen, setIsTakdiyatModalOpen] = useState(false)
  const [queryData, setQueryData] = useState<GayrimenkulSorgulamaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/gayrimenkul-sorgulama`)
      
      if (response.ok) {
        const data: GayrimenkulSorgulamaData = await response.json()
        setQueryData(data)
      }
    } catch (error) {
      console.error("Error fetching current gayrimenkul data:", error)
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

  // Use API data if available, otherwise show empty state
  const gayrimenkulSorguSonucu = queryData?.gayrimenkulSorguSonucu

  const handleSorgula = async () => {
    if (!dosyaNo || !borcluId) {
      console.error('Dosya No veya Borçlu ID eksik')
      return
    }

    if (uyapStatus !== "Bağlı") {
      console.error('UYAP bağlantısı yok')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/uyap/trigger-sorgulama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dosya_no: dosyaNo,
          sorgu_tipi: 'TAKBİS',
          borclu_id: borcluId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the data
        await fetchCurrentData()
      } else {
        console.error('Sorgulama hatası:', result.message)
        // Show user-friendly error message
        alert(`Sorgulama başarısız: ${result.message}`)
      }
    } catch (error) {
      console.error('Sorgulama sırasında hata:', error)
      
      // Handle specific connection errors
      let errorMessage = 'Bilinmeyen bir hata oluştu'
      
      if (error instanceof Error) {
        if (error.message.includes('Connection refused') || error.message.includes('Max retries exceeded')) {
          errorMessage = 'UYAP bağlantısı kesildi. Lütfen UYAP\'ı yeniden bağlayın ve tekrar deneyin.'
        } else if (error.message.includes('fetch failed')) {
          errorMessage = 'Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Sorgulama hatası: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHisseClick = (tasinmaz: Tasinmaz) => {
    setSelectedTasinmaz(tasinmaz)
    setIsHisseModalOpen(true)
  }

  const handleTakdiyatClick = (hisse: HisseBilgisi) => {
    setSelectedHisse(hisse)
    setIsTakdiyatModalOpen(true)
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

  const formatYuzolcumu = (yuzolcumu: string) => {
    const num = Number.parseFloat(yuzolcumu)
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                🏘️ Gayrimenkul Sorgulama Sonuçları
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
              Borçlu kişinin gayrimenkul ve taşınmaz bilgilerini UYAP üzerinden sorgulama sonuçları
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
            {!isLoading && !queryData && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">🏘️</div>
                    <p className="text-gray-600">Henüz gayrimenkul verisi bulunmuyor</p>
                    <p className="text-sm text-gray-500 mt-1">UYAP'ta sorgula butonuna tıklayarak veri çekebilirsiniz</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gayrimenkul Data */}
            {!isLoading && queryData && gayrimenkulSorguSonucu && (
              <>
                {/* Sorgu Sonucu */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      📊 Sorgu Sonucu
                      <span className="text-sm font-normal text-green-700">
                        ✅ {gayrimenkulSorguSonucu.tasinmazlar?.length || 0} Taşınmaz Bulundu
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Taşınmazlar Tablosu */}
                {gayrimenkulSorguSonucu.sonuc === "Kişiye ait taşınmaz kaydı var." && gayrimenkulSorguSonucu.tasinmazlar && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🏘️ Taşınmaz Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700 text-xs">No</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Tapu Müdürlüğü</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">İl/İlçe</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Mahalle</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Vasfı</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Yüzölçümü (m²)</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Ada No</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Parsel No</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">Hisse Bilgisi</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gayrimenkulSorguSonucu.tasinmazlar?.map((tasinmaz: Tasinmaz) => (
                          <TableRow key={tasinmaz.no} className="hover:bg-gray-50">
                            <TableCell className="text-xs py-2">{tasinmaz.no}</TableCell>
                            <TableCell className="font-medium text-xs py-2">{tasinmaz.tapu_mudurlugu}</TableCell>
                            <TableCell className="text-xs py-2">{tasinmaz.il_ilce}</TableCell>
                            <TableCell className="text-xs py-2">{tasinmaz.mahalle}</TableCell>
                            <TableCell className="text-xs py-2">{tasinmaz.vasfi}</TableCell>
                            <TableCell className="text-xs py-2 font-mono">
                              {formatYuzolcumu(tasinmaz.yuzolcumu)}
                            </TableCell>
                            <TableCell className="text-xs py-2">{tasinmaz.ada_no}</TableCell>
                            <TableCell className="text-xs py-2">{tasinmaz.parcel_no}</TableCell>
                            <TableCell className="text-xs py-2">
                              <span
                                className={cn(
                                  "text-xs px-2 py-1 font-bold",
                                  tasinmaz.hisse_bilgisi.length > 0 ? "text-blue-800" : "text-gray-800",
                                )}
                              >
                                {tasinmaz.hisse_bilgisi.length > 0
                                  ? `${tasinmaz.hisse_bilgisi.length} Hisse`
                                  : "Hisse Yok"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs py-2">
                              {tasinmaz.hisse_bilgisi.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleHisseClick(tasinmaz)}
                                  className="h-7 px-2 text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Hisse Detayı
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
              </>
            )}
          </div>

          {/* Fixed Footer - Minimized Height */}
          <div className="flex-shrink-0 px-6 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600 px-2 py-1 rounded">
                <span className="font-medium">Son Sorgu Tarihi:</span>{" "}
                {queryData?.timestamp ? formatDateTime(new Date(queryData.timestamp)) : "Henüz sorgu yapılmadı"}
              </div>
              <Button
                onClick={handleSorgula}
                disabled={isLoading || uyapStatus !== "Bağlı"}
                size="sm"
                className="h-7 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-3 w-3" />
                  )}
                  <span>{isLoading ? "Sorgulanıyor..." : "UYAP'ta Sorgula"}</span>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hisse Detayı Modal */}
      <Dialog open={isHisseModalOpen} onOpenChange={setIsHisseModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900">
              📋 Hisse Detayları - Ada: {selectedTasinmaz?.ada_no}, Parsel: {selectedTasinmaz?.parcel_no}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Seçilen taşınmazın hisse sahipleri ve takyidat bilgileri
            </DialogDescription>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Taşınmaz:</span> {selectedTasinmaz?.vasfi} •
              <span className="font-medium ml-2">Mahalle:</span> {selectedTasinmaz?.mahalle}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  👥 Hisse Sahipleri
                  <span className="text-xs px-2 py-1 text-blue-800 font-bold">
                    {selectedTasinmaz?.hisse_bilgisi.length || 0} Hisse
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 text-xs">Hisse No</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Açıklama</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Hisse Tipi</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Durum</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Takyidat Bilgisi</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTasinmaz?.hisse_bilgisi.map((hisse, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="text-xs py-2 font-medium">{hisse.no}</TableCell>
                          <TableCell className="text-xs py-2 break-words max-w-md">{hisse.aciklama}</TableCell>
                          <TableCell className="text-xs py-2">
                            <span className="text-xs px-2 py-1 font-bold text-blue-800">{hisse.hisse_tipi}</span>
                          </TableCell>
                          <TableCell className="text-xs py-2">
                            <span className="text-xs px-2 py-1 font-bold text-green-800">{hisse.durum}</span>
                          </TableCell>
                          <TableCell className="text-xs py-2">
                            <span
                              className={cn(
                                "text-xs px-2 py-1 font-bold",
                                hisse.takdiyat_bilgisi.length > 0 ? "text-orange-800" : "text-gray-800",
                              )}
                            >
                              {hisse.takdiyat_bilgisi.length > 0
                                ? `${hisse.takdiyat_bilgisi.length} Kayıt`
                                : "Kayıt Yok"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs py-2">
                            {hisse.takdiyat_bilgisi.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTakdiyatClick(hisse)}
                                className="h-7 px-2 text-xs"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Takyidat
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
          </div>

          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsHisseModalOpen(false)}
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

      {/* Takyidat Bilgileri Modal */}
      <Dialog open={isTakdiyatModalOpen} onOpenChange={setIsTakdiyatModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900">
              📝 Takyidat Bilgileri - Hisse No: {selectedHisse?.no}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Seçilen hissenin takyidat kayıtları ve beyan bilgileri
            </DialogDescription>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Hisse Tipi:</span> {selectedHisse?.hisse_tipi} •
              <span className="font-medium ml-2">Durum:</span> {selectedHisse?.durum}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  📋 Takyidat Kayıtları
                  <span className="text-xs px-2 py-1 text-orange-800 font-bold">
                    {selectedHisse?.takdiyat_bilgisi.length || 0} Kayıt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 text-xs">No</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Tipi</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs">Açıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedHisse?.takdiyat_bilgisi.map((takyidat, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="text-xs py-2 font-medium">{takyidat.no}</TableCell>
                          <TableCell className="text-xs py-2">
                            <span className="text-xs px-2 py-1 font-bold text-orange-800">{takyidat.tipi}</span>
                          </TableCell>
                          <TableCell className="text-xs py-2 break-words max-w-2xl">{takyidat.aciklama}</TableCell>
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
                onClick={() => setIsTakdiyatModalOpen(false)}
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
