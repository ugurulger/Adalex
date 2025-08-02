"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface NotlarTabProps {
  selectedCase: any
}

export default function NotlarTab({ selectedCase }: NotlarTabProps) {
  return (
    <div className="space-y-4">
      {/* Vertical Layout - All blocks stacked */}

      {/* 1. Yeni Not Ekle - Top Block */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">📝 Yeni Not Ekle</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-gray-600">Not Başlığı</Label>
            <input
              type="text"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              placeholder="Not başlığını giriniz..."
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-600">Not İçeriği</Label>
            <textarea
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs resize-none"
              rows={6}
              placeholder="Dosya ile ilgili notlarınızı buraya yazabilirsiniz..."
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500">
              Not otomatik olarak tarih ve kullanıcı bilgisi ile kaydedilecektir.
            </span>
            <Button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 h-8 text-xs">📝 Not Ekle</Button>
          </div>
        </div>
      </div>

      {/* 2. Manuel Notlar - Bottom Block (Responsive) */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">📋 Manuel Notlar</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-gray-600">Mevcut Notlar ({selectedCase.notSayisi || 5})</Label>
            <Button variant="outline" size="sm" className="text-xs h-6">
              🔍 Ara
            </Button>
          </div>

          {/* Mobile Card View - Visible on small screens */}
          <div className="block lg:hidden">
            <div className="bg-white rounded border max-h-96 overflow-y-auto">
              <div className="space-y-1 p-2">
                {/* Not Listesi - Mobile Cards */}
                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">Borçlu Görüşme Notu</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">25.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    {selectedCase.notlar ||
                      "Borçlu ile telefon görüşmesi yapıldı. Ödeme planı önerisi reddedildi. Yasal süreç başlatılacak."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">14:30</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">Ödeme Planı Teklifi</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">23.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    Borçluya 6 aylık ödeme planı teklif edildi. Aylık 2.500 TL taksit önerisi yapıldı.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">11:20</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">UYAP Güncelleme</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">20.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    UYAP'tan otomatik güncelleme: Tebligat tamamlandı. Borçlu tebligatı almış durumda.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Sistem</span>
                    <span className="text-xs text-gray-400">09:15</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">İlk Görüşme</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">18.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    Borçlu ile ilk görüşme gerçekleştirildi. Ödeme konusunda istekli görünüyor.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">16:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View - Hidden on small screens */}
          <div className="hidden lg:block">
            <div className="bg-white rounded border max-h-96 overflow-y-auto">
              <div className="space-y-1 p-2">
                {/* Not Listesi - Desktop Layout */}
                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">Borçlu Görüşme Notu</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">25.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    {selectedCase.notlar ||
                      "Borçlu ile telefon görüşmesi yapıldı. Ödeme planı önerisi reddedildi. Yasal süreç başlatılacak."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">14:30</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">Ödeme Planı Teklifi</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">23.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    Borçluya 6 aylık ödeme planı teklif edildi. Aylık 2.500 TL taksit önerisi yapıldı.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">11:20</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">UYAP Güncelleme</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">20.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    UYAP'tan otomatik güncelleme: Tebligat tamamlandı. Borçlu tebligatı almış durumda.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Sistem</span>
                    <span className="text-xs text-gray-400">09:15</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-gray-900">İlk Görüşme</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">18.01.2024</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600">
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    Borçlu ile ilk görüşme gerçekleştirildi. Ödeme konusunda istekli görünüyor.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600">Av. Fatma Demir</span>
                    <span className="text-xs text-gray-400">16:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button variant="outline" size="sm" className="text-xs h-6">
              📄 Daha Fazla Yükle
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
