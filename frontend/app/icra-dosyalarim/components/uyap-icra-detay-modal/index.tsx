"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import DosyaDetayiTab from "./tabs/dosya-detayi-tab"
import EvrakGonderTab from "./tabs/evrak-gonder-tab"
import OdemeEkraniTab from "./tabs/odeme-ekrani-tab"
import NotlarTab from "./tabs/notlar-tab"
import IsAtamaTab from "./tabs/is-atama-tab"
import DosyaOzetiTab from "./tabs/dosya-ozeti-tab"
import EvrakOlusturTab from "./tabs/evrak-olustur-tab"

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
  const [parentTab, setParentTab] = useState("uyap")
  const [uyapChildTab, setUyapChildTab] = useState("details")
  const [evrakSubTab, setEvrakSubTab] = useState("gonder") // New state for Evrak sub-tabs
  const [defterimChildTab, setDefterimChildTab] = useState("notes")

  // Get current child tab based on parent tab
  const getCurrentChildTab = () => {
    return parentTab === "uyap" ? uyapChildTab : defterimChildTab
  }

  // Set child tab based on parent tab
  const setCurrentChildTab = (value: string) => {
    if (parentTab === "uyap") {
      setUyapChildTab(value)
    } else {
      setDefterimChildTab(value)
    }
  }

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
          <div className="flex flex-col flex-1 min-h-0">
            {/* Contiguous Tab Navigation - Multiple Rows */}
            <div className="flex-shrink-0 px-6 pt-3 pb-3 border-b border-gray-100">
              {/* Parent Tab Navigation - First Row */}
              <div>
                <Tabs value={parentTab} onValueChange={setParentTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 gap-1 h-7 py-0.5">
                    <TabsTrigger value="uyap" className="text-sm px-4 h-6 font-semibold">
                      🏛️ UYAP
                    </TabsTrigger>
                    <TabsTrigger value="defterim" className="text-sm px-4 h-6 font-semibold">
                      📚 DEFTERİM
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Child Tab Navigation - Second Row */}
              <div>
                <Tabs value={getCurrentChildTab()} onValueChange={setCurrentChildTab} className="w-full">
                  <TabsList
                    className={cn(
                      "w-full gap-1 h-7 py-0.5",
                      parentTab === "uyap"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                    )}
                  >
                    {parentTab === "uyap" ? (
                      <>
                        <TabsTrigger value="details" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          📋 Dosya Detayı
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          📄 Evrak
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          💰 Ödeme Ekranı
                        </TabsTrigger>
                      </>
                    ) : (
                      <>
                        <TabsTrigger value="summary" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          📊 Dosya Özeti
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          📝 Notlar
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                          👥 İş Atama
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </Tabs>
              </div>

              {/* Evrak Sub-Tab Navigation - Third Row (only show when Evrak is selected) */}
              {parentTab === "uyap" && uyapChildTab === "documents" && (
                <div>
                  <Tabs value={evrakSubTab} onValueChange={setEvrakSubTab} className="w-full">
                    <TabsList className="w-full gap-1 h-7 py-0.5 grid grid-cols-1 sm:grid-cols-2">
                      <TabsTrigger value="gonder" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                        📤 Evrak Gönder
                      </TabsTrigger>
                      <TabsTrigger value="olustur" className="text-xs sm:text-sm px-1 sm:px-3 h-6">
                        📝 Evrak Oluştur
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              {/* UYAP Tab Contents */}
              {parentTab === "uyap" && (
                <>
                  {uyapChildTab === "details" && (
                    <DosyaDetayiTab
                      selectedCase={selectedCase}
                      uyapStatus={uyapStatus}
                      onUyapToggle={onUyapToggle}
                      isConnecting={isConnecting}
                    />
                  )}
                  {uyapChildTab === "documents" && (
                    <>
                      {evrakSubTab === "gonder" && <EvrakGonderTab />}
                      {evrakSubTab === "olustur" && <EvrakOlusturTab />}
                    </>
                  )}
                  {uyapChildTab === "payment" && <OdemeEkraniTab />}
                </>
              )}

              {/* DEFTERİM Tab Contents */}
              {parentTab === "defterim" && (
                <>
                  {defterimChildTab === "summary" && <DosyaOzetiTab selectedCase={selectedCase} />}
                  {defterimChildTab === "notes" && <NotlarTab selectedCase={selectedCase} />}
                  {defterimChildTab === "tasks" && <IsAtamaTab />}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
