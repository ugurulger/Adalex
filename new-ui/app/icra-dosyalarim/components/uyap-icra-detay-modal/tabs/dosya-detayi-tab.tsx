"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "../utils/status-badges"
import AdresSorgulamaModal from "../components/adres-sorgulama-modal"
import AracSorgulamaModal from "../components/arac-sorgulama-modal"
import GayrimenkulSorgulamaModal from "../components/gayrimenkul-sorgulama-modal"
import AlacakliDosyalariModal from "../components/alacakli-dosyalari-modal"
import BankaSorgulamaModal from "../components/banka-sorgulama-modal"
import TelefonSorgulamaModal from "../components/telefon-sorgulama-modal"
import SgkHacizSorgulamaModal from "../components/sgk-haciz-sorgulama-modal"
import GibSorgulamaModal from "../components/gib-sorgulama-modal"
import IskiSorgulamaModal from "../components/iski-sorgulama-modal"
import PostaCekiSorgulamaModal from "../components/posta-ceki-sorgulama-modal"
import DisIsleriSorgulamaModal from "../components/dis-isleri-sorgulama-modal"
import SgkSorgulamaModal from "../components/sgk-sorgulama-modal"

interface DosyaDetayiTabProps {
  selectedCase: any
  uyapStatus?: "Bağlı Değil" | "Bağlanıyor" | "Bağlı"
  onUyapToggle?: () => void
  isConnecting?: boolean
}

