"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { FormData } from "../types/form-types"
import IlamsizForms from "../forms/ilamsiz-forms"
import IlamliForms from "../forms/ilamli-forms"

interface TurlereGoreSecimPageProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export default function TurlereGoreSecimPage({ formData, updateFormData }: TurlereGoreSecimPageProps) {
  if (!formData.takipTuru || !formData.takipYolu) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-none">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Lütfen önce takip türü ve yolunu seçiniz.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          {formData.takipTuru === "ILAMSIZ" && (
            <IlamsizForms takipYolu={formData.takipYolu} formData={formData} updateFormData={updateFormData} />
          )}
          {formData.takipTuru === "ILAMLI" && (
            <IlamliForms takipYolu={formData.takipYolu} formData={formData} updateFormData={updateFormData} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
