"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlacakliDosyalariModalProps {
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

interface AlacakliDosyalariData {
  file_id: number
  borclu_id: number
  alacakliDosyalariSonucu: {
    "İcra Dosyası": {
      sonuc: string
      icra_dosyalari: IcraDosyasi[]
    }
  }
  timestamp: string
}

interface IcraDosyasi {
  No: string
  "Birim Adi/Dosya": string
  "Takip Türü": string
  "Takip Yolu/Şekli": string
  Durumu: string
  Açılış: string
  Kapanış: string
}

export default function AlacakliDosyalariModal({
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
}: AlacakliDosyalariModalProps) {
  const [isQuerying, setIsQuerying] = useState(false)
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)
  const [showGreenBackground, setShowGreenBackground] = useState(false)
  const [queryData, setQueryData] = useState<AlacakliDosyalariData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current data from database when modal opens or when data might have changed
  const fetchCurrentData = async () => {
    if (!fileId || !borcluId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/icra-dosyalarim/${fileId}/${borcluId}/alacakli-dosyalari`)
      
      if (response.ok) {
        const data: AlacakliDosyalariData = await response.json()
        setQueryData(data)
      }
    } catch (error) {
      console.error("Error fetching current alacakli dosyalari data:", error)
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
  const alacakliDosyalariSonucu = queryData?.alacakliDosyalariSonucu?.["İcra Dosyası"]

  const handleSorgula = () => {
    // Disabled for now - will be implemented later with proper database integration
    console.log("UYAP'ta Sorgula button clicked - functionality disabled for now")
  }

  // Clean up timers when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsQuerying(false)
      setShowGreenBackground(false)
    }
  }, [isOpen])

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  const formatAcilisTarihi = (tarih: string) => {
    // Replace \n with space for display
    return tarih.replace("\n", " ")
  }

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case "Açık":
        return <span className="text-xs px-2 py-1 font-bold text-green-800">{durum}</span>
      case "Kapalı":
        return <span className="text-xs px-2 py-1 font-bold text-gray-800">{durum}</span>
      case "Beklemede":
        return <span className="text-xs px-2 py-1 font-bold text-yellow-800">{durum}</span>
      default:
        return <span className="text-xs px-2 py-1 font-bold text-blue-800">{durum}</span>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              📄 Alacaklı Dosyaları Sorgulama Sonuçları
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
            Borçlu kişinin alacaklı olduğu icra dosyalarını UYAP üzerinden sorgulama sonuçları
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
                  <div className="text-gray-400 mb-2">📄</div>
                  <p className="text-gray-600">Henüz alacaklı dosyaları verisi bulunmuyor</p>
                  <p className="text-sm text-gray-500 mt-1">UYAP'ta sorgula butonuna tıklayarak veri çekebilirsiniz</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alacakli Dosyalari Data */}
          {!isLoading && queryData && alacakliDosyalariSonucu && (
            <>
              {/* Sorgu Sonucu */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    📊 Sorgu Sonucu
                    <span className="text-sm font-normal text-green-700">
                      ✅ {alacakliDosyalariSonucu.icra_dosyalari.length} İcra Dosyası Bulundu
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* İcra Dosyaları Tablosu */}
              {alacakliDosyalariSonucu.sonuc === "Kişiye ait alacaklı olduğu İcra Dosyası kaydı var." && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      📄 Alacaklı Olduğu İcra Dosyaları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700 text-xs">No</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Birim Adı/Dosya</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Takip Türü</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Takip Yolu/Şekli</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Durumu</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Açılış</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs">Kapanış</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alacakliDosyalariSonucu.icra_dosyalari.map((dosya: IcraDosyasi) => (
                            <TableRow key={dosya.No} className="hover:bg-gray-50">
                              <TableCell className="text-xs py-2 font-medium">{dosya.No}</TableCell>
                              <TableCell className="text-xs py-2 break-words max-w-xs">
                                <span className="text-black">{dosya["Birim Adi/Dosya"]}</span>
                              </TableCell>
                              <TableCell className="text-xs py-2">
                                <span className="text-black">{dosya["Takip Türü"]}</span>
                              </TableCell>
                              <TableCell className="text-xs py-2 break-words max-w-md">
                                {dosya["Takip Yolu/Şekli"]}
                              </TableCell>
                              <TableCell className="text-xs py-2">{getDurumBadge(dosya.Durumu)}</TableCell>
                              <TableCell className="text-xs py-2 font-mono">
                                {formatAcilisTarihi(dosya["Açılış"])}
                              </TableCell>
                              <TableCell className="text-xs py-2 font-mono">
                                {dosya["Kapanış"] || <span className="text-gray-400 italic">Devam Ediyor</span>}
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
              disabled={true}
              size="sm"
              className="h-7 px-3 text-xs bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
            >
              <Search className="w-3 h-3 mr-1" />
              UYAP'ta Sorgula (Devre Dışı)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
