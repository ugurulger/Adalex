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
  sskCalisani: Record<string, string>
  bagkurCalisani: Record<string, string>
  sskIsYeriBilgisi: Array<{
    type: string
    title: string
    data: Record<string, string>
  }>
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
  const [queryData, setQueryData] = useState<SgkSorgulamaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/sgk-sorgulama`)
      
      if (response.ok) {
        const rawData = await response.json()
        
        // Transform the data to match the expected format
        const transformedData: SgkSorgulamaData = {
          file_id: rawData.file_id,
          borclu_id: rawData.borclu_id,
          sskCalisani: rawData.sgkSorguSonucu?.sonuc?.['SSK Çalışanı'] || {},
          bagkurCalisani: rawData.sgkSorguSonucu?.sonuc?.['Bağkur Çalışanı'] || {},
          sskIsYeriBilgisi: rawData.sgkSorguSonucu?.sonuc?.['SSK İş Yeri Bilgisi'] || [],
          timestamp: rawData.timestamp
        }
        
        console.log('Raw API data:', rawData)
        console.log('Transformed data:', transformedData)
        setQueryData(transformedData)
      } else {
        setQueryData(null)
      }
    } catch (error) {
      setError("Veri alınırken hata oluştu.")
      setQueryData(null)
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

  const handleSorgula = async () => {
    if (!dosyaNo || !borcluId) {
      setError('Dosya No veya Borçlu ID eksik')
      return
    }
    if (uyapStatus !== "Bağlı") {
      setError('UYAP bağlantısı yok')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/uyap/trigger-sorgulama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosya_no: dosyaNo,
          sorgu_tipi: 'SGK',
          borclu_id: borcluId,
        }),
      })
      const result = await response.json()
      if (result.success) {
        // Poll for data up to 10 times, 1s apart
        let tries = 0
        let found = false
        while (tries < 10 && !found) {
          await new Promise(res => setTimeout(res, 1000))
          try {
            const pollResponse = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/sgk-sorgulama`)
            if (pollResponse.ok) {
              const rawData = await pollResponse.json()
              const transformedData: SgkSorgulamaData = {
                file_id: rawData.file_id,
                borclu_id: rawData.borclu_id,
                sskCalisani: rawData.sgkSorguSonucu?.sonuc?.['SSK Çalışanı'] || {},
                bagkurCalisani: rawData.sgkSorguSonucu?.sonuc?.['Bağkur Çalışanı'] || {},
                sskIsYeriBilgisi: rawData.sgkSorguSonucu?.sonuc?.['SSK İş Yeri Bilgisi'] || [],
                timestamp: rawData.timestamp
              }
              setQueryData(transformedData)
              found = true
              break
            }
          } catch (e) {
            // ignore
          }
          tries++
        }
        if (!found) {
          setError('Sorgulama tamamlandı fakat sonuç alınamadı. Lütfen daha sonra tekrar deneyin.')
        }
      } else {
        setError(result.message || 'Sorgulama başarısız')
      }
    } catch (error) {
      setError('Sorgulama sırasında hata oluştu')
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
  const sskCalisani = queryData?.sskCalisani || {}
  const bagkurCalisani = queryData?.bagkurCalisani || {}
  const sskIsYeriBilgisi = queryData?.sskIsYeriBilgisi || []

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
                  "text-xs px-2 py-1 transition-all duration-300 hover:scale-105 select-none",
                  isConnecting ? "cursor-not-allowed" : "cursor-pointer",
                  uyapStatus === "Bağlı"
                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    : uyapStatus === "Bağlanıyor"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
                  isConnecting && "animate-pulse-slow",
                )}
                style={{ animationDuration: isConnecting ? "3s" : undefined }}
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
          {error && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <span className="text-red-600">{error}</span>
              </CardContent>
            </Card>
          )}
          {!isLoading && !error && !queryData && (
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
          {!isLoading && !error && queryData && (
            <>
              {/* SSK Çalışanı Bilgileri */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    👨‍💼 SSK Çalışanı Bilgileri
                    <span className="text-sm font-normal text-green-700">✅ SSK çalışanı kaydı bulundu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alan</TableHead>
                        <TableHead>Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(sskCalisani).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Bağkur Çalışanı Bilgileri */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    👨‍💼 Bağkur Çalışanı Bilgileri
                    <span className="text-sm font-normal text-green-700">✅ Bağkur çalışanı kaydı bulundu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alan</TableHead>
                        <TableHead>Değer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(bagkurCalisani).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* SSK İş Yeri Bilgisi */}
              {sskIsYeriBilgisi.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      🏢 SSK İş Yeri Bilgisi
                      <span className="text-sm font-normal text-green-700">✅ İş yeri bilgisi bulundu</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sskIsYeriBilgisi.map((item, index) => (
                      <div key={index} className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Alan</TableHead>
                              <TableHead>Değer</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(item.data).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Fixed Footer - Minimized Height */}
        <div className="flex-shrink-0 px-6 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600 transition-all duration-300 px-2 py-1 rounded">
              <span className="font-medium">Son Sorgu Tarihi:</span>{' '}
              {queryData?.timestamp ? new Date(queryData.timestamp).toLocaleString("tr-TR") : "Henüz sorgu yapılmadı"}
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
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
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
