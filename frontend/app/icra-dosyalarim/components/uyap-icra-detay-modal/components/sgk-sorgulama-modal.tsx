"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SgkSorgulamaModalProps {
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

interface SgkSorgulamaData {
  file_id: number
  borclu_id: number
  sskCalisani: {
    sonuc: Record<string, string>
  }
  bagkurCalisani: {
    sonuc: Record<string, string>
  }
  sskIsYeriBilgisi: {
    sonuc: Array<{
      type: string
      title: string
      data: Record<string, string>
    }>
  }
  timestamp: string
}

export default function SgkSorgulamaModal({
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
}: SgkSorgulamaModalProps) {
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)
  const [showGreenBackground, setShowGreenBackground] = useState(false)
  const [queryData, setQueryData] = useState<SgkSorgulamaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/sgk-sorgulama`)
      
      if (response.ok) {
        const data: SgkSorgulamaData = await response.json()
        setQueryData(data)
      }
    } catch (error) {
      console.error("Error fetching current SGK data:", error)
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

  // Use API data if available, otherwise show empty state
  const sskCalisani = queryData?.sskCalisani?.sonuc || {}
  const bagkurCalisani = queryData?.bagkurCalisani?.sonuc || {}
  const sskIsYeriBilgisi = queryData?.sskIsYeriBilgisi?.sonuc || []

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
          sorgu_tipi: 'SGK',
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

  // Clean up timers when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowGreenBackground(false)
    }
  }, [isOpen])

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              🏢 SGK Sorgulama Sonuçları
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
            Borçlu kişinin SGK kayıtlarını UYAP üzerinden sorgulama sonuçları
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
                  <div className="text-gray-400 mb-2">🏢</div>
                  <p className="text-gray-600">Henüz SGK verisi bulunmuyor</p>
                  <p className="text-sm text-gray-500 mt-1">UYAP'ta sorgula butonuna tıklayarak veri çekebilirsiniz</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SGK Data */}
          {!isLoading && queryData && (
            <>
              {/* SSK Çalışanı Bilgileri */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    👷 SSK Çalışanı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(sskCalisani).length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(sskCalisani).map(([key, value]) => (
                            <TableRow key={key} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-xs text-gray-700 border-r border-gray-200 py-1">
                                {key}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 py-1">
                                {value || <span className="text-gray-400 italic">Bilgi Yok</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <span className="text-sm italic">SSK çalışanı bilgisi bulunamadı</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bağkur Çalışanı Bilgileri */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🏪 Bağkur Çalışanı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(bagkurCalisani).length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(bagkurCalisani).map(([key, value]) => (
                            <TableRow key={key} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-xs text-gray-700 border-r border-gray-200 py-1">
                                {key}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 py-1">
                                {value || <span className="text-gray-400 italic">Bilgi Yok</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <span className="text-sm italic">Bağkur çalışanı bilgisi bulunamadı</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SSK İş Yeri Bilgileri */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🏭 SSK İş Yeri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sskIsYeriBilgisi && typeof sskIsYeriBilgisi === "object" && Object.keys(sskIsYeriBilgisi).length > 0 ? (
                    Object.entries(sskIsYeriBilgisi).map(([sectionKey, sectionData], index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          {sectionKey === "İŞ YERİ BİLGİLERİ" ? "🏢" : "👤"}
                          {sectionKey}
                        </h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                                <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sectionData && typeof sectionData === "object" ? (
                                Object.entries(sectionData).map(([key, value]) => (
                                  <TableRow key={key} className="hover:bg-gray-50">
                                    <TableCell className="font-medium text-xs text-gray-700 border-r border-gray-200 py-1">
                                      {key}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-900 py-1">
                                      {String(value) || <span className="text-gray-400 italic">Bilgi Yok</span>}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                                    <span className="text-sm italic">Bu kayıt için veri bulunamadı</span>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <span className="text-sm italic">İş yeri bilgisi bulunamadı</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fixed Footer - Minimized Height */}
        <div className="flex-shrink-0 px-6 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div
              className={cn(
                "text-xs text-gray-600 transition-all duration-300 px-2 py-1 rounded",
                showGreenBackground && "bg-green-100 text-green-800",
              )}
            >
              <span className="font-medium">Son Sorgu Tarihi:</span>{" "}
              {lastQueryTime ? formatDateTime(lastQueryTime) : "Henüz sorgu yapılmadı"}
            </div>
            <Button
              onClick={handleSorgula}
              disabled={isLoading || uyapStatus !== "Bağlı"}
              size="sm"
              className={cn(
                "h-7 px-3 text-xs transition-all duration-300",
                uyapStatus === "Bağlı" && !isLoading
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Sorgulanıyor...</span>
                </div>
              ) : (
                <>
                  <Search className="w-3 h-3 mr-1" />
                  UYAP'ta Sorgula
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
