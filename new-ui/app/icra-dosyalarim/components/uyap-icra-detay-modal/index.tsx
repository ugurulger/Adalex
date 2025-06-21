"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import DosyaDetayiTab from "./tabs/dosya-detayi-tab"
import EvrakGonderTab from "./tabs/evrak-gonder-tab"
import OdemeEkraniTab from "./tabs/odeme-ekrani-tab"
import NotlarTab from "./tabs/notlar-tab"
import IsAtamaTab from "./tabs/is-atama-tab"

interface UyapIcraDetayModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCase: any
}

export default function UyapIcraDetayModal({ isOpen, onClose, selectedCase }: UyapIcraDetayModalProps) {
  const [activeTab, setActiveTab] = useState("details")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] max-h-[95vh] min-h-[400px] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🏛️ UYAP İcra Dosyası Detayları
            <Badge className="bg-green-100 text-green-800 border-green-200">🔄 Canlı Veri</Badge>
          </DialogTitle>
        </DialogHeader>

        {selectedCase && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            {/* Fixed Tab Navigation */}
            <div className="flex-shrink-0 px-6 pt-4 pb-2 border-b border-gray-100">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details" className="text-sm">
                  📋 Dosya Detayı
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-sm">
                  📤 Evrak Gönder
                </TabsTrigger>
                <TabsTrigger value="payment" className="text-sm">
                  💰 Ödeme Ekranı
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-sm">
                  📝 Notlar
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-sm">
                  👥 İş Atama
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              {/* Tab Contents */}
              <TabsContent value="details" className="space-y-6 mt-0 data-[state=inactive]:hidden">
                <DosyaDetayiTab selectedCase={selectedCase} />
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

              {/* İşlem Butonları */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 mt-8 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 İşlemler</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    🔄 UYAP'tan Yenile
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    🌐 UYAP'ta Aç
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    📤 Dışa Aktar
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    ⏰ Hatırlatıcı
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    ✅ Tamamlandı
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    🖨️ Yazdır
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    📧 E-posta
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    📊 Rapor
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    📋 Kopyala
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 flex items-center justify-center gap-1 text-xs h-8 px-2"
                  >
                    🔗 Paylaş
                  </Button>
                </div>

                {/* Son Güncelleme Bilgisi */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      🕒 Son UYAP Güncellemesi: {new Date().toLocaleDateString("tr-TR")} 14:30
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Canlı Bağlantı Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
