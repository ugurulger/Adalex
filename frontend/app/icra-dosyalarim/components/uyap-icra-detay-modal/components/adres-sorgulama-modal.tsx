"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { sortObjectEntries, FIELD_ORDERS } from "../utils/field-ordering"

interface AdresSorgulamaModalProps {
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

interface AdresSorgulamaData {
  file_id: number
  borclu_id: number
  kisiselBilgiler: Record<string, string>
  adresBilgileri: Record<string, string>
  timestamp: string
}

export default function AdresSorgulamaModal({
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
}: AdresSorgulamaModalProps) {
  const [queryData, setQueryData] = useState<AdresSorgulamaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/adres-sorgulama`)
      
      if (response.ok) {
        const rawData = await response.json()
        
        // Transform the data to match the expected format
        const transformedData: AdresSorgulamaData = {
          file_id: rawData.file_id,
          borclu_id: rawData.borclu_id,
          kisiselBilgiler: rawData.adresSorguSonucu?.sonuc?.['Kimlik Bilgileri'] || {},
          adresBilgileri: rawData.adresSorguSonucu?.sonuc?.['Adres Bilgileri'] || {},
          timestamp: rawData.timestamp
        }
        
        console.log('Raw API data:', rawData)
        console.log('Transformed data:', transformedData)
        setQueryData(transformedData)
      }
    } catch (error) {
      console.error("Error fetching current adres data:", error)
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
          sorgu_tipi: 'MERNİS',
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

  // Use API data if available, otherwise show empty state
  const kisiselBilgiler = queryData?.kisiselBilgiler || {}
  const adresBilgileri = queryData?.adresBilgileri || {}

  // Sort data according to predefined field orders
  const sortedKisiselBilgiler = sortObjectEntries(kisiselBilgiler, FIELD_ORDERS.kisiselBilgiler)
  const sortedAdresBilgileri = sortObjectEntries(adresBilgileri, FIELD_ORDERS.adresBilgileri)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              🏠 Adres Sorgulama Sonuçları
              <Badge
                onClick={isConnecting ? undefined : onUyapToggle}
                className={`text-xs px-2 py-1 cursor-pointer transition-all duration-300 hover:scale-105 select-none ${
                  uyapStatus === "Bağlı"
                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    : uyapStatus === "Bağlanıyor"
                      ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                } ${isConnecting ? "animate-pulse-slow" : ""}`}
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
            Borçlu kişinin adres bilgilerini UYAP üzerinden sorgulama sonuçları
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
                  <div className="text-gray-400 mb-2">🏠</div>
                  <p className="text-gray-600">Henüz adres verisi bulunmuyor</p>
                  <p className="text-sm text-gray-500 mt-1">UYAP'ta sorgula butonuna tıklayarak veri çekebilirsiniz</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kişisel Bilgiler ve Adres Bilgileri - Side by Side */}
          {!isLoading && queryData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kişisel Bilgiler - Left Side */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  👤 Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedKisiselBilgiler.length > 0 ? (
                        sortedKisiselBilgiler.map(([key, value]) => (
                          <TableRow key={key} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-xs text-gray-700 border-r border-gray-200 py-1">
                              {key}
                            </TableCell>
                            <TableCell className="text-xs text-gray-900 py-1">
                              {value || <span className="text-gray-400 italic">Bilgi Yok</span>}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                            Henüz sorgu yapılmadı
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Adres Bilgileri - Right Side */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  📍 Adres Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAdresBilgileri.length > 0 ? (
                        sortedAdresBilgileri.map(([key, value]) => (
                          <TableRow key={key} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-xs text-gray-700 border-r border-gray-200 py-1">
                              {key}
                            </TableCell>
                            <TableCell className="text-xs text-gray-900 py-1">
                              {value || <span className="text-gray-400 italic">Bilgi Yok</span>}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                            Henüz sorgu yapılmadı
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
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
  )
}
