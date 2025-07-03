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
import { icraDosyalariSampleData } from "./components/uyap-icra-detay-modal/utils/sample-data"

export default function IcraDosyalarimPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredData, setFilteredData] = useState(icraDosyalariSampleData)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<"empty" | "list" | "new">("empty")
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [uyapStatus, setUyapStatus] = useState<"Bağlı Değil" | "Bağlanıyor" | "Bağlı">("Bağlı Değil")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setFilteredData(icraDosyalariSampleData)
      return
    }

    const filtered = icraDosyalariSampleData.filter((item) => {
      const searchLower = value.toLowerCase()
      return (
        item.klasor.toLowerCase().includes(searchLower) ||
        item.dosyaNo.toLowerCase().includes(searchLower) ||
        item.borcluAdi.toLowerCase().includes(searchLower) ||
        item.alacakliAdi.toLowerCase().includes(searchLower) ||
        item.foyTuru.toLowerCase().includes(searchLower) ||
        item.icraMudurlugu.toLowerCase().includes(searchLower) ||
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

  const handleUyapToggle = () => {
    if (uyapStatus === "Bağlı Değil") {
      // Start connecting
      setUyapStatus("Bağlanıyor")
      setIsConnecting(true)

      // Simulate connection process
      setTimeout(() => {
        setUyapStatus("Bağlı")
        setIsConnecting(false)
      }, 2000)
    } else {
      // Disconnect
      setUyapStatus("Bağlı Değil")
      setIsConnecting(false)
    }
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
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Anasayfaya Dön</span>
                  <span className="xs:hidden">Geri</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">İcra Dosyalarım</h1>
            </div>

            {/* Right side - Uyap Status Badge */}
            <div className="flex items-center">
              <Badge
                onClick={isConnecting ? undefined : handleUyapToggle}
                className={cn(
                  "text-[10px] sm:text-xs px-2 py-1 transition-all duration-300 select-none",
                  uyapStatus === "Bağlı"
                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer hover:scale-105"
                    : uyapStatus === "Bağlanıyor"
                      ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 cursor-pointer hover:scale-105",
                  isConnecting && "animate-pulse-slow",
                )}
                style={{
                  animationDuration: isConnecting ? "3s" : undefined,
                }}
              >
                {isConnecting ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div>
                    <span>Uyap: Bağlanıyor...</span>
                  </div>
                ) : (
                  `Uyap: ${uyapStatus}`
                )}
              </Badge>
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
                              key={item.file_id}
                              className="cursor-pointer transition-colors hover:bg-orange-50 border border-gray-200"
                              onClick={() => handleRowClick(item)}
                            >
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm">{item.klasor}</p>
                                      <p className="text-xs text-gray-600">No: {item.dosyaNo}</p>
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
                                      onClick={() => handleSort("dosyaNo")}
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
                                      Takip Tarihi
                                      <ArrowUpDown className="w-2.5 h-2.5 ml-1" />
                                    </Button>
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredData.map((item) => (
                                  <TableRow
                                    key={item.file_id}
                                    className="cursor-pointer hover:bg-orange-50 h-8"
                                    onClick={() => handleRowClick(item)}
                                  >
                                    <TableCell className="py-1 px-1 text-[10px] font-medium">{item.klasor}</TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">{item.dosyaNo}</TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">
                                      <div className="max-w-[120px] truncate" title={item.borcluAdi}>
                                        {item.borcluAdi}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1 text-[10px]">
                                      <div className="max-w-[140px] truncate" title={item.alacakliAdi}>
                                        {item.alacakliAdi}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1 text-[9px]">
                                      <div className="max-w-[80px] truncate" title={item.foyTuru}>
                                        {item.foyTuru}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-1 px-1 text-[9px] hidden lg:table-cell">
                                      <div className="max-w-[120px] truncate" title={item.icraMudurlugu}>
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

                        {filteredData.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Arama sonucu bulunamadı</p>
                            <p className="text-sm mt-2">Farklı arama terimleri deneyebilirsiniz</p>
                          </div>
                        )}
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
                              className="w-full justify-start h-9 sm:h-10 text-[10px] sm:text-xs px-1 sm:px-2 bg-transparent"
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

      {/* UYAP İcra Detay Modal */}
      <UyapIcraDetayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCase={selectedCase}
        uyapStatus={uyapStatus}
        onUyapToggle={handleUyapToggle}
        isConnecting={isConnecting}
      />

      {/* Yeni İcra Föyü Modal */}
      <YeniIcraFoyuModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onSave={handleSaveNewFile}
      />
    </div>
  )
}
