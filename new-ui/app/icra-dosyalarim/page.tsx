"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, ArrowLeft, Plus, Users, Bell, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import UyapIcraDetayModal from "./components/uyap-icra-detay-modal"
import YeniIcraFoyuModal from "./components/yeni-icra-foyu"
import type { FormData } from "./components/yeni-icra-foyu/types/form-types"

// Sample execution files data with multiple debtors
const sampleData = [
  {
    id: 1,
    klasor: "2024/001",
    no: "001",
    borcluAdi: "Ahmet Yılmaz",
    borcluList: [
      {
        ad: "Ahmet Yılmaz",
        tcKimlik: "12345678901",
        telefon: "0532 123 45 67",
        adres: "Moda Mahallesi, Bahariye Caddesi No: 45/7",
        vekil: "Av. Mehmet Özkan",
      },
    ],
    alacakliAdi: "ABC Şirketi Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    icraMudurlugu: "İstanbul 1. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1234",
    durum: "Açık",
    takipTarihi: "15.01.2024",
    tcKimlik: "12345678901",
    telefon: "0532 123 45 67",
    il: "İstanbul",
    ilce: "Kadıköy",
    adres: "Moda Mahallesi, Bahariye Caddesi No: 45/7",
    borcluVekili: "Av. Mehmet Özkan",
    borcMiktari: "125.000,00 TL",
    alacakliVekili: "Av. Fatma Demir",
    borclu: "Ahmet Yılmaz",
    alacakli: "ABC Şirketi Ltd. Şti.",
    email: "ahmet.yilmaz@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "2.500,00 TL",
    notlar: "Borçlu ile 15.02.2024 tarihinde görüşüldü. Ödeme planı önerisi reddedildi. Haciz işlemine geçilecek.",
  },
  {
    id: 2,
    klasor: "2024/002",
    no: "002",
    borcluAdi: "Ayşe Demir, Mehmet Demir",
    borcluList: [
      {
        ad: "Ayşe Demir",
        tcKimlik: "98765432109",
        telefon: "0533 987 65 43",
        adres: "Kızılay Mahallesi, Atatürk Bulvarı No: 123/5",
        vekil: "Av. Zeynep Öz",
      },
      {
        ad: "Mehmet Demir",
        tcKimlik: "11223344556",
        telefon: "0534 111 22 33",
        adres: "Kızılay Mahallesi, Atatürk Bulvarı No: 123/5",
        vekil: "Av. Zeynep Öz",
      },
    ],
    alacakliAdi: "XYZ Holding A.Ş.",
    foyTuru: "İlamlı İcra",
    icraMudurlugu: "Ankara 2. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1235",
    durum: "Derdest",
    takipTarihi: "10.01.2024",
    tcKimlik: "98765432109",
    telefon: "0533 987 65 43",
    il: "Ankara",
    ilce: "Çankaya",
    adres: "Kızılay Mahallesi, Atatürk Bulvarı No: 123/5",
    borcluVekili: "Av. Zeynep Öz",
    borcMiktari: "75.500,00 TL",
    alacakliVekili: "Av. Ali Kaya",
    borclu: "Ayşe Demir, Mehmet Demir",
    alacakli: "XYZ Holding A.Ş.",
    email: "ayse.demir@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "1.800,00 TL",
    notlar: "İlam tebliğ edildi. Borçlu itiraz sürecinde.",
  },
  {
    id: 3,
    klasor: "2024/003",
    no: "003",
    borcluAdi: "Hasan Çelik, Fatma Çelik, Oğuz Çelik",
    borcluList: [
      {
        ad: "Hasan Çelik",
        tcKimlik: "11223344556",
        telefon: "0534 111 22 33",
        adres: "Alsancak Mahallesi, Cumhuriyet Bulvarı No: 67/2",
        vekil: "-",
      },
      {
        ad: "Fatma Çelik",
        tcKimlik: "55667788990",
        telefon: "0535 555 66 77",
        adres: "Alsancak Mahallesi, Cumhuriyet Bulvarı No: 67/2",
        vekil: "Av. Murat Kaya",
      },
      {
        ad: "Oğuz Çelik",
        tcKimlik: "33445566778",
        telefon: "0536 333 44 55",
        adres: "Bornova Mahallesi, İzmir Caddesi No: 89/3",
        vekil: "-",
      },
    ],
    alacakliAdi: "Emlak Yatırım A.Ş.",
    foyTuru: "Tahliye Takibi",
    icraMudurlugu: "İzmir 3. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1236",
    durum: "İtiraz",
    takipTarihi: "05.01.2024",
    tcKimlik: "11223344556",
    telefon: "0534 111 22 33",
    il: "İzmir",
    ilce: "Konak",
    adres: "Alsancak Mahallesi, Cumhuriyet Bulvarı No: 67/2",
    borcluVekili: "-",
    borcMiktari: "25.000,00 TL",
    alacakliVekili: "Av. Fatma Demir",
    borclu: "Hasan Çelik, Fatma Çelik, Oğuz Çelik",
    alacakli: "Emlak Yatırım A.Ş.",
    email: "hasan.celik@email.com",
    tebligDurumu: "Tebliğ Edilmedi",
    masraf: "1.200,00 TL",
    notlar: "İtiraz süreci devam ediyor. Tahliye işlemi beklemede.",
  },
  {
    id: 4,
    klasor: "22023/045",
    no: "045",
    borcluAdi: "Fatma Kara",
    borcluList: [
      {
        ad: "Fatma Kara",
        tcKimlik: "55667788990",
        telefon: "0535 555 66 77",
        adres: "Görükle Mahallesi, Uludağ Üniversitesi Caddesi No: 89/12",
        vekil: "-",
      },
    ],
    alacakliAdi: "Teknoloji Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    icraMudurlugu: "Bursa 1. İcra Müdürlüğü",
    eYil: "2023",
    eNo: "2023/9876",
    durum: "Sonuçlandı",
    takipTarihi: "20.12.2023",
    tcKimlik: "55667788990",
    telefon: "0535 555 66 77",
    il: "Bursa",
    ilce: "Nilüfer",
    adres: "Görükle Mahallesi, Uludağ Üniversitesi Caddesi No: 89/12",
    borcluVekili: "-",
    borcMiktari: "45.250,25 TL",
    alacakliVekili: "Av. Mehmet Ak",
    borclu: "Fatma Kara",
    alacakli: "Teknoloji Ltd. Şti.",
    email: "fatma.kara@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "2.100,00 TL",
    notlar: "Tahsilat tamamlandı. Dosya kapatıldı.",
  },
  {
    id: 5,
    klasor: "2024/004",
    no: "004",
    borcluAdi: "Mehmet Özkan, Zeynep Özkan",
    borcluList: [
      {
        ad: "Mehmet Özkan",
        tcKimlik: "33445566778",
        telefon: "0536 333 44 55",
        adres: "Lara Mahallesi, Güzeloba Caddesi No: 156/8",
        vekil: "Av. Kemal Yurt",
      },
      {
        ad: "Zeynep Özkan",
        tcKimlik: "77889900112",
        telefon: "0537 777 88 99",
        adres: "Lara Mahallesi, Güzeloba Caddesi No: 156/8",
        vekil: "Av. Kemal Yurt",
      },
    ],
    alacakliAdi: "Finans Bankası A.Ş.",
    foyTuru: "İlamlı İcra",
    icraMudurlugu: "Antalya 1. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1237",
    durum: "Açık",
    takipTarihi: "22.01.2024",
    tcKimlik: "33445566778",
    telefon: "0536 333 44 55",
    il: "Antalya",
    ilce: "Muratpaşa",
    adres: "Lara Mahallesi, Güzeloba Caddesi No: 156/8",
    borcluVekili: "Av. Kemal Yurt",
    borcMiktari: "180.000,00 TL",
    alacakliVekili: "Av. Selin Acar",
    borclu: "Mehmet Özkan, Zeynep Özkan",
    alacakli: "Finans Bankası A.Ş.",
    email: "mehmet.ozkan@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "3.200,00 TL",
    notlar: "Kredi borcu nedeniyle açılan takip. Haciz işlemi başlatıldı.",
  },
  {
    id: 6,
    klasor: "2024/005",
    no: "005",
    borcluAdi: "Zeynep Şahin",
    borcluList: [
      {
        ad: "Zeynep Şahin",
        tcKimlik: "77889900112",
        telefon: "0537 777 88 99",
        adres: "Reşatbey Mahallesi, İnönü Caddesi No: 234/15",
        vekil: "-",
      },
    ],
    alacakliAdi: "İnşaat Müteahhitlik Ltd.",
    foyTuru: "İlamsız İcra",
    icraMudurlugu: "Adana 2. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1238",
    durum: "Derdest",
    takipTarihi: "28.01.2024",
    tcKimlik: "77889900112",
    telefon: "0537 777 88 99",
    il: "Adana",
    ilce: "Seyhan",
    adres: "Reşatbey Mahallesi, İnönü Caddesi No: 234/15",
    borcluVekili: "-",
    borcMiktari: "95.750,00 TL",
    alacakliVekili: "Av. Okan Demir",
    borclu: "Zeynep Şahin",
    alacakli: "İnşaat Müteahhitlik Ltd.",
    email: "zeynep.sahin@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "2.800,00 TL",
    notlar: "Müteahhitlik hizmet bedeli alacağı. Ödeme planı görüşülüyor.",
  },
  {
    id: 7,
    klasor: "2023/078",
    no: "078",
    borcluAdi: "Can Yıldız",
    borcluList: [
      {
        ad: "Can Yıldız",
        tcKimlik: "44556677889",
        telefon: "0538 444 55 66",
        adres: "Yazır Mahallesi, Ankara Caddesi No: 78/3",
        vekil: "Av. Deniz Kaya",
      },
    ],
    alacakliAdi: "Otomotiv Ticaret A.Ş.",
    foyTuru: "Rehinli Alacak Takibi",
    icraMudurlugu: "Konya 1. İcra Müdürlüğü",
    eYil: "2023",
    eNo: "2023/8765",
    durum: "İtiraz",
    takipTarihi: "15.11.2023",
    tcKimlik: "44556677889",
    telefon: "0538 444 55 66",
    il: "Konya",
    ilce: "Selçuklu",
    adres: "Yazır Mahallesi, Ankara Caddesi No: 78/3",
    borcluVekili: "Av. Deniz Kaya",
    borcMiktari: "220.000,00 TL",
    alacakliVekili: "Av. Cem Özgür",
    borclu: "Can Yıldız",
    alacakli: "Otomotiv Ticaret A.Ş.",
    email: "can.yildiz@email.com",
    tebligDurumu: "Tebliğ Edildi",
    masraf: "4.500,00 TL",
    notlar: "Araç kredisi borcu. Rehin konusu araç haczedildi. İtiraz süreci devam ediyor.",
  },
  {
    id: 8,
    klasor: "2024/006",
    no: "006",
    borcluAdi: "Elif Arslan",
    borcluList: [
      {
        ad: "Elif Arslan",
        tcKimlik: "66778899001",
        telefon: "0539 666 77 88",
        adres: "İstasyon Mahallesi, Atatürk Bulvarı No: 345/7",
        vekil: "-",
      },
    ],
    alacakliAdi: "Tekstil İhracat Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    icraMudurlugu: "Gaziantep 1. İcra Müdürlüğü",
    eYil: "2024",
    eNo: "2024/1239",
    durum: "Açık",
    takipTarihi: "02.02.2024",
    tcKimlik: "66778899001",
    telefon: "0539 666 77 88",
    il: "Gaziantep",
    ilce: "Şahinbey",
    adres: "İstasyon Mahallesi, Atatürk Bulvarı No: 345/7",
    borcluVekili: "-",
    borcMiktari: "65.400,00 TL",
    alacakliVekili: "Av. Murat Çelik",
    borclu: "Elif Arslan",
    alacakli: "Tekstil İhracat Ltd. Şti.",
    email: "elif.arslan@email.com",
    tebligDurumu: "Tebliğ Edilmedi",
    masraf: "1.950,00 TL",
    notlar: "Ticari alacak takibi. Borçlu ile iletişim kurulamadı.",
  },
]

