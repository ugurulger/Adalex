"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type FormData, TAKIP_YOLU_OPTIONS } from "../types/form-types"

interface TurleriSecmePageProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function TurleriSecmePage({ formData, updateFormData }: TurleriSecmePageProps) {
  const handleTakipTuruChange = (value: string) => {
    updateFormData({
      takipTuru: value,
      takipYolu: "", // Reset takip yolu when takip turu changes
    })
  }

  const handleTakipYoluChange = (value: string) => {
    updateFormData({ takipYolu: value })
  }

  const availableTakipYolu = formData.takipTuru
    ? TAKIP_YOLU_OPTIONS[formData.takipTuru as keyof typeof TAKIP_YOLU_OPTIONS] || []
    : []

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="takip-turu" className="text-sm font-medium">
                Takip Türü <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.takipTuru} onValueChange={handleTakipTuruChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Takip türünü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILAMLI">İLAMLI</SelectItem>
                  <SelectItem value="ILAMSIZ">İLAMSIZ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="takip-yolu" className="text-sm font-medium">
                Takip Yolu <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.takipYolu} onValueChange={handleTakipYoluChange} disabled={!formData.takipTuru}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Takip yolunu seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {availableTakipYolu.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
