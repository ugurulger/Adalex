"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormData } from "../types/form-types"
import PratikFaizHesaplamaModal from "../../pratik-faiz-hesaplama-modal"

interface IlamliFormsProps {
  takipYolu: string
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function IlamliForms({ takipYolu, formData, updateFormData }: IlamliFormsProps) {
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

  // 2-5 Örnek Form
  if (takipYolu === "2_5_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">2-5 Örnek - Menkul Teslimi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mahkeme Adı</Label>
            <Input
              value={getDynamicFieldValue("mahkemeAdi")}
              onChange={(e) => updateDynamicField("mahkemeAdi", e.target.value)}
              placeholder="Mahkeme adını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dava Açılış Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("davaAcilisTarihi")}
              onChange={(e) => updateDynamicField("davaAcilisTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Karar Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("kararTarihi")}
              onChange={(e) => updateDynamicField("kararTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kesinleşme Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("kesinlesmeTarihi")}
              onChange={(e) => updateDynamicField("kesinlesmeTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Esas Yıl No</Label>
            <Input
              value={getDynamicFieldValue("esasYilNo")}
              onChange={(e) => updateDynamicField("esasYilNo", e.target.value)}
              placeholder="Esas yıl numarasını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Karar Yıl No</Label>
            <Input
              value={getDynamicFieldValue("kararYilNo")}
              onChange={(e) => updateDynamicField("kararYilNo", e.target.value)}
              placeholder="Karar yıl numarasını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alacak Türü</Label>
            <Input
              value={getDynamicFieldValue("alacakTuru")}
              onChange={(e) => updateDynamicField("alacakTuru", e.target.value)}
              placeholder="Alacak türünü giriniz"
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

  // 4-5 Örnek Form
  if (takipYolu === "4_5_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">4-5 Örnek - Genel Alacak Teminat</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mahkeme Adı</Label>
            <Input
              value={getDynamicFieldValue("mahkemeAdi")}
              onChange={(e) => updateDynamicField("mahkemeAdi", e.target.value)}
              placeholder="Mahkeme adını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dava Açılış Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("davaAcilisTarihi")}
              onChange={(e) => updateDynamicField("davaAcilisTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Karar Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("kararTarihi")}
              onChange={(e) => updateDynamicField("kararTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kesinleşme Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("kesinlesmeTarihi")}
              onChange={(e) => updateDynamicField("kesinlesmeTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Esas Yıl No</Label>
            <Input
              value={getDynamicFieldValue("esasYilNo")}
              onChange={(e) => updateDynamicField("esasYilNo", e.target.value)}
              placeholder="Esas yıl numarasını giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Karar Yıl No</Label>
            <Input
              value={getDynamicFieldValue("kararYilNo")}
              onChange={(e) => updateDynamicField("kararYilNo", e.target.value)}
              placeholder="Karar yıl numarasını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alacak Türü</Label>
            <Input
              value={getDynamicFieldValue("alacakTuru")}
              onChange={(e) => updateDynamicField("alacakTuru", e.target.value)}
              placeholder="Alacak türünü giriniz"
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

  // 6 Örnek Form
  if (takipYolu === "6_ornek") {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">6 Örnek - İpoteğin Paraya Çevrilmesi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Kurum Bilgileri <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("kurumBilgileri")}
              onChange={(e) => updateDynamicField("kurumBilgileri", e.target.value)}
              placeholder="Kurum bilgilerini giriniz"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Yevmiye Yıl No <span className="text-red-500">*</span>
            </Label>
            <Input
              value={getDynamicFieldValue("yevmiyeYilNo")}
              onChange={(e) => updateDynamicField("yevmiyeYilNo", e.target.value)}
              placeholder="Yevmiye yıl numarasını giriniz"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Belge Tarihi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={getDynamicFieldValue("belgeTarihi")}
              onChange={(e) => updateDynamicField("belgeTarihi", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">İpotek Tarihi</Label>
            <Input
              type="date"
              value={getDynamicFieldValue("ipotekTarihi")}
              onChange={(e) => updateDynamicField("ipotekTarihi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Yevmiye No</Label>
            <Input
              value={getDynamicFieldValue("yevmiyeNo")}
              onChange={(e) => updateDynamicField("yevmiyeNo", e.target.value)}
              placeholder="Yevmiye numarasını giriniz"
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

  return <div className="text-center text-gray-500">Seçilen takip yolu için form bulunamadı.</div>
}
