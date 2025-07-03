"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import DosyaDetayiTab from "./tabs/dosya-detayi-tab"
import EvrakGonderTab from "./tabs/evrak-gonder-tab"
import OdemeEkraniTab from "./tabs/odeme-ekrani-tab"
import NotlarTab from "./tabs/notlar-tab"
import IsAtamaTab from "./tabs/is-atama-tab"

interface UyapIcraDetayModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: any
  uyapStatus: "Bağlı Değil" | "Bağlanıyor" | "Bağlı"
  onUyapToggle: () => void
  isConnecting: boolean
}

export default function UyapIcraDetayModal({
  isOpen,
  onClose,
  selectedCase,
  uyapStatus,
  onUyapToggle,
  isConnecting,
}: UyapIcraDetayModalProps) {
  const [activeTab, setActiveTab] = useState("details")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] max-h-[95vh] min-h-[400px] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🏛️ UYAP İcra Dosyası Detayları
            {/* Uyap Status Badge next to title */}
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
          </DialogTitle>
          <DialogDescription className="sr-only">
            UYAP İcra dosyası detaylarını görüntülemek ve yönetmek için kullanılan modal pencere
          </DialogDescription>
        </DialogHeader>

        {selectedCase && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            {/* Fixed Tab Navigation */}
            <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-gray-100">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-0 h-auto lg:h-10 py-1 lg:py-1">
                <TabsTrigger value="details" className="text-xs sm:text-sm px-1 sm:px-3 h-8 lg:h-9">
                  📋 Dosya Detayı
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm px-1 sm:px-3 h-8 lg:h-9">
                  📤 Evrak Gönder
                </TabsTrigger>
                <TabsTrigger value="payment" className="text-xs sm:text-sm px-1 sm:px-3 h-8 lg:h-9">
                  💰 Ödeme Ekranı
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs sm:text-sm px-1 sm:px-3 h-8 lg:h-9">
                  📝 Notlar
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs sm:text-sm px-1 sm:px-3 h-8 lg:h-9">
                  👥 İş Atama
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              {/* Tab Contents */}
              <TabsContent value="details" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <DosyaDetayiTab
                  selectedCase={selectedCase}
                  uyapStatus={uyapStatus}
                  onUyapToggle={onUyapToggle}
                  isConnecting={isConnecting}
                />
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <EvrakGonderTab />
              </TabsContent>

              <TabsContent value="payment" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <OdemeEkraniTab />
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <NotlarTab selectedCase={selectedCase} />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <IsAtamaTab />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