export default function IcraDosyalarimPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredData, setFilteredData] = useState(sampleData)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<"empty" | "list" | "new">("empty")
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setFilteredData(sampleData)
      return
    }

    const filtered = sampleData.filter((item) => {
      const searchLower = value.toLowerCase()
      return (
        item.klasor.toLowerCase().includes(searchLower) ||
        item.no.toLowerCase().includes(searchLower) ||
        item.borcluAdi.toLowerCase().includes(searchLower) ||
        item.alacakliAdi.toLowerCase().includes(searchLower) ||
        item.foyTuru.toLowerCase().includes(searchLower) ||
        item.icraMudurlugu.toLowerCase().includes(searchLower) ||
        item.eYil.includes(searchLower) ||
        item.eNo.toLowerCase().includes(searchLower) ||
        item.durum.toLowerCase().includes(searchLower) ||
        item.tcKimlik.includes(value)
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
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        )
      case "Derdest":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        )
      case "İtiraz":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        )
      case "Sonuçlandı":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {status}
          </Badge>
        )
    }
  }

  const handleRowClick = (caseData: any) => {
    setSelectedCase(caseData)
    setIsModalOpen(true)
  }

  const handleSaveNewFile = async (formData: FormData) => {
    console.log("Saving new file:", formData)
    // Here you would typically send the data to your backend
    // For now, we'll just simulate a successful save
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add the new file to the list and switch to list view
    setActiveView("list")
  }

  // Left sidebar buttons
  const leftSidebarButtons = [
    {
      label: "Föyleri Getir",
      icon: FileText,
      action: () => setActiveView("list"),
      active: activeView === "list",
    },
    {
      label: "Yeni Föy Ekle",
      icon: Plus,
      action: () => setIsNewFileModalOpen(true),
      active: false,
    },
  ]

  // Right sidebar buttons
  const rightSidebarButtons = [
    {
      label: "Toplu Takip Aç",
      icon: Users,
      action: () => console.log("Toplu Takip Aç"),
    },
    {
      label: "Toplu Sorgulama Yap",
      icon: Search,
      action: () => console.log("Toplu Sorgulama Yap"),
    },
    {
      label: "Tebligat Durumları",
      icon: Bell,
      action: () => console.log("Tebligat Durumları"),
    },
    {
      label: "Yapılacak İş Getir",
      icon: Calendar,
      action: () => console.log("Yapılacak İş Getir"),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Anasayfaya Dön</span>
                  <span className="xs:hidden">Geri</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center">İcra Dosyalarım</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with responsive layout */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-1 sm:gap-1 lg:gap-1.5">
              {/* Left Sidebar - Reduced width */}
              <div className="w-full lg:w-48 shrink-0">
                <div className="lg:sticky lg:top-8 space-y-2 sm:space-y-3">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base">İşlemler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-1 sm:px-2">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                        {leftSidebarButtons.map((button, index) => {
                          const Icon = button.icon
                          return (
                            <Button
                              key={index}
                              variant={button.active ? "default" : "outline"}
                              className={cn(
                                "w-full justify-start h-9 sm:h-10 text-[10px] sm:text-xs px-1 sm:px-2",
                                button.active && "bg-orange-600 hover:bg-orange-700",
                              )}
                              onClick={button.action}
                            >
                              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0 flex-shrink-0" />
                              <span className="truncate text-[10px] sm:text-sm">{button.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">İcra Dosyalarım</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeView === "empty" && (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="text-base sm:text-lg font-medium px-4">
                          Dosya listesini görüntülemek için "Föyleri Getir" butonuna tıklayın
                        </p>
                        <p className="text-xs sm:text-sm mt-2 px-4">
                          Yeni bir föy eklemek için "Yeni Föy Ekle" butonunu kullanabilirsiniz
                        </p>
                      </div>
                    )}

                    {activeView === "list" && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            placeholder="Dosya No, Borçlu Adı, Borçlu Soyadı..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8 sm:pl-10 text-xs sm:text-sm h-8 sm:h-10"
                          />
                        </div>

                        {/* Mobile Card View */}
                        <div className="block sm:hidden space-y-2">
                          {filteredData.map((item) => (
                            <Card
                              key={item.id}
                              className="cursor-pointer transition-colors hover:bg-orange-50 border border-gray-200"
                              onClick={() => handleRowClick(item)}
                            >
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm">{item.klasor}</p>
                                      <p className="text-xs text-gray-600">No: {item.no}</p>
                                    </div>
                                    {getStatusBadge(item.durum)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-xs">Borçlu: {item.borcluAdi}</p>
                                    <p className="text-xs text-gray-600">Alacaklı: {item.alacakliAdi}</p>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{item.foyTuru}</span>
                                    <span>{item.takipTarihi}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block">
                          <div className="overflow-x-auto">
                            <Table className="text-xs w-full">
                              <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 w-20">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("klasor")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      Klasör
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 w-12">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("no")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      No
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("borcluAdi")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      Borçlu Adı
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("alacakliAdi")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      Alacaklı Adı
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 w-24">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("foyTuru")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      Föy Türü
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 hidden lg:table-cell">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("icraMudurlugu")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      İcra Müdürlüğü
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 w-16">Durum</TableHead>
                                  <TableHead className="font-semibold text-gray-700 py-1 px-1 w-20">
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleSort("takipTarihi")}
                                      className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 text-xs"
                                    >
                                      Tarih
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredData.map((item) => (
                                  <TableRow
                                    key={item.id}
                                    className="cursor-pointer transition-colors hover:bg-orange-50 h-8"
                                    onClick={() => handleRowClick(item)}
                                  >
                                    <TableCell className="font-medium py-1 px-1 text-[10px]">{item.klasor}</TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">{item.no}</TableCell>
                                    <TableCell className="font-medium py-1 px-1 text-[10px]">
                                      <div className="truncate max-w-[120px]" title={item.borcluAdi}>
                                        {item.borcluAdi}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">
                                      <div className="truncate max-w-[120px]" title={item.alacakliAdi}>
                                        {item.alacakliAdi}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">
                                      <div className="truncate" title={item.foyTuru}>
                                        {item.foyTuru
                                          .replace("İlamsız İcra", "İlamsız")
                                          .replace("İlamlı İcra", "İlamlı")}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-[9px] py-1 px-1 hidden lg:table-cell">
                                      <div className="truncate max-w-[140px]" title={item.icraMudurlugu}>
                                        {item.icraMudurlugu}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1">{getStatusBadge(item.durum)}</TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">{item.takipTarihi}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Reduced width */}
              <div className="w-full lg:w-48 shrink-0">
                <div className="lg:sticky lg:top-8 space-y-2 sm:space-y-3">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base">Hızlı İşlemler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-1 sm:px-2">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                        {rightSidebarButtons.map((button, index) => {
                          const Icon = button.icon
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start h-9 sm:h-10 text-[10px] sm:text-xs px-1 sm:px-2"
                              onClick={button.action}
                            >
                              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0 flex-shrink-0" />
                              <span className="truncate text-[10px] sm:text-sm">{button.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      <YeniIcraFoyuModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onSave={handleSaveNewFile}
      />

      {/* UYAP Detail Modal */}
      <UyapIcraDetayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedCase={selectedCase} />
    </div>
  )
}
