"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import TurleriSecmePage from "./pages/turleri-secme-page"
import AlacakliBilgisiPage from "./pages/alacakli-bilgisi-page"
import BorcluBilgisiPage from "./pages/borclu-bilgisi-page"
import TurlereGoreSecimPage from "./pages/turlere-gore-secim-page"
import { type FormData, TAKIP_YOLU_OPTIONS } from "./types/form-types"

interface YeniIcraFoyuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: FormData) => Promise<void>
}

export default function YeniIcraFoyuModal({ isOpen, onClose, onSave }: YeniIcraFoyuModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Page 1 - Türleri Seçme
    takipTuru: "",
    takipYolu: "",

    // Page 2 - Alacaklı Bilgisi
    alacakliTipi: "",
    alacakliAdSoyad: "",
    alacakliTcKimlik: "",
    alacakliSirketUnvani: "",
    alacakliVergiNumarasi: "",
    alacakliTelefon: "",
    alacakliAdres: "",

    // Page 3 - Borçlu Bilgileri
    borcluTipi: "",
    borcluAdSoyad: "",
    borcluTcKimlik: "",
    borcluSirketUnvani: "",
    borcluVergiNumarasi: "",
    borcluTelefon: "",
    borcluAdres: "",

    // Page 4 - Türlere Göre Seçim (dynamic fields)
    dynamicFields: {},
  })

  const pages = [
    { title: "Takip Türü ve Yolu Seçimi", component: TurleriSecmePage },
    { title: "Alacaklı Bilgisi", component: AlacakliBilgisiPage },
    { title: "Borçlu Bilgileri", component: BorcluBilgisiPage },
    { title: "Türlere Göre Seçim", component: TurlereGoreSecimPage },
  ]

  const handleClose = () => {
    setCurrentPage(1)
    setFormData({
      takipTuru: "",
      takipYolu: "",
      alacakliTipi: "",
      alacakliAdSoyad: "",
      alacakliTcKimlik: "",
      alacakliSirketUnvani: "",
      alacakliVergiNumarasi: "",
      alacakliTelefon: "",
      alacakliAdres: "",
      borcluTipi: "",
      borcluAdSoyad: "",
      borcluTcKimlik: "",
      borcluSirketUnvani: "",
      borcluVergiNumarasi: "",
      borcluTelefon: "",
      borcluAdres: "",
      dynamicFields: {},
    })
    onClose()
  }

  const handleNext = () => {
    if (currentPage < pages.length && isCurrentPageValid()) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (onSave) {
        await onSave(formData)
      } else {
        // Default save behavior - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      handleClose()
    } catch (error) {
      console.error("Error saving form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  // Validation logic for each page
  const isCurrentPageValid = () => {
    switch (currentPage) {
      case 1:
        return formData.takipTuru && formData.takipYolu
      case 2:
        if (formData.alacakliTipi === "gercek_kisi") {
          return (
            formData.alacakliAdSoyad && formData.alacakliTcKimlik && formData.alacakliTelefon && formData.alacakliAdres
          )
        }
        if (formData.alacakliTipi === "tuzel_kisi") {
          return (
            formData.alacakliSirketUnvani &&
            formData.alacakliVergiNumarasi &&
            formData.alacakliTelefon &&
            formData.alacakliAdres
          )
        }
        return false
      case 3:
        if (formData.borcluTipi === "gercek_kisi") {
          return formData.borcluAdSoyad && formData.borcluTcKimlik && formData.borcluTelefon && formData.borcluAdres
        }
        if (formData.borcluTipi === "tuzel_kisi") {
          return (
            formData.borcluSirketUnvani &&
            formData.borcluVergiNumarasi &&
            formData.borcluTelefon &&
            formData.borcluAdres
          )
        }
        return false
      case 4:
        // Add validation for dynamic fields based on takip yolu
        return true // For now, always allow submission from page 4
      default:
        return false
    }
  }

  // Generate header text based on current page and form data
  const getHeaderText = () => {
    const baseTitle = pages[currentPage - 1].title

    if (currentPage === 4 && formData.takipTuru && formData.takipYolu) {
      const takipYoluLabel = TAKIP_YOLU_OPTIONS[formData.takipTuru as keyof typeof TAKIP_YOLU_OPTIONS]?.find(
        (option) => option.value === formData.takipYolu,
      )?.label

      if (takipYoluLabel) {
        return `${baseTitle} - ${formData.takipTuru} / ${takipYoluLabel}`
      }
    }

    return baseTitle
  }

  const CurrentPageComponent = pages[currentPage - 1].component

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 max-h-[90vh] flex flex-col h-[90vh]">
        {/* Fixed Header */}
        <div className="py-3 px-6 border-b bg-white flex items-center">
          <DialogTitle className="text-lg font-semibold sr-only">{getHeaderText()}</DialogTitle>
          <h2 className="text-lg font-semibold">{getHeaderText()}</h2>
        </div>

        {/* Scrollable Content Area - No padding */}
        <div className="flex-1 overflow-y-auto">
          <CurrentPageComponent
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstPage={currentPage === 1}
            isLastPage={currentPage === pages.length}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Fixed Footer */}
        <div className="py-3 px-6 border-t bg-white mt-auto">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-1 bg-transparent h-8 text-sm"
            >
              <ChevronLeft className="w-3 h-3" />
              Önceki
            </Button>

            {/* Page Info in the middle */}
            <div className="text-sm text-gray-500 font-medium">Sayfa {currentPage}/4</div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="h-8 text-sm bg-transparent">
                İptal
              </Button>

              {currentPage === pages.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1 h-8 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Formu Kaydet"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentPageValid()}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1 h-8 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Sonraki
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
