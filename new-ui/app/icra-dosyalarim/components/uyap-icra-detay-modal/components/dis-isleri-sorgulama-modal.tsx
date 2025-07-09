"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DisIsleriSorgulamaModalProps {
  isOpen: boolean
  onClose: () => void
  borcluAdi: string
  tcKimlik: string
  dosyaNo?: string
  fileId: string
  borcluId: string
  uyapStatus?: "Bağlı Değil" | "Bağlanıyor" | "Bağlı"
  onUyapToggle?: () => void
  isConnecting?: boolean
}

interface DisIsleriData {
  file_id: number
  borclu_id: number
  disIsleriSorguSonucu: {
    "Dış İşleri": {
      sonuc: string
      "Dış İşleri": string
    }
  }
  timestamp: string
}

export default function DisIsleriSorgulamaModal({
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
}: DisIsleriSorgulamaModalProps) {
  const [data, setData] = useState<DisIsleriData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)
  const [showGreenBackground, setShowGreenBackground] = useState(false)

  const fetchData = async () => {
    if (!fileId || !borcluId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/dis-isleri-sorgulama`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastQueryTime(new Date())
    } catch (err) {
      console.error("Error fetching dis isleri data:", err)
      setError(err instanceof Error ? err.message : "Veri yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && fileId && borcluId) {
      fetchData()
    }
  }, [isOpen, fileId, borcluId])

  // Clean up when modal closes
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

  const disIsleriSorguSonucu = data?.disIsleriSorguSonucu?.["Dış İşleri"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              🌍 Dış İşleri Sorgulama Sonuçları
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
            Borçlu kişinin dış işleri kayıtlarını UYAP üzerinden sorgulama sonuçları
          </DialogDescription>
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Dosya No:</span> {dosyaNo}
            <span className="font-medium ml-2">Borçlu:</span> {borcluAdi}
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Veriler yükleniyor...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-red-600">
                <p className="font-medium">Hata oluştu</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-600">
                <p>Veri bulunamadı</p>
              </div>
            </div>
          ) : (
            <>
              {/* Sorgu Sonucu */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    📊 Sorgu Sonucu
                    <span className="text-sm font-normal text-green-700">✅ Dış işleri kaydı bulundu</span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Dış İşleri Bilgisi */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🌍 Dış İşleri Bilgisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 font-medium">{disIsleriSorguSonucu?.["Dış İşleri"]}</p>
                  </div>
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
              disabled={true}
              size="sm"
              className="h-7 px-3 text-xs bg-gray-400 text-white cursor-not-allowed"
            >
              <Search className="w-3 h-3 mr-1" />
              UYAP'ta Sorgula
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
