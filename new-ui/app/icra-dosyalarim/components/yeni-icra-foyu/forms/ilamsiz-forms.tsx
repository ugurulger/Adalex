"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { type FormData, BELGE_BILGILERI_OPTIONS, ALACAK_TURU_OPTIONS } from "../types/form-types"
import PratikFaizHesaplamaModal from "../../pratik-faiz-hesaplama-modal"

interface IlamsizFormsProps {
  takipYolu: string
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function IlamsizForms({ takipYolu, formData, updateFormData }: IlamsizFormsProps) {
  const [pratikFaizModalOpen, setPratikFaizModalOpen] = useState(false)
  const [currentFaizType, setCurrentFaizType] = useState<"oncesi" | "sonrasi">("oncesi")

  const updateDynamicField = (field: string, value: any) => {
    updateFormData({
      dynamicFields: {
        ...formData.dynamicFields,
        [field]: value,
      },
    })
  }

  const getDynamicFieldValue = (field: string) => {
    return formData.dynamicFields[field] || ""
  }

  // Set default TL currency when component mounts
  useEffect(() => {
    if (!getDynamicFieldValue("asilAlacakDoviz")) {
      updateDynamicField("asilAlacakDoviz", "TL")
    }
  }, [])

  const handlePratikFaizConfirm = (data: {
    tutar: string
    faizTuru: string
    faizTipi: string
    faizOrani: string
    faizBaslangicTarihi: string
    faizBitisTarihi: string
  }) => {
    if (currentFaizType === "oncesi") {
      // For Takip Öncesi Faiz - use the calculated tutar
      updateDynamicField("takipOncesiFaiz", data.tutar)
      updateDynamicField("takipOncesiFaizTuru", data.faizTuru)
      updateDynamicField("takipOncesiFaizTipi", data.faizTipi)
      updateDynamicField("takipOncesiFaizOrani", data.faizOrani)
      updateDynamicField("takipOncesiFaizBaslangicTarihi", data.faizBaslangicTarihi)
      updateDynamicField("takipOncesiFaizBitisTarihi", data.faizBitisTarihi)
    } else {
      // For Takip Sonrası Faiz - use the faiz oranı instead of tutar
      updateDynamicField("takipSonrasiFaiz", data.faizOrani)
      updateDynamicField("takipSonrasiFaizTipi", data.faizTipi)
      updateDynamicField("takipSonrasiFaizBaslangicTarihi", data.faizBaslangicTarihi)
      updateDynamicField("takipSonrasiFaizBitisTarihi", data.faizBitisTarihi)
      updateDynamicField("takipSonrasiFaizOrani", data.faizOrani)
      // Store the calculated tutar separately for reference
      updateDynamicField("takipSonrasiFaizTutar", data.tutar)
    }
  }

  const openPratikFaiz = (type: "oncesi" | "sonrasi") => {
    setCurrentFaizType(type)
    setPratikFaizModalOpen(true)
  }

  // Currency options
  const dovizCinsleri = ["TL", "USD", "EUR", "GBP", "CHF", "JPY"]

  // 7 Örnek Form
  if (takipYolu === "7_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">7 Örnek - İLAMSIZ TAKIP</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Bilgileri</Label>
            <Input
              value={getDynamicFieldValue("belgeBilgileri")}
              onChange={(e) => updateDynamicField("belgeBilgileri", e.target.value)}
              placeholder="Belge bilgilerini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("belgeTarihi")}
              onChange={(e) => updateDynamicField("belgeTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Açıklama <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={getDynamicFieldValue("aciklama")}
            onChange={(e) => updateDynamicField("aciklama", e.target.value)}
            placeholder="Açıklama giriniz"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tutarı <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("belgeTutari")}
              onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
              placeholder="Belge tutarını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 8 Örnek Form
  if (takipYolu === "8_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">8 Örnek - Menkul rehnin paraya çevrilmesi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tutarı <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("belgeTutari")}
              onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
              placeholder="Belge tutarını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Noter Bilgileri <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("noterBilgileri")}
              onChange={(e) => updateDynamicField("noterBilgileri", e.target.value)}
              placeholder="Noter bilgilerini giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Yevmiye No <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("yevmiyeNo")}
              onChange={(e) => updateDynamicField("yevmiyeNo", e.target.value)}
              placeholder="Yevmiye numarasını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 9 Örnek Form
  if (takipYolu === "9_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">9 Örnek - İpoteğin Paraya çevrilmesi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tutarı <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("belgeTutari")}
              onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
              placeholder="Belge tutarını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Noter Bilgileri <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("noterBilgileri")}
              onChange={(e) => updateDynamicField("noterBilgileri", e.target.value)}
              placeholder="Noter bilgilerini giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Yevmiye No <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("yevmiyeNo")}
              onChange={(e) => updateDynamicField("yevmiyeNo", e.target.value)}
              placeholder="Yevmiye numarasını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 10 Örnek Form
  if (takipYolu === "10_ornek") {
    const belgeBilgileri = getDynamicFieldValue("belgeBilgileri")

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">10 Örnek - Kambiyo Yoluyla Haciz Takibi</h3>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Belge Bilgileri <span className="text-red-500">*</span>
          </Label>
          <Select value={belgeBilgileri} onValueChange={(value) => updateDynamicField("belgeBilgileri", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Belge tipini seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {BELGE_BILGILERI_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {belgeBilgileri === "bono" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tanzim Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("tanzimTarihi")}
                  onChange={(e) => updateDynamicField("tanzimTarihi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Vade Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("vadeTarihi")}
                  onChange={(e) => updateDynamicField("vadeTarihi", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tanzim Yeri <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("tanzimYeri")}
                  onChange={(e) => updateDynamicField("tanzimYeri", e.target.value)}
                  placeholder="Tanzim yerini giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Yetkili Yer <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("yetkiliYer")}
                  onChange={(e) => updateDynamicField("yetkiliYer", e.target.value)}
                  placeholder="Yetkili yeri giriniz"
                />
              </div>
            </div>
          </>
        )}

        {belgeBilgileri === "cek" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Keşide Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("kesideTarihi")}
                  onChange={(e) => updateDynamicField("kesideTarihi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  İbraz Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("ibrazTarihi")}
                  onChange={(e) => updateDynamicField("ibrazTarihi", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Banka Bilgisi <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("bankaBilgisi")}
                  onChange={(e) => updateDynamicField("bankaBilgisi", e.target.value)}
                  placeholder="Banka bilgisini giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Seri No <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("seriNo")}
                  onChange={(e) => updateDynamicField("seriNo", e.target.value)}
                  placeholder="Seri numarasını giriniz"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tanzim Yeri <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("tanzimYeri")}
                  onChange={(e) => updateDynamicField("tanzimYeri", e.target.value)}
                  placeholder="Tanzim yerini giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Yetkili Yer <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("yetkiliYer")}
                  onChange={(e) => updateDynamicField("yetkiliYer", e.target.value)}
                  placeholder="Yetkili yeri giriniz"
                />
              </div>
            </div>
          </>
        )}

        {belgeBilgileri === "police" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Keşide Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("kesideTarihi")}
                  onChange={(e) => updateDynamicField("kesideTarihi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Vade Tarihi <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={getDynamicFieldValue("vadeTarihi")}
                  onChange={(e) => updateDynamicField("vadeTarihi", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Keşide Yeri <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("kesideYeri")}
                  onChange={(e) => updateDynamicField("kesideYeri", e.target.value)}
                  placeholder="Keşide yerini giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Keşideci <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("kesideci")}
                  onChange={(e) => updateDynamicField("kesideci", e.target.value)}
                  placeholder="Keşideciyi giriniz"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Poliçe No</Label>
                <Input
                  value={getDynamicFieldValue("policeNo")}
                  onChange={(e) => updateDynamicField("policeNo", e.target.value)}
                  placeholder="Poliçe numarasını giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Ödeyecek Kişi <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("odeyecekKisi")}
                  onChange={(e) => updateDynamicField("odeyecekKisi", e.target.value)}
                  placeholder="Ödeyecek kişiyi giriniz"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Lehtar <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("lehtar")}
                  onChange={(e) => updateDynamicField("lehtar", e.target.value)}
                  placeholder="Lehtarı giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Yetkili Yer <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={getDynamicFieldValue("yetkiliYer")}
                  onChange={(e) => updateDynamicField("yetkiliYer", e.target.value)}
                  placeholder="Yetkili yeri giriniz"
                />
              </div>
            </div>
          </>
        )}

        {belgeBilgileri && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Belge Tutarı <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={getDynamicFieldValue("belgeTutari")}
                  onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
                  placeholder="Belge tutarını giriniz"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Asıl Alacak <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={getDynamicFieldValue("asilAlacak")}
                    onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                    placeholder="Asıl alacak tutarını giriniz"
                    className="flex-1"
                  />
                  <Select
                    value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                    onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Döviz" />
                    </SelectTrigger>
                    <SelectContent>
                      {dovizCinsleri.map((doviz) => (
                        <SelectItem key={doviz} value={doviz}>
                          {doviz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Takip Öncesi Faiz <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={getDynamicFieldValue("takipOncesiFaiz")}
                    onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                    placeholder="Takip öncesi faiz oranını giriniz"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openPratikFaiz("oncesi")}
                    className="px-3"
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
                {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
                  <div className="text-xs text-gray-500">
                    {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
                  </div>
                )}
                {/* Info Table for Takip Öncesi Faiz */}
                {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Oranı:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Tipi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Takip Sonrası Faiz <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={getDynamicFieldValue("takipSonrasiFaiz")}
                    onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                    placeholder="Takip sonrası faiz oranını giriniz"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openPratikFaiz("sonrasi")}
                    className="px-3"
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
                {getDynamicFieldValue("takipSonrasiFaizTipi") && (
                  <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
                )}
                {/* Info Table for Takip Sonrası Faiz */}
                {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Oranı:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Faiz Tipi:</span>
                        <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 11 Örnek Form
  if (takipYolu === "11_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">11 Örnek - İflas Yoluyla Adi Takip</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Bilgileri</Label>
            <Input
              value={getDynamicFieldValue("belgeBilgileri")}
              onChange={(e) => updateDynamicField("belgeBilgileri", e.target.value)}
              placeholder="Belge bilgilerini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("belgeTarihi")}
              onChange={(e) => updateDynamicField("belgeTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Açıklama <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={getDynamicFieldValue("aciklama")}
            onChange={(e) => updateDynamicField("aciklama", e.target.value)}
            placeholder="Açıklama giriniz"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tutarı <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("belgeTutari")}
              onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
              placeholder="Belge tutarını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 12 Örnek Form
  if (takipYolu === "12_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">12 Örnek - Kambiyo Yoluyla İflas Takibi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Bilgileri</Label>
            <Input
              value={getDynamicFieldValue("belgeBilgileri")}
              onChange={(e) => updateDynamicField("belgeBilgileri", e.target.value)}
              placeholder="Belge bilgilerini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Belge Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("belgeTarihi")}
              onChange={(e) => updateDynamicField("belgeTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Açıklama <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={getDynamicFieldValue("aciklama")}
            onChange={(e) => updateDynamicField("aciklama", e.target.value)}
            placeholder="Açıklama giriniz"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tutarı <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("belgeTutari")}
              onChange={(e) => updateDynamicField("belgeTutari", e.target.value)}
              placeholder="Belge tutarını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 13 Örnek Form
  if (takipYolu === "13_ornek") {
    const alacakTuru = getDynamicFieldValue("alacakTuru")

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">13 Örnek - Adi Kira ve Hasilat Kiralarına Ait Takip</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Yıllık Kira Bedeli <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("yillikKiraBedeli")}
              onChange={(e) => updateDynamicField("yillikKiraBedeli", e.target.value)}
              placeholder="Yıllık kira bedelini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme İmza Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeImzaTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeImzaTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Başlangıç Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeBaslangicTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeBaslangicTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Bitiş Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeBitisTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeBitisTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Kiraya Verilen Yerin Adresi <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={getDynamicFieldValue("kirayaVerilenYerinAdresi")}
            onChange={(e) => updateDynamicField("kirayaVerilenYerinAdresi", e.target.value)}
            placeholder="Kiraya verilen yerin adresini giriniz"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              İl <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("il")}
              onChange={(e) => updateDynamicField("il", e.target.value)}
              placeholder="İl giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              İlçe <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("ilce")}
              onChange={(e) => updateDynamicField("ilce", e.target.value)}
              placeholder="İlçe giriniz"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Alacak Türü <span className="text-red-500">*</span>
          </Label>
          <Select value={alacakTuru} onValueChange={(value) => updateDynamicField("alacakTuru", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Alacak türünü seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {ALACAK_TURU_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {alacakTuru === "diger" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Alacak Türü Diğer <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("alacakTuruDiger")}
              onChange={(e) => updateDynamicField("alacakTuruDiger", e.target.value)}
              placeholder="Diğer alacak türünü belirtiniz"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Asıl Alacak <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={getDynamicFieldValue("asilAlacak")}
                onChange={(e) => updateDynamicField("asilAlacak", e.target.value)}
                placeholder="Asıl alacak tutarını giriniz"
                className="flex-1"
              />
              <Select
                value={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
                onValueChange={(value) => updateDynamicField("asilAlacakDoviz", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Döviz" />
                </SelectTrigger>
                <SelectContent>
                  {dovizCinsleri.map((doviz) => (
                    <SelectItem key={doviz} value={doviz}>
                      {doviz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Öncesi Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipOncesiFaiz")}
                onChange={(e) => updateDynamicField("takipOncesiFaiz", e.target.value)}
                placeholder="Takip öncesi faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("oncesi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipOncesiFaizOrani") && getDynamicFieldValue("takipOncesiFaizTipi") && (
              <div className="text-xs text-gray-500">
                {getDynamicFieldValue("takipOncesiFaizOrani")} / {getDynamicFieldValue("takipOncesiFaizTipi")}
              </div>
            )}
            {/* Info Table for Takip Öncesi Faiz */}
            {getDynamicFieldValue("takipOncesiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipOncesiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Takip Sonrası Faiz <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={getDynamicFieldValue("takipSonrasiFaiz")}
                onChange={(e) => updateDynamicField("takipSonrasiFaiz", e.target.value)}
                placeholder="Takip sonrası faiz oranını giriniz"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPratikFaiz("sonrasi")}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
            {getDynamicFieldValue("takipSonrasiFaizTipi") && (
              <div className="text-xs text-gray-500">{getDynamicFieldValue("takipSonrasiFaizTipi")}</div>
            )}
            {/* Info Table for Takip Sonrası Faiz */}
            {getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi") && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800 mb-2">Faiz Bilgileri:</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Başlangıç Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBaslangicTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Bitiş Tarihi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizBitisTarihi")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Oranı:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizOrani")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Faiz Tipi:</span>
                    <span className="text-gray-600">{getDynamicFieldValue("takipSonrasiFaizTipi")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  // 14 Örnek Form
  if (takipYolu === "14_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">14 Örnek - Tahliye Emri</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Yıllık Kira Bedeli <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={getDynamicFieldValue("yillikKiraBedeli")}
              onChange={(e) => updateDynamicField("yillikKiraBedeli", e.target.value)}
              placeholder="Yıllık kira bedelini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme İmza Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeImzaTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeImzaTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Başlangıç Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeBaslangicTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeBaslangicTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Sözleşme Bitiş Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("sozlesmeBitisTarihi")}
              onChange={(e) => updateDynamicField("sozlesmeBitisTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Kiraya Verilen Yerin Adresi <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={getDynamicFieldValue("kirayaVerilenYerinAdresi")}
            onChange={(e) => updateDynamicField("kirayaVerilenYerinAdresi", e.target.value)}
            placeholder="Kiraya verilen yerin adresini giriniz"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              İl <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("il")}
              onChange={(e) => updateDynamicField("il", e.target.value)}
              placeholder="İl giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              İlçe <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("ilce")}
              onChange={(e) => updateDynamicField("ilce", e.target.value)}
              placeholder="İlçe giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Taahhüt Düzenlenme Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("taahhutDuzenlenmeTarihi")}
              onChange={(e) => updateDynamicField("taahhutDuzenlenmeTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Taahhüt Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("taahhutTarihi")}
              onChange={(e) => updateDynamicField("taahhutTarihi", e.target.value)}
            />
          </div>
        </div>

        <PratikFaizHesaplamaModal
          isOpen={pratikFaizModalOpen}
          onClose={() => setPratikFaizModalOpen(false)}
          onConfirm={handlePratikFaizConfirm}
          initialAsilAlacak={getDynamicFieldValue("asilAlacak")}
          initialDovizCinsi={getDynamicFieldValue("asilAlacakDoviz") || "TL"}
        />
      </div>
    )
  }

  return <div className="text-center text-gray-500">Seçilen takip yolu için form bulunamadı.</div>
}
