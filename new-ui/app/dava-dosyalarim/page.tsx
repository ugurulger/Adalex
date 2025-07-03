"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Sample legal case data
const sampleCases = [
  {
    id: 1,
    klasor: "2024/D-001",
    no: "001",
    davaciAdi: "Ugur Yılmaz",
    davaliAdi: "Mehmet Demir",
    foyTuru: "Alacak Davası",
    mahkeme: "İstanbul 1. Asliye Hukuk Mahkemesi",
    eYil: "2024",
    eNo: "2024/1234",
    durum: "Açık",
    davaTarihi: "15.01.2024",
    // Additional details for modal
    davaciTC: "12345678901",
    davaliTC: "98765432109",
    davaKonusu: "Alacak Davası",
    davaciVekili: "Av. Fatma Demir",
    davaliVekili: "Av. Ali Kaya",
    davaTuru: "Hukuk Davası",
    davaciAdres: "İstanbul, Kadıköy, Moda Mahallesi",
    davaliAdres: "İstanbul, Beşiktaş, Etiler Mahallesi",
    davaMiktari: "150.000,00 TL",
    sonIslem: "Duruşma Yapıldı",
    durusmaTarihi: "15.03.2024",
    aciklama: "Alacak davası devam etmektedir. Sonraki duruşma 15.03.2024 tarihinde yapılacaktır.",
  },
  {
    id: 2,
    klasor: "2024/D-002",
    no: "002",
    davaciAdi: "Fatma Kaya",
    davaliAdi: "Ali Özkan",
    foyTuru: "Ticari Alacak",
    mahkeme: "Ankara 3. Asliye Ticaret Mahkemesi",
    eYil: "2024",
    eNo: "2024/5678",
    durum: "Karar Verildi",
    davaTarihi: "10.12.2023",
    davaciTC: "11122233344",
    davaliTC: "55566677788",
    davaKonusu: "Ticari Alacak",
    davaciVekili: "Av. Zeynep Çelik",
    davaliVekili: "Av. Hasan Polat",
    davaTuru: "Ticaret Davası",
    davaciAdres: "Ankara, Çankaya, Kızılay Mahallesi",
    davaliAdres: "Ankara, Keçiören, Bağlum Mahallesi",
    davaMiktari: "75.000,00 TL",
    sonIslem: "Karar Verildi",
    durusmaTarihi: "22.02.2024",
    aciklama: "Davacı lehine karar verilmiştir. İcra takibi başlatılabilir.",
  },
  {
    id: 3,
    klasor: "2024/D-003",
    no: "003",
    davaciAdi: "Zeynep Çelik",
    davaliAdi: "Mustafa Şen",
    foyTuru: "Tazminat Davası",
    mahkeme: "İzmir 2. Asliye Hukuk Mahkemesi",
    eYil: "2023",
    eNo: "2023/9876",
    durum: "Temyizde",
    davaTarihi: "20.11.2023",
    davaciTC: "22233344455",
    davaliTC: "66677788899",
    davaKonusu: "Tazminat Davası",
    davaciVekili: "Av. Murat Aydın",
    davaliVekili: "Av. Elif Arslan",
    davaTuru: "Hukuk Davası",
    davaciAdres: "İzmir, Konak, Alsancak Mahallesi",
    davaliAdres: "İzmir, Bornova, Erzene Mahallesi",
    davaMiktari: "200.000,00 TL",
    sonIslem: "Temyiz Başvurusu",
    durusmaTarihi: "05.04.2024",
    aciklama: "Mahkeme kararına karşı temyiz başvurusu yapılmıştır. Yargıtay incelemesi devam etmektedir.",
  },
  {
    id: 4,
    klasor: "2024/D-004",
    no: "004",
    davaciAdi: "Hasan Polat",
    davaliAdi: "Ayşe Yıldız",
    foyTuru: "Sözleşme İhlali",
    mahkeme: "Bursa 1. Asliye Ticaret Mahkemesi",
    eYil: "2024",
    eNo: "2024/3456",
    durum: "Açık",
    davaTarihi: "05.02.2024",
    davaciTC: "33344455566",
    davaliTC: "77788899900",
    davaKonusu: "Sözleşme İhlali",
    davaciVekili: "Av. Osman Kurt",
    davaliVekili: "Vekil Yok",
    davaTuru: "Ticaret Davası",
    davaciAdres: "Bursa, Osmangazi, Heykel Mahallesi",
    davaliAdres: "Bursa, Nilüfer, Görükle Mahallesi",
    davaMiktari: "120.000,00 TL",
    sonIslem: "Delil Toplama",
    durusmaTarihi: "28.03.2024",
    aciklama: "Delil toplama aşamasında. Bilirkişi raporu beklenmektedir.",
  },
  {
    id: 5,
    klasor: "2024/D-005",
    no: "005",
    davaciAdi: "Elif Arslan",
    davaliAdi: "Osman Kurt",
    foyTuru: "İş Davası",
    mahkeme: "Adana 4. Asliye Hukuk Mahkemesi",
    eYil: "2024",
    eNo: "2024/7890",
    durum: "Beklemede",
    davaTarihi: "18.01.2024",
    davaciTC: "44455566677",
    davaliTC: "88899900011",
    davaKonusu: "İş Davası",
    davaciVekili: "Av. Selin Koç",
    davaliVekili: "Av. Kemal Yıldız",
    davaTuru: "İş Davası",
    davaciAdres: "Adana, Seyhan, Reşatbey Mahallesi",
    davaliAdres: "Adana, Çukurova, Sarıçam Mahallesi",
    davaMiktari: "85.000,00 TL",
    sonIslem: "Dosya İnceleme",
    durusmaTarihi: "12.04.2024",
    aciklama: "Dosya inceleme aşamasında. Mahkeme kararı beklenmektedir.",
  },
  {
    id: 6,
    klasor: "2024/D-006",
    no: "006",
    davaciAdi: "Murat Aydın",
    davaliAdi: "Selin Koç",
    foyTuru: "Ortaklık Davası",
    mahkeme: "Antalya 2. Asliye Ticaret Mahkemesi",
    eYil: "2023",
    eNo: "2023/4567",
    durum: "Sonuçlandı",
    davaTarihi: "25.12.2023",
    davaciTC: "55566677788",
    davaliTC: "99900011122",
    davaKonusu: "Ortaklık Davası",
    davaciVekili: "Av. Ahmet Yılmaz",
    davaliVekili: "Av. Fatma Kaya",
    davaTuru: "Ticaret Davası",
    davaciAdres: "Antalya, Muratpaşa, Lara Mahallesi",
    davaliAdres: "Antalya, Konyaaltı, Hurma Mahallesi",
    davaMiktari: "300.000,00 TL",
    sonIslem: "Karar Kesinleşti",
    durusmaTarihi: "08.03.2024",
    aciklama: "Mahkeme kararı kesinleşmiştir. İcra aşamasına geçilebilir.",
  },
]

