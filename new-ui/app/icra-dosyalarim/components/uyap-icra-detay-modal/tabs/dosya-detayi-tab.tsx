"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "../utils/status-badges"

interface DosyaDetayiTabProps {
  selectedCase: any
}

export default function DosyaDetayiTab({ selectedCase }: DosyaDetayiTabProps) {
  return (
    <div className="space-y-3">
      {/* Genel Dosya Bilgileri */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
          📋 Genel Dosya Bilgileri
          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">UYAP Entegre</Badge>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya Türü</Label>
            <p className="text-gray-900 font-medium text-xs">{selectedCase.foyTuru}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Yolu</Label>
            <p className="text-gray-900 text-xs">Genel Haciz</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Usulü</Label>
            <p className="text-gray-900 text-xs">İİK m.68</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya Durumu</Label>
            <div className="mt-1">{getStatusBadge(selectedCase.durum)}</div>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya No</Label>
            <p className="text-sm font-bold text-blue-600">{selectedCase.eNo}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Tarihi</Label>
            <p className="text-gray-900 text-xs">{selectedCase.takipTarihi}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">İcra Müdürlüğü</Label>
            <p className="text-gray-900 text-xs">{selectedCase.icraMudurlugu}</p>
          </div>
        </div>
      </div>

      {/* Alacaklı Bilgileri */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">🏢 Alacaklı Bilgileri</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div>
            <Label className="text-xs font-bold text-gray-600">Alacaklı Adı</Label>
            <p className="text-gray-900 font-medium text-xs">{selectedCase.alacakli}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Alacaklı Vekili</Label>
            <p className="text-gray-900 text-xs">{selectedCase.alacakliVekili}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Borç Miktarı</Label>
            <p className="text-gray-900 font-bold text-red-600 text-sm">{selectedCase.borcMiktari}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Faiz Oranı</Label>
            <p className="text-gray-900 text-xs">%24 (Yıllık)</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Güncel Borç</Label>
            <p className="text-gray-900 font-bold text-red-600 text-xs">
              {Number.parseFloat(selectedCase.borcMiktari.replace(/[^\d,]/g, "").replace(",", ".")) * 1.15}₺
            </p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Son Ödeme</Label>
            <p className="text-gray-900 text-xs">Ödeme Yok</p>
          </div>
        </div>
      </div>

      {/* Merged Borçlu Bilgileri - Single Block for All Debtors */}
      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">👤 Borçlu Bilgileri</h3>

        <div className="space-y-4">
          {selectedCase.borcluList?.map((borclu: any, index: number) => (
            <div key={index} className="space-y-3">
              {/* Borçlu Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                <div>
                  <Label className="text-xs font-bold text-gray-600">Borçlu Adı</Label>
                  <p className="text-gray-900 font-medium text-xs">{borclu.ad}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-600">T.C. Kimlik</Label>
                  <p className="text-gray-900 font-mono text-xs">{borclu.tcKimlik}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-600">Telefon</Label>
                  <p className="text-gray-900 text-xs">{borclu.telefon}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-bold text-gray-600">Adres</Label>
                  <p className="text-gray-900 text-xs">{borclu.adres}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-600">Borçlu Vekili</Label>
                  <p className="text-gray-900 text-xs">{borclu.vekil}</p>
                </div>
              </div>

              {/* Borçlu Sorgulama Araçları - For each debtor */}
              <div className="pt-3 mt-3">
                <h5 className="text-xs font-semibold text-gray-900 mb-2">🔍 Borçlu Sorgulama Araçları</h5>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      🏠 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Adres</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      📞 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Telefon</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      🏥 <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">SGK</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      🚗 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Araç</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      🏘️ <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Gayrimenkul</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      🏦 <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Banka</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1"
                  >
                    <div className="flex items-center gap-1">
                      📄 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Alacaklı Dosyaları</span>
                  </Button>
                </div>
                <div className="mt-2 text-[8px] text-gray-600 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Güncel
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Sorgulama Gerekli
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Veri Yok
                  </span>
                </div>
              </div>

              {/* Add separator between debtors (except for the last one) */}
              {index < selectedCase.borcluList.length - 1 && <div className="border-b border-red-300 my-4"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
