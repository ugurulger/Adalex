"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react"

interface DosyaOzetiTabProps {
  selectedCase: any
}

interface TahsilatEntry {
  id: string
  tarih: string
  tutar: string
  kaynak: string
}

interface MasrafEntry {
  id: string
  tur: string
  tarih: string
  aciklama: string
  tutar: string
  personel: string
}

interface MuvekkilEntry {
  id: string
  tip: "avans" | "odeme"
  tarih: string
  tutar: string
}

export default function DosyaOzetiTab({ selectedCase }: DosyaOzetiTabProps) {
  // Tahsilat state
  const [tahsilatEntries, setTahsilatEntries] = useState<TahsilatEntry[]>([])
  const [tahsilatForm, setTahsilatForm] = useState({
    tarih: "",
    tutar: "",
    kaynak: "",
  })

  // Masraf state
  const [masrafEntries, setMasrafEntries] = useState<MasrafEntry[]>([])
  const [masrafForm, setMasrafForm] = useState({
    tur: "",
    tarih: "",
    aciklama: "",
    tutar: "",
    personel: "",
  })

  // Müvekkil state
  const [muvekkilEntries, setMuvekkilEntries] = useState<MuvekkilEntry[]>([])
  const [muvekkilForm, setMuvekkilForm] = useState({
    tip: "avans" as "avans" | "odeme",
    tarih: "",
    tutar: "",
  })

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    islemisFaiz: false,
    tumHarclar: false,
    masraflar: false,
  })

  // Alacak Özeti default values
  const [alacakOzeti] = useState({
    asilAlacak: "150,000.00",
    islemisFaiz: "25,000.00",
    takipOncesiFaiz: "15,000.00",
    takipSonrasiFaiz: "10,000.00",
    takipCikisi: "5,000.00",
    tumHarclar: "8,500.00",
    basvuruHarci: "2,000.00",
    velaketHarci: "1,500.00",
    pesinHarc: "2,000.00",
    tahsilHarci: "3,000.00",
    masraflar: "12,000.00",
    postaGideri: "500.00",
    pulUcreti: "300.00",
    vesairMasraflar: "11,200.00",
    sonrakiFaiz: "5,000.00",
    vekaletUcreti: "20,000.00",
    toplamBorc: "235,500.00",
    toplamTahsilat: "180,000.00",
    kalanBakiye: "55,500.00",
  })

  // Toggle expandable sections
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Add functions
  const addTahsilat = () => {
    if (tahsilatForm.tarih && tahsilatForm.tutar && tahsilatForm.kaynak) {
      const newEntry: TahsilatEntry = {
        id: Date.now().toString(),
        ...tahsilatForm,
      }
      setTahsilatEntries([...tahsilatEntries, newEntry])
      setTahsilatForm({ tarih: "", tutar: "", kaynak: "" })
    }
  }

  const addMasraf = () => {
    if (masrafForm.tur && masrafForm.tarih && masrafForm.tutar && masrafForm.personel) {
      const newEntry: MasrafEntry = {
        id: Date.now().toString(),
        ...masrafForm,
      }
      setMasrafEntries([...masrafEntries, newEntry])
      setMasrafForm({ tur: "", tarih: "", aciklama: "", tutar: "", personel: "" })
    }
  }

  const addMuvekkil = () => {
    if (muvekkilForm.tarih && muvekkilForm.tutar) {
      const newEntry: MuvekkilEntry = {
        id: Date.now().toString(),
        ...muvekkilForm,
      }
      setMuvekkilEntries([...muvekkilEntries, newEntry])
      setMuvekkilForm({ ...muvekkilForm, tarih: "", tutar: "" })
    }
  }

  // Delete functions
  const deleteTahsilat = (id: string) => {
    setTahsilatEntries(tahsilatEntries.filter((entry) => entry.id !== id))
  }

  const deleteMasraf = (id: string) => {
    setMasrafEntries(masrafEntries.filter((entry) => entry.id !== id))
  }

  const deleteMuvekkil = (id: string) => {
    setMuvekkilEntries(muvekkilEntries.filter((entry) => entry.id !== id))
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-2">
        {/* Sol Taraf - Alacak Özeti Tablosu */}
        <div className="space-y-1">
          <Card>
            <CardHeader className="py-1 px-2">
              <CardTitle className="text-[10px] font-medium">📊 Alacak Özeti Tablosu</CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-2 space-y-1">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Asıl Alacak:</span>
                  <span className="text-blue-600 font-semibold">₺{alacakOzeti.asilAlacak}</span>
                </div>

                {/* İşlemiş Faiz - Expandable */}
                <div>
                  <div className="flex justify-between items-center relative">
                    <button
                      onClick={() => toggleSection("islemisFaiz")}
                      className="absolute -left-4 p-0.5 hover:bg-gray-100 rounded"
                    >
                      {expandedSections.islemisFaiz ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                    <span className="font-medium">İşlemiş Faiz:</span>
                    <span className="text-blue-600 font-semibold">₺{alacakOzeti.islemisFaiz}</span>
                  </div>
                  {expandedSections.islemisFaiz && (
                    <div className="ml-6 space-y-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Takip Öncesi Faiz:</span>
                        <span className="text-gray-600">₺{alacakOzeti.takipOncesiFaiz}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Takip Sonrası Faiz:</span>
                        <span className="text-gray-600">₺{alacakOzeti.takipSonrasiFaiz}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Takip Çıkışı:</span>
                  <span className="text-blue-600 font-semibold">₺{alacakOzeti.takipCikisi}</span>
                </div>

                {/* Tüm Harçlar - Expandable */}
                <div>
                  <div className="flex justify-between items-center relative">
                    <button
                      onClick={() => toggleSection("tumHarclar")}
                      className="absolute -left-4 p-0.5 hover:bg-gray-100 rounded"
                    >
                      {expandedSections.tumHarclar ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                    <span className="font-medium">Tüm Harçlar:</span>
                    <span className="text-blue-600 font-semibold">₺{alacakOzeti.tumHarclar}</span>
                  </div>
                  {expandedSections.tumHarclar && (
                    <div className="ml-6 space-y-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Başvuru Harcı:</span>
                        <span className="text-gray-600">₺{alacakOzeti.basvuruHarci}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Velaket Harcı:</span>
                        <span className="text-gray-600">₺{alacakOzeti.velaketHarci}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Peşin Harç:</span>
                        <span className="text-gray-600">₺{alacakOzeti.pesinHarc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Tahsil Harcı:</span>
                        <span className="text-gray-600">₺{alacakOzeti.tahsilHarci}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Masraflar - Expandable */}
                <div>
                  <div className="flex justify-between items-center relative">
                    <button
                      onClick={() => toggleSection("masraflar")}
                      className="absolute -left-4 p-0.5 hover:bg-gray-100 rounded"
                    >
                      {expandedSections.masraflar ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                    <span className="font-medium">Masraflar:</span>
                    <span className="text-blue-600 font-semibold">₺{alacakOzeti.masraflar}</span>
                  </div>
                  {expandedSections.masraflar && (
                    <div className="ml-6 space-y-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Posta Gideri:</span>
                        <span className="text-gray-600">₺{alacakOzeti.postaGideri}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Pul Ücreti:</span>
                        <span className="text-gray-600">₺{alacakOzeti.pulUcreti}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Vesair Masraflar:</span>
                        <span className="text-gray-600">₺{alacakOzeti.vesairMasraflar}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Sonraki Faiz:</span>
                  <span className="text-blue-600 font-semibold">₺{alacakOzeti.sonrakiFaiz}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Vekalet Ücreti:</span>
                  <span className="text-blue-600 font-semibold">₺{alacakOzeti.vekaletUcreti}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Toplam Borç:</span>
                  <span className="text-red-600 font-bold text-lg">₺{alacakOzeti.toplamBorc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Toplam Tahsilat:</span>
                  <span className="text-green-600 font-bold text-lg">₺{alacakOzeti.toplamTahsilat}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Kalan Bakiye:</span>
                  <span className="text-orange-600 font-bold text-lg">₺{alacakOzeti.kalanBakiye}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Taraf - Tahsilat, Masraf, Müvekkil */}
        <div className="space-y-1">
          {/* Row 1: Tahsilat Girişi + Tahsilat Table */}
          <div className="grid grid-cols-[40%_60%] gap-2">
            {/* Tahsilat Girişi */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">💰 Tahsilat Girişi</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2 space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="tahsilat-tarih" className="text-[10px]">
                        Tahsilat Tarihi
                      </Label>
                      <Input
                        id="tahsilat-tarih"
                        type="date"
                        value={tahsilatForm.tarih}
                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, tarih: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tahsilat-tutar" className="text-[10px]">
                        Tahsilat Tutarı
                      </Label>
                      <Input
                        id="tahsilat-tutar"
                        type="number"
                        placeholder="0.00"
                        value={tahsilatForm.tutar}
                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, tutar: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="tahsilat-kaynak" className="text-[10px]">
                        Paranın Geldiği Yer
                      </Label>
                      <Input
                        id="tahsilat-kaynak"
                        placeholder="Ödeme kaynağı"
                        value={tahsilatForm.kaynak}
                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, kaynak: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <Button onClick={addTahsilat} className="w-full text-xs h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Tahsilat Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tahsilat Table */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">Tahsilat Listesi</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2">
                <div className="h-[100px] overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="py-0.5 px-1">Tarih</TableHead>
                        <TableHead className="py-0.5 px-1">Tutar</TableHead>
                        <TableHead className="py-0.5 px-1">Kaynak</TableHead>
                        <TableHead className="w-8 py-0.5 px-1"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tahsilatEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400 py-2 text-xs">
                            Henüz tahsilat kaydı bulunmuyor
                          </TableCell>
                        </TableRow>
                      ) : (
                        tahsilatEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="py-0.5 px-1">{entry.tarih}</TableCell>
                            <TableCell className="py-0.5 px-1">₺{entry.tutar}</TableCell>
                            <TableCell className="py-0.5 px-1">{entry.kaynak}</TableCell>
                            <TableCell className="py-0.5 px-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTahsilat(entry.id)}
                                className="text-xs h-4 w-4 p-0"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Masraf Girişi + Masraf Table */}
          <div className="grid grid-cols-[40%_60%] gap-2">
            {/* Masraf Girişi */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">📋 Masraf Girişi</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2 space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="masraf-tur" className="text-[10px]">
                        Türü
                      </Label>
                      <Select
                        value={masrafForm.tur}
                        onValueChange={(value) => setMasrafForm({ ...masrafForm, tur: value })}
                      >
                        <SelectTrigger className="text-xs h-6">
                          <SelectValue placeholder="Masraf türünü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="haciz-gideri">Haciz Gideri</SelectItem>
                          <SelectItem value="posta-gideri">Posta Gideri</SelectItem>
                          <SelectItem value="satis-gideri">Satış Gideri</SelectItem>
                          <SelectItem value="cesitli-gider">Çeşitli Gider</SelectItem>
                          <SelectItem value="dava-gideri">Dava Gideri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="masraf-tarih" className="text-[10px]">
                        Tarih
                      </Label>
                      <Input
                        id="masraf-tarih"
                        type="date"
                        value={masrafForm.tarih}
                        onChange={(e) => setMasrafForm({ ...masrafForm, tarih: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="masraf-aciklama" className="text-[10px]">
                        Açıklama
                      </Label>
                      <Textarea
                        id="masraf-aciklama"
                        placeholder="Masraf açıklaması"
                        value={masrafForm.aciklama}
                        onChange={(e) => setMasrafForm({ ...masrafForm, aciklama: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="masraf-tutar" className="text-[10px]">
                        Tutar
                      </Label>
                      <Input
                        id="masraf-tutar"
                        type="number"
                        placeholder="0.00"
                        value={masrafForm.tutar}
                        onChange={(e) => setMasrafForm({ ...masrafForm, tutar: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <div>
                      <Label htmlFor="masraf-personel" className="text-[10px]">
                        Personel İsmi
                      </Label>
                      <Input
                        id="masraf-personel"
                        placeholder="Personel adı"
                        value={masrafForm.personel}
                        onChange={(e) => setMasrafForm({ ...masrafForm, personel: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <Button onClick={addMasraf} className="w-full text-xs h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Masraf Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Masraf Table */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">Masraf Listesi</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2">
                <div className="h-[140px] overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="py-0.5 px-1">Tür</TableHead>
                        <TableHead className="py-0.5 px-1">Tarih</TableHead>
                        <TableHead className="py-0.5 px-1">Tutar</TableHead>
                        <TableHead className="py-0.5 px-1">Personel</TableHead>
                        <TableHead className="w-8 py-0.5 px-1"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masrafEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-2 text-xs">
                            Henüz masraf kaydı bulunmuyor
                          </TableCell>
                        </TableRow>
                      ) : (
                        masrafEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="py-0.5 px-1">{entry.tur}</TableCell>
                            <TableCell className="py-0.5 px-1">{entry.tarih}</TableCell>
                            <TableCell className="py-0.5 px-1">₺{entry.tutar}</TableCell>
                            <TableCell className="py-0.5 px-1">{entry.personel}</TableCell>
                            <TableCell className="py-0.5 px-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMasraf(entry.id)}
                                className="text-xs h-4 w-4 p-0"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Müvekkile Hesabı + Müvekkil Table */}
          <div className="grid grid-cols-[40%_60%] gap-2">
            {/* Müvekkile Hesabı */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">👤 Müvekkile Hesabı</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2 space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="muvekkil-tip" className="text-[10px]">
                        İşlem Tipi
                      </Label>
                      <Select
                        value={muvekkilForm.tip}
                        onValueChange={(value: "avans" | "odeme") => setMuvekkilForm({ ...muvekkilForm, tip: value })}
                      >
                        <SelectTrigger className="text-xs h-6">
                          <SelectValue placeholder="İşlem tipini seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avans">Alınan Avans</SelectItem>
                          <SelectItem value="odeme">Müvekkile Ödeme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="muvekkil-tarih" className="text-[10px]">
                        Tarih
                      </Label>
                      <Input
                        id="muvekkil-tarih"
                        type="date"
                        value={muvekkilForm.tarih}
                        onChange={(e) => setMuvekkilForm({ ...muvekkilForm, tarih: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="muvekkil-tutar" className="text-[10px]">
                        Tutar
                      </Label>
                      <Input
                        id="muvekkil-tutar"
                        type="number"
                        placeholder="0.00"
                        value={muvekkilForm.tutar}
                        onChange={(e) => setMuvekkilForm({ ...muvekkilForm, tutar: e.target.value })}
                        className="text-xs h-6"
                      />
                    </div>
                    <Button onClick={addMuvekkil} className="w-full text-xs h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      İşlem Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Müvekkil Table */}
            <Card>
              <CardHeader className="py-1 px-2">
                <CardTitle className="text-[10px] font-medium">Müvekkil İşlem Listesi</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-2">
                <div className="h-[80px] overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="py-0.5 px-1">Tip</TableHead>
                        <TableHead className="py-0.5 px-1">Tarih</TableHead>
                        <TableHead className="py-0.5 px-1">Tutar</TableHead>
                        <TableHead className="w-8 py-0.5 px-1"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {muvekkilEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-400 py-2 text-xs">
                            Henüz müvekkil işlemi bulunmuyor
                          </TableCell>
                        </TableRow>
                      ) : (
                        muvekkilEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="py-0.5 px-1">
                              <span className={entry.tip === "avans" ? "text-green-600" : "text-blue-600"}>
                                {entry.tip === "avans" ? "Alınan Avans" : "Müvekkile Ödeme"}
                              </span>
                            </TableCell>
                            <TableCell className="py-0.5 px-1">{entry.tarih}</TableCell>
                            <TableCell className="py-0.5 px-1">₺{entry.tutar}</TableCell>
                            <TableCell className="py-0.5 px-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMuvekkil(entry.id)}
                                className="text-xs h-4 w-4 p-0"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