const paymentMethods = ["Kredi Kartı", "Banka Havalesi", "Nakit"]

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, {
    message: "Ödeme yöntemi seçmelisiniz.",
  }),
  paymentDate: z.date({
    required_error: "Ödeme tarihi seçmelisiniz.",
  }),
  amount: z.string().refine(
    (value) => {
      const num = Number.parseFloat(value)
      return !isNaN(num) && num > 0
    },
    {
      message: "Geçerli bir ödeme miktarı girmelisiniz.",
    },
  ),
})

export default function DavaDosyalarimPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredData, setFilteredData] = useState(sampleCases)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payments, setPayments] = useState([])

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "",
      paymentDate: new Date(),
      amount: "",
    },
  })

  const { watch } = form
  const paymentMethodValue = watch("paymentMethod")

  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    // Ödeme işlemini burada gerçekleştir
    console.log(values)
    setPayments([...payments, values])
    form.reset()
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setFilteredData(sampleCases)
      return
    }

    const filtered = sampleCases.filter((item) => {
      const searchLower = value.toLowerCase()
      return (
        item.klasor.toLowerCase().includes(searchLower) ||
        item.no.toLowerCase().includes(searchLower) ||
        item.davaciAdi.toLowerCase().includes(searchLower) ||
        item.davaliAdi.toLowerCase().includes(searchLower) ||
        item.foyTuru.toLowerCase().includes(searchLower) ||
        item.mahkeme.toLowerCase().includes(searchLower) ||
        item.eYil.includes(searchLower) ||
        item.eNo.toLowerCase().includes(searchLower) ||
        item.durum.toLowerCase().includes(searchLower) ||
        item.davaciTC.includes(value) ||
        item.davaliTC.includes(value)
      )
    })
    setFilteredData(filtered)
  }

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(direction)

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[field as keyof typeof a]
      const bValue = b[field as keyof typeof b]

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    setFilteredData(sorted)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Açık":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{status}</Badge>
      case "Karar Verildi":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>
      case "Temyizde":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">{status}</Badge>
      case "Beklemede":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{status}</Badge>
      case "Sonuçlandı":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleRowClick = (caseData: any) => {
    setSelectedCase(caseData)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anasayfaya Dön
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Dava Dosyalarım</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Dava Dosyaları ({filteredData.length} dosya)</CardTitle>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Dosya No, Davacı, Davalı, Mahkeme..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("klasor")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Klasör
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("no")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        No
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("davaciAdi")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Davacı Adı Soyadı
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("davaliAdi")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Davalı Adı Soyadı
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("foyTuru")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Foy Türü
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("mahkeme")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Mahkeme
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("eYil")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        E.Yıl
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("eNo")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        E.No
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("durum")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Durum
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("davaTarihi")}
                        className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                      >
                        Dava Tarihi
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow
                                                      key={item.id}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell className="font-medium text-xs py-1.5">{item.klasor}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.no}</TableCell>
                      <TableCell className="font-medium text-xs py-1.5">{item.davaciAdi}</TableCell>
                      <TableCell className="font-medium text-xs py-1.5">{item.davaliAdi}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.foyTuru}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.mahkeme}</TableCell>
                      <TableCell className="font-mono text-xs py-1.5">{item.eYil}</TableCell>
                      <TableCell className="font-mono text-xs py-1.5">{item.eNo}</TableCell>
                      <TableCell className="text-xs py-1.5">{getStatusBadge(item.durum)}</TableCell>
                      <TableCell className="text-xs py-1.5">{item.davaTarihi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredData.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Arama kriterlerinize uygun dava dosyası bulunamadı</p>
                  <p className="text-sm">Farklı anahtar kelimeler deneyebilirsiniz</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Dava Dosyası Detayları - {selectedCase?.klasor}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="fileDetails" className="space-y-4">
              <TabsList>
                <TabsTrigger value="fileDetails">Dosya Detayları</TabsTrigger>
                <TabsTrigger value="payment">Ödeme</TabsTrigger>
              </TabsList>
              <TabsContent value="fileDetails">
                {selectedCase && (
                  <div className="space-y-6 mt-4">
                    {/* Davacı Bilgileri */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Davacı Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Davacı Adı Soyadı</Label>
                          <p className="text-gray-900 font-medium">{selectedCase.davaciAdi}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">T.C. Kimlik No</Label>
                          <p className="text-gray-900 font-mono">{selectedCase.davaciTC}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Adres</Label>
                          <p className="text-gray-900">{selectedCase.davaciAdres}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Davacı Vekili</Label>
                          <p className="text-gray-900">{selectedCase.davaciVekili}</p>
                        </div>
                      </div>
                    </div>

                    {/* Davalı Bilgileri */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Davalı Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Davalı Adı Soyadı</Label>
                          <p className="text-gray-900 font-medium">{selectedCase.davaliAdi}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">T.C. Kimlik No</Label>
                          <p className="text-gray-900 font-mono">{selectedCase.davaliTC}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Adres</Label>
                          <p className="text-gray-900">{selectedCase.davaliAdres}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Davalı Vekili</Label>
                          <p className="text-gray-900">{selectedCase.davaliVekili}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mahkeme Bilgileri */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mahkeme Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Mahkeme</Label>
                          <p className="text-gray-900 text-sm">{selectedCase.mahkeme}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Esas No</Label>
                          <p className="text-gray-900 font-mono">{selectedCase.eNo}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Dava Tarihi</Label>
                          <p className="text-gray-900">{selectedCase.davaTarihi}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Dosya Durumu</Label>
                          <div className="mt-1">{getStatusBadge(selectedCase.durum)}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Föy Türü</Label>
                          <p className="text-gray-900">{selectedCase.foyTuru}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Dava Miktarı</Label>
                          <p className="text-gray-900 font-semibold text-green-600 text-lg">
                            {selectedCase.davaMiktari}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Duruşma Tarihi</Label>
                          <p className="text-gray-900">{selectedCase.durusmaTarihi}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Son İşlem</Label>
                          <p className="text-gray-900">{selectedCase.sonIslem}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Dava Türü</Label>
                          <p className="text-gray-900">{selectedCase.davaTuru}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Destekli Önerilen Sonraki Adımlar */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🤖 Önerilen Sonraki Adımlar
                        <span className="text-sm font-normal text-gray-600 ml-2">(AI Destekli)</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedCase.durum === "Açık" && (
                          <>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Duruşma hazırlığı yap</p>
                                <p className="text-sm text-gray-600">Delilleri ve tanık listesini hazırla</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Bilirkişi raporu talep et</p>
                                <p className="text-sm text-gray-600">Gerekirse uzman görüşü al</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Karşı tarafla sulh görüşmesi</p>
                                <p className="text-sm text-gray-600">Mahkeme dışı çözüm arayın</p>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedCase.durum === "Karar Verildi" && (
                          <>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Kararı incele</p>
                                <p className="text-sm text-gray-600">Temyiz sürelerini kontrol et</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">İcra takibi başlat</p>
                                <p className="text-sm text-gray-600">Lehte karar varsa icra işlemlerini başlat</p>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedCase.durum === "Temyizde" && (
                          <>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Temyiz dilekçesi hazırla</p>
                                <p className="text-sm text-gray-600">Yargıtay için gerekçeli dilekçe hazırla</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Yargıtay kararını bekle</p>
                                <p className="text-sm text-gray-600">Süreç takibini yap</p>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedCase.durum === "Beklemede" && (
                          <>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Dosya durumunu kontrol et</p>
                                <p className="text-sm text-gray-600">Mahkemeden bilgi al</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1" />
                              <div>
                                <p className="text-gray-900 font-medium">Eksik evrakları tamamla</p>
                                <p className="text-sm text-gray-600">Gerekli belgeleri temin et</p>
                              </div>
                            </div>
                          </>
                        )}
                        {selectedCase.durum === "Sonuçlandı" && (
                          <div className="flex items-start gap-3">
                            <input type="checkbox" className="mt-1" />
                            <div>
                              <p className="text-gray-900 font-medium">Dosyayı arşivle</p>
                              <p className="text-sm text-gray-600">Tamamlanan dosyayı arşive kaldır</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dosya Açıklaması */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosya Açıklaması</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedCase.aciklama}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="payment">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ödeme Yöntemi</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Ödeme Yöntemi Seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ödeme Tarihi</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Tarih Seçin</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miktar</FormLabel>
                          <FormControl>
                            <Input placeholder="Ödeme Miktarı" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Ödeme Ekle</Button>
                  </form>
                </Form>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Geçmişi</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Ödeme Yöntemi</TableHead>
                          <TableHead className="font-semibold text-gray-700">Ödeme Tarihi</TableHead>
                          <TableHead className="font-semibold text-gray-700">Miktar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{payment.paymentMethod}</TableCell>
                            <TableCell>{format(payment.paymentDate, "PPP")}</TableCell>
                            <TableCell>{payment.amount} TL</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {payments.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Henüz ödeme bulunmamaktadır.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