export default function DosyaDetayiTab({
  selectedCase,
  uyapStatus = "Bağlı",
  onUyapToggle,
  isConnecting = false,
}: DosyaDetayiTabProps) {
  const [isAdresModalOpen, setIsAdresModalOpen] = useState(false)
  const [isAracModalOpen, setIsAracModalOpen] = useState(false)
  const [isGayrimenkulModalOpen, setIsGayrimenkulModalOpen] = useState(false)
  const [isAlacakliDosyalariModalOpen, setIsAlacakliDosyalariModalOpen] = useState(false)
  const [isBankaModalOpen, setIsBankaModalOpen] = useState(false)
  const [isTelefonModalOpen, setIsTelefonModalOpen] = useState(false)
  const [isSgkHacizModalOpen, setIsSgkHacizModalOpen] = useState(false)
  const [isGibModalOpen, setIsGibModalOpen] = useState(false)
  const [isIskiModalOpen, setIsIskiModalOpen] = useState(false)
  const [isPostaCekiModalOpen, setIsPostaCekiModalOpen] = useState(false)
  const [isDisIsleriModalOpen, setIsDisIsleriModalOpen] = useState(false)
  const [isSgkModalOpen, setIsSgkModalOpen] = useState(false)
  const [selectedBorclu, setSelectedBorclu] = useState<any>(null)

  const handleAdresClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsAdresModalOpen(true)
  }

  const handleAracClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsAracModalOpen(true)
  }

  const handleGayrimenkulClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsGayrimenkulModalOpen(true)
  }

  const handleAlacakliDosyalariClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsAlacakliDosyalariModalOpen(true)
  }

  const handleBankaClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsBankaModalOpen(true)
  }

  const handleTelefonClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsTelefonModalOpen(true)
  }

  const handleSgkHacizClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsSgkHacizModalOpen(true)
  }

  const handleGibClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsGibModalOpen(true)
  }

  const handleIskiClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsIskiModalOpen(true)
  }

  const handlePostaCekiClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsPostaCekiModalOpen(true)
  }

  const handleDisIsleriClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsDisIsleriModalOpen(true)
  }

  const handleSgkClick = (borclu: any) => {
    setSelectedBorclu(borclu)
    setIsSgkModalOpen(true)
  }

  return (
    <div className="space-y-3">
      {/* Genel Dosya Bilgileri */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
          📋 Genel Dosya Bilgileri
          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">UYAP Entegre</Badge>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya Türü</Label>
            <p className="text-gray-900 font-medium text-xs">{selectedCase.foyTuru}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Türü</Label>
            <p className="text-gray-900 text-xs">{selectedCase.takipTuru || "İlamsız Takip"}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Yolu</Label>
            <p className="text-gray-900 text-xs">{selectedCase.takipYolu || "Genel Haciz"}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Takip Şekli</Label>
            <p className="text-gray-900 text-xs">{selectedCase.takipSekli}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya Durumu</Label>
            <div className="mt-1">{getStatusBadge(selectedCase.durum)}</div>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Dosya No</Label>
            <p className="text-sm font-bold text-blue-600">{selectedCase.dosyaNo}</p>
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
            <p className="text-gray-900 font-medium text-xs">{selectedCase.alacakliAdi}</p>
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
            <p className="text-gray-900 text-xs">{selectedCase.faizOrani || "%24 (Yıllık)"}</p>
          </div>
          <div>
            <Label className="text-xs font-bold text-gray-600">Güncel Borç</Label>
            <p className="text-gray-900 font-bold text-red-600 text-xs">{selectedCase.guncelBorc}</p>
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

                {/* Mobile Layout - Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdresClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🏠 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Adres</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSgkClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🏥 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">SGK</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAracClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🚗 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Araç</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGayrimenkulClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🏘️ <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Gayrimenkul</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAlacakliDosyalariClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      📄 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Alacaklı Dosyası</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSgkHacizClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      �����️ <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">SGK Haciz</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTelefonClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      📞 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Telefon</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBankaClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🏦 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Banka</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGibClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      💰 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">GİB</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIskiClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      💧 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">İSKİ</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePostaCekiClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      📮 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Posta Çeki</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisIsleriClick(borclu)}
                    className="flex flex-col items-center justify-center gap-1 h-16 text-xs border-blue-200 hover:bg-blue-50 p-2"
                  >
                    <div className="flex items-center gap-1">
                      🌍 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[10px]">Dış İşleri</span>
                  </Button>
                </div>

                {/* Desktop Layout - Original Complex Layout */}
                <div className="hidden lg:flex w-full justify-between items-center">
                  {/* Six standalone buttons - each with flex-1 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdresClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      🏠 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Adres</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSgkClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      🏥 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">SGK</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAracClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      🚗 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Araç</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGayrimenkulClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      🏘️ <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Gayrimenkul</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAlacakliDosyalariClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      📄 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">Alacaklı Dosyası</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSgkHacizClick(borclu)}
                    className="flex-1 flex flex-row items-center justify-center gap-1 h-12 text-xs border-blue-200 hover:bg-blue-50 p-1 mx-0.5"
                  >
                    <div className="flex items-center gap-1">
                      ⚖️ <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <span className="text-[8px]">SGK Haciz</span>
                  </Button>

                  {/* Three vertical stacks - each with flex-1 */}
                  <div className="flex-1 flex flex-col gap-1 mx-0.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTelefonClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        📞 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">Telefon</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBankaClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        🏦 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">Banka</span>
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 mx-0.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGibClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        💰 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">GİB</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIskiClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        💧 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">İSKİ</span>
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 mx-0.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePostaCekiClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        📮 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">Posta Çeki</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisIsleriClick(borclu)}
                      className="w-full flex flex-row items-center justify-center gap-1 h-5 text-xs border-blue-200 hover:bg-blue-50 p-1"
                    >
                      <div className="flex items-center gap-1">
                        🌍 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                      <span className="text-[7px]">Dış İşleri</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-[7px] text-gray-600 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span> Güncel
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span> Sorgulama Gerekli
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span> Veri Yok
                  </span>
                </div>
              </div>

              {/* Add separator between debtors (except for the last one) */}
              {index < selectedCase.borcluList.length - 1 && <div className="border-b border-red-300 my-4"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Adres Sorgulama Modal */}
      <AdresSorgulamaModal
        isOpen={isAdresModalOpen}
        onClose={() => setIsAdresModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Araç Sorgulama Modal */}
      <AracSorgulamaModal
        isOpen={isAracModalOpen}
        onClose={() => setIsAracModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Gayrimenkul Sorgulama Modal */}
      <GayrimenkulSorgulamaModal
        isOpen={isGayrimenkulModalOpen}
        onClose={() => setIsGayrimenkulModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Alacaklı Dosyaları Modal */}
      <AlacakliDosyalariModal
        isOpen={isAlacakliDosyalariModalOpen}
        onClose={() => setIsAlacakliDosyalariModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Banka Sorgulama Modal */}
      <BankaSorgulamaModal
        isOpen={isBankaModalOpen}
        onClose={() => setIsBankaModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Telefon Sorgulama Modal */}
      <TelefonSorgulamaModal
        isOpen={isTelefonModalOpen}
        onClose={() => setIsTelefonModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* SGK Haciz Sorgulama Modal */}
      <SgkHacizSorgulamaModal
        isOpen={isSgkHacizModalOpen}
        onClose={() => setIsSgkHacizModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* GİB Sorgulama Modal */}
      <GibSorgulamaModal
        isOpen={isGibModalOpen}
        onClose={() => setIsGibModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* İSKİ Sorgulama Modal */}
      <IskiSorgulamaModal
        isOpen={isIskiModalOpen}
        onClose={() => setIsIskiModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Posta Çeki Sorgulama Modal */}
      <PostaCekiSorgulamaModal
        isOpen={isPostaCekiModalOpen}
        onClose={() => setIsPostaCekiModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Dış İşleri Sorgulama Modal */}
      <DisIsleriSorgulamaModal
        isOpen={isDisIsleriModalOpen}
        onClose={() => setIsDisIsleriModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />

      {/* SGK Sorgulama Modal */}
      <SgkSorgulamaModal
        isOpen={isSgkModalOpen}
        onClose={() => setIsSgkModalOpen(false)}
        borcluAdi={selectedBorclu?.ad || ""}
        tcKimlik={selectedBorclu?.tcKimlik || ""}
        dosyaNo={selectedCase?.dosyaNo}
        fileId={selectedCase?.file_id?.toString()}
        borcluId={selectedBorclu?.borclu_id}
        uyapStatus={uyapStatus}
        onUyapToggle={onUyapToggle}
        isConnecting={isConnecting}
      />
    </div>
  )
}
