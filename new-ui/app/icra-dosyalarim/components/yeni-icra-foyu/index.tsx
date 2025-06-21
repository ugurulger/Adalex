"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import GenelDosyaBilgileriTab from "./tabs/genel-dosya-bilgileri-tab"
import AlacakliBilgileriTab from "./tabs/alacakli-bilgileri-tab"
import BorcluBilgileriTab from "./tabs/borclu-bilgileri-tab"
import AlacakKalemleriTab from "./tabs/alacak-kalemleri-tab"
import IlamBilgileriTab from "./tabs/ilam-bilgileri-tab"
import VekilBilgileriTab from "./tabs/vekil-bilgileri-tab"
import TalepAciklamasiTab from "./tabs/talep-aciklamasi-tab"
import type { FormData, FormErrors } from "./types/form-types"
import { validateForm } from "./utils/form-validation"

interface YeniIcraFoyuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => void
}

export default function YeniIcraFoyuModal({ isOpen, onClose, onSave }: YeniIcraFoyuModalProps) {
  const [activeTab, setActiveTab] = useState("genel")
  const [formData, setFormData] = useState<FormData>({
    genelBilgiler: {
      takipTuru: "",
      dosyaTipi: "",
      takipTarihi: undefined,
      mahiyetKodu: "",
      aciklama: "",
    },
    alacakliBilgileri: {
      tcknVkn: "",
      adSoyad: "",
      adresBilgisi: {
        adresTuru: "",
        il: "",
        ilce: "",
        adres: "",
      },
      telefon: "",
      cepTelefonu: "",
      email: "",
    },
    borcluBilgileri: [
      {
        id: 1,
        tcknVkn: "",
        adSoyad: "",
        adresBilgisi: {
          adresTuru: "",
          il: "",
          ilce: "",
          adres: "",
        },
        rol: "BORÇLU",
      },
    ],
    alacakKalemleri: [
      {
        id: 1,
        kalemAdi: "",
        tutar: "",
        faizTipi: "",
        faizBaslangicTarihi: undefined,
        faizOrani: "",
        aciklama: "",
      },
    ],
    ilamBilgileri: {
      mahkemeAdi: "",
      kararYili: "",
      dosyaNo: "",
      kararTarihi: undefined,
      ilamKalemleri: [],
    },
    vekilBilgileri: {
      tckn: "",
      adSoyad: "",
      baroNo: "",
      adres: "",
      buroAdi: "",
    },
    talepAciklamasi: {
      talepMetni: "",
      icraYolu: "",
      talepTipi: "",
      aciklama48e9: "",
    },
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tabs = [
    { id: "genel", label: "Genel Dosya Bilgileri", icon: "📋" },
    { id: "alacakli", label: "Alacaklı Bilgileri", icon: "🏢" },
    { id: "borclu", label: "Borçlu Bilgileri", icon: "👤" },
    { id: "alacak", label: "Alacak Kalemleri", icon: "💰" },
    { id: "ilam", label: "İlam Bilgileri", icon: "⚖️" },
    { id: "vekil", label: "Vekil Bilgileri", icon: "👨‍💼" },
    { id: "talep", label: "Talep Açıklaması", icon: "📝" },
  ]

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const progress = ((currentTabIndex + 1) / tabs.length) * 100

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📋 Yeni İcra Föyü Oluştur
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Adım {currentTabIndex + 1}/7</Badge>
          </DialogTitle>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>İlerleme Durumu</span>
              <span>{Math.round(progress)}% Tamamlandı</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 h-auto p-1">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 p-3 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:block text-center leading-tight">{tab.label}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="genel" className="space-y-6 mt-6">
              <GenelDosyaBilgileriTab
                data={formData.genelBilgiler}
                onChange={(data) => updateFormData("genelBilgiler", data)}
                errors={errors.genelBilgiler}
              />
            </TabsContent>

            <TabsContent value="alacakli" className="space-y-6 mt-6">
              <AlacakliBilgileriTab
                data={formData.alacakliBilgileri}
                onChange={(data) => updateFormData("alacakliBilgileri", data)}
                errors={errors.alacakliBilgileri}
              />
            </TabsContent>

            <TabsContent value="borclu" className="space-y-6 mt-6">
              <BorcluBilgileriTab
                data={formData.borcluBilgileri}
                onChange={(data) => updateFormData("borcluBilgileri", data)}
                errors={errors.borcluBilgileri}
              />
            </TabsContent>

            <TabsContent value="alacak" className="space-y-6 mt-6">
              <AlacakKalemleriTab
                data={formData.alacakKalemleri}
                onChange={(data) => updateFormData("alacakKalemleri", data)}
                errors={errors.alacakKalemleri}
              />
            </TabsContent>

            <TabsContent value="ilam" className="space-y-6 mt-6">
              <IlamBilgileriTab
                data={formData.ilamBilgileri}
                onChange={(data) => updateFormData("ilamBilgileri", data)}
                errors={errors.ilamBilgileri}
                takipTuru={formData.genelBilgiler.takipTuru}
              />
            </TabsContent>

            <TabsContent value="vekil" className="space-y-6 mt-6">
              <VekilBilgileriTab
                data={formData.vekilBilgileri}
                onChange={(data) => updateFormData("vekilBilgileri", data)}
                errors={errors.vekilBilgileri}
              />
            </TabsContent>

            <TabsContent value="talep" className="space-y-6 mt-6">
              <TalepAciklamasiTab
                data={formData.talepAciklamasi}
                onChange={(data) => updateFormData("talepAciklamasi", data)}
                errors={errors.talepAciklamasi}
                takipTuru={formData.genelBilgiler.takipTuru}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentTabIndex === 0}
              className="flex items-center gap-2"
            >
              ← Önceki Adım
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>

              {currentTabIndex === tabs.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>✅ Föyü Oluştur</>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  Sonraki Adım →
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
