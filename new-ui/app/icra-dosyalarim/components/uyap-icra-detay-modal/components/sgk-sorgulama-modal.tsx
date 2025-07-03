"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  sskCalisaniData,
  bagkurCalisaniData,
  sskIsYeriBilgisiData,
} from "@/app/icra-dosyalarim/components/uyap-icra-detay-modal/utils/sample-data"

interface SgkSorgulamaModalProps {
  isOpen: boolean
  onClose: () => void
  borcluAdi: string
  tcKimlik: string
  dosyaNo?: string
  uyapStatus?: "Bağlı Değil" | "Bağlanıyor" | "Bağlı"
  onUyapToggle?: () => void
  isConnecting?: boolean
}

export default function SgkSorgulamaModal({
  isOpen,
  onClose,
  borcluAdi,
  tcKimlik,
  dosyaNo,
  uyapStatus = "Bağlı",
  onUyapToggle,
  isConnecting = false,
}: SgkSorgulamaModalProps) {
  const [isQuerying, setIsQuerying] = useState(false)
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)
  const [showGreenBackground, setShowGreenBackground] = useState(false)

  // Sample data - in real app this would come from API
  const sskCalisani = sskCalisaniData
  const bagkurCalisani = bagkurCalisaniData
  const sskIsYeriBilgisi = sskIsYeriBilgisiData

  const handleSorgula = () => {
    if (isQuerying) return

    setIsQuerying(true)

    // Simulate query process for 3 seconds
    setTimeout(() => {
      setIsQuerying(false)
      setLastQueryTime(new Date())
      setShowGreenBackground(true)

      // Remove green background after 5 seconds
      setTimeout(() => {
        setShowGreenBackground(false)
      }, 5000)
    }, 3000)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              🏢 SGK Sorgulama Sonuçları
              <Badge
                onClick={onUyapToggle}
                disabled={isConnecting}
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
            <span className="font-medium">Dosya No:</span> {dosyaNo || "2024/1234"} •
            <span className="font-medium ml-2">Borçlu:</span> {borcluAdi}
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SSK Çalışanı Bilgileri */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                👷 SSK Çalışanı Bilgileri
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
              {sskIsYeriBilgisi.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{item.title}</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700 text-xs w-2/5">Bilgi Türü</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs w-3/5">Değer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(item.data).map(([key, value]) => (
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
                </div>
              ))}
            </CardContent>
          </Card>
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
              disabled={isQuerying}
              size="sm"
              className={cn(
                "h-7 px-3 text-xs transition-all duration-300",
                isQuerying
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 text-white",
              )}
            >
              {isQuerying ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>UYAP'ta Sorgulanıyor</span>
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
