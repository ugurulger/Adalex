"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { AlacakKalemi } from "../types/form-types"

interface AlacakKalemleriTabProps {
  data: AlacakKalemi[]
  onChange: (data: AlacakKalemi[]) => void
  errors?: Array<Partial<AlacakKalemi>>
}

export default function AlacakKalemleriTab({ data, onChange, errors }: AlacakKalemleriTabProps) {
  const addKalem = () => {
    const newKalem: AlacakKalemi = {
      id: Math.max(...data.map((k) => k.id), 0) + 1,
      kalemAdi: "",
      tutar: "",
      faizTipi: "",
      faizBaslangicTarihi: undefined,
      faizOrani: "",
      aciklama: "",
    }
    onChange([...data, newKalem])
  }

  const removeKalem = (id: number) => {
    if (data.length > 1) {
      onChange(data.filter((kalem) => kalem.id !== id))
    }
  }

  const updateKalem = (id: number, field: keyof AlacakKalemi, value: any) => {
    onChange(
      data.map((kalem) =>
        kalem.id === id
          ? {
              ...kalem,
              [field]: value,
            }
          : kalem,
      ),
    )
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except comma and dot
    const numericValue = value.replace(/[^0-9.,]/g, "")
    return numericValue
  }

  const formatPercentage = (value: string) => {
    // Remove non-numeric characters except comma and dot
    const numericValue = value.replace(/[^0-9.,]/g, "")
    return numericValue
  }

  const faizTipleri = [
    { value: "yok", label: "Faiz Yok" },
    { value: "kanuni", label: "Kanuni Faiz" },
    { value: "gecikme", label: "Gecikme Faizi" },
    { value: "sozlesmeli", label: "Sözleşmeli Faiz" },
    { value: "temerrut", label: "Temerrüt Faizi" },
  ]

  const calculateTotal = () => {
    return data.reduce((total, kalem) => {
      const tutar = Number.parseFloat(kalem.tutar.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0
      return total + tutar
    }, 0)
  }

  return (
    <div className="space-y-6">
      {data.map((kalem, index) => {
        const kalemErrors = errors?.[index] || {}
        return (
          <Card key={kalem.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">💰 Alacak Kalemi #{index + 1}</div>
                {data.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeKalem(kalem.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kalem Adı */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Kalem Adı *</Label>
                  <Input
                    value={kalem.kalemAdi}
                    onChange={(e) => updateKalem(kalem.id, "kalemAdi", e.target.value)}
                    placeholder="Örn: Ana Para, Kira Bedeli, Hizmet Bedeli"
                    className={kalemErrors.kalemAdi ? "border-red-500" : ""}
                  />
                  {kalemErrors.kalemAdi && <p className="text-sm text-red-600">{kalemErrors.kalemAdi}</p>}
                </div>

                {/* Tutar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tutar (TL) *</Label>
                  <Input
                    value={kalem.tutar}
                    onChange={(e) => updateKalem(kalem.id, "tutar", formatCurrency(e.target.value))}
                    placeholder="0,00"
                    className={kalemErrors.tutar ? "border-red-500" : ""}
                  />
                  {kalemErrors.tutar && <p className="text-sm text-red-600">{kalemErrors.tutar}</p>}
                </div>

                {/* Faiz Tipi */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Faiz Tipi</Label>
                  <Select value={kalem.faizTipi} onValueChange={(value) => updateKalem(kalem.id, "faizTipi", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Faiz tipi seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {faizTipleri.map((tip) => (
                        <SelectItem key={tip.value} value={tip.value}>
                          {tip.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Faiz Oranı */}
                {kalem.faizTipi && kalem.faizTipi !== "yok" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Faiz Oranı (%)</Label>
                    <Input
                      value={kalem.faizOrani}
                      onChange={(e) => updateKalem(kalem.id, "faizOrani", formatPercentage(e.target.value))}
                      placeholder="24,00"
                    />
                    <p className="text-xs text-gray-500">Yıllık faiz oranını giriniz</p>
                  </div>
                )}
              </div>

              {/* Faiz Başlangıç Tarihi */}
              {kalem.faizTipi && kalem.faizTipi !== "yok" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Faiz Başlangıç Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {kalem.faizBaslangicTarihi
                          ? format(kalem.faizBaslangicTarihi, "dd.MM.yyyy", { locale: tr })
                          : "Tarih seçiniz"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={kalem.faizBaslangicTarihi}
                        onSelect={(date) => updateKalem(kalem.id, "faizBaslangicTarihi", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Açıklama */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Açıklama</Label>
                <Textarea
                  value={kalem.aciklama}
                  onChange={(e) => updateKalem(kalem.id, "aciklama", e.target.value)}
                  placeholder="Alacak kalemi ile ilgili açıklama..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Kalem Ekle Butonu */}
      <div className="flex justify-center">
        <Button onClick={addKalem} variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Kalem Ekle
        </Button>
      </div>

      {/* Toplam Özet */}
      {data.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">📊 Alacak Toplamı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(calculateTotal())}
            </div>
            <p className="text-sm text-green-600 mt-1">{data.length} kalem • Faiz hesaplaması ayrıca yapılacaktır</p>
          </CardContent>
        </Card>
      )}

      {/* Bilgi Notu */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Alacak Kalemleri Hakkında</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Her alacak kalemi için ayrı ayrı faiz hesaplaması yapılabilir</li>
          <li>• Kanuni faiz oranı güncel TCMB oranlarına göre hesaplanır</li>
          <li>• Sözleşmeli faiz oranı sözleşmede belirtilen oran olmalıdır</li>
          <li>• Faiz başlangıç tarihi alacağın doğduğu tarih olmalıdır</li>
        </ul>
      </div>
    </div>
  )
}
