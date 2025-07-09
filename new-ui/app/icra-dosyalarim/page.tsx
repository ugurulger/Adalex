"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Search,
  ArrowUpDown,
  ArrowLeft,
  Plus,
  Users,
  Bell,
  Calendar,
  FileText,
  Loader2,
  Settings,
  ChevronDown,
  User,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import UyapIcraDetayModal from "./components/uyap-icra-detay-modal"
import YeniIcraFoyuModal from "./components/yeni-icra-foyu"
import type { FormData } from "./components/yeni-icra-foyu/types/form-types"
import type { IcraDosyasiListItem } from "../../types/api"
import { uyapService, UYAPResponse } from "@/lib/uyap-service"

export default function IcraDosyalarimPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [allData, setAllData] = useState<IcraDosyasiListItem[]>([])
  const [filteredData, setFilteredData] = useState<IcraDosyasiListItem[]>([])
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<"empty" | "list" | "new">("empty")
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [uyapStatus, setUyapStatus] = useState<"Bağlı Değil" | "Bağlanıyor" | "Bağlı">("Bağlı Değil")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<string>("10")
  const [username, setUsername] = useState<string>("Tuğçe Delibaş")
  const [pincode, setPincode] = useState<string>("9092")
  const [uyapSessionId, setUyapSessionId] = useState<string | null>(null)
  const [isUyapSearching, setIsUyapSearching] = useState(false)
  const [isUyapExtracting, setIsUyapExtracting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check UYAP status on component mount
  useEffect(() => {
    const checkUyapStatus = async () => {
      try {
        const response: UYAPResponse = await uyapService.getStatus()
        if (response.success && response.active_sessions && response.active_sessions.length > 0) {
          setUyapSessionId(response.active_sessions[0])
          setUyapStatus("Bağlı")
        }
      } catch (error) {
        console.error("Error checking UYAP status:", error)
      }
    }

    checkUyapStatus()
  }, [])

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/icra-dosyalarim")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: IcraDosyasiListItem[] = await response.json()
      setAllData(data)
      setFilteredData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setFilteredData(allData)
      return
    }

    const filtered = allData.filter((item) => {
      const searchLower = value.toLowerCase()
      return (
        item.klasor.toLowerCase().includes(searchLower) ||
        item.dosyaNo.toLowerCase().includes(searchLower) ||
        item.borcluAdi.toLowerCase().includes(searchLower) ||
        item.alacakliAdi.toLowerCase().includes(searchLower) ||
        item.foyTuru.toLowerCase().includes(searchLower) ||
        item.icraMudurlugu.toLowerCase().includes(searchLower) ||
        item.durum.toLowerCase().includes(searchLower)
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

  const handleRowClick = async (caseData: IcraDosyasiListItem) => {
    try {
      // Fetch detailed data for the selected case
      const response = await fetch(`/api/icra-dosyalarim/${caseData.file_id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const detailData = await response.json()
      setSelectedCase(detailData)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error fetching case details:", error)
      setError("Dosya detayları yüklenirken hata oluştu.")
    }
  }

  const handleSaveNewFile = async (formData: FormData) => {
    console.log("Saving new file:", formData)
    // Here you would typically send the data to your backend
    // For now, we'll just simulate a successful save
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Refresh the data after adding new file
    await fetchData()
    setActiveView("list")
  }

  const handleUyapToggle = async () => {
    if (uyapStatus === "Bağlı Değil") {
      // Start connecting
      setUyapStatus("Bağlanıyor")
      setIsConnecting(true)

      try {
        // Login to UYAP
        const response: UYAPResponse = await uyapService.login(pincode)
        
        if (response.success && response.session_id) {
          setUyapSessionId(response.session_id)
        setUyapStatus("Bağlı")
        } else {
          setError(response.message || "UYAP'a bağlanılamadı")
          setUyapStatus("Bağlı Değil")
        }
      } catch (error) {
        console.error("UYAP login error:", error)
        setError("UYAP'a bağlanırken hata oluştu")
        setUyapStatus("Bağlı Değil")
      } finally {
        setIsConnecting(false)
      }
    } else {
      // Disconnect
      try {
        if (uyapSessionId) {
          await uyapService.logout(uyapSessionId)
        }
      } catch (error) {
        console.error("UYAP logout error:", error)
      }
      
      setUyapSessionId(null)
      setUyapStatus("Bağlı Değil")
      setIsConnecting(false)
    }
  }

  const handleFetchFiles = () => {
    setActiveView("list")
    fetchData()
  }

  // İlk Kurulum functions
  const handleSearchAllFiles = async () => {
    if (!uyapSessionId) {
      setError("Önce UYAP'a bağlanın")
      return
    }

    try {
      setIsUyapSearching(true)
      setError(null)
      const response: UYAPResponse = await uyapService.searchFiles(uyapSessionId)
      
      if (response.success) {
        console.log("UYAP search completed successfully")
        setSuccessMessage("UYAP arama işlemi başarıyla tamamlandı")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(response.message || "UYAP arama işlemi başarısız")
      }
    } catch (error) {
      console.error("UYAP search error:", error)
      setError("UYAP arama işlemi sırasında hata oluştu")
    } finally {
      setIsUyapSearching(false)
    }
  }

  const handleFetchFromUyap = async () => {
    if (!uyapSessionId) {
      setError("Önce UYAP'a bağlanın")
      return
    }

    try {
      setIsUyapExtracting(true)
      setError(null)
      const response: UYAPResponse = await uyapService.extractData(uyapSessionId)
      
      if (response.success) {
        console.log("UYAP data extraction completed successfully")
        setSuccessMessage("UYAP veri çekme işlemi başarıyla tamamlandı")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(response.message || "UYAP veri çekme işlemi başarısız")
      }
    } catch (error) {
      console.error("UYAP extract error:", error)
      setError("UYAP veri çekme işlemi sırasında hata oluştu")
    } finally {
      setIsUyapExtracting(false)
    }
  }

  // Profile functions (to be implemented later)
  const handleProfileSave = () => {
    console.log("Profile saved:", { username, pincode })
  }

  // Left sidebar buttons
  const leftSidebarButtons = [
    {
      label: "Föyleri Getir",
      icon: FileText,
      action: handleFetchFiles,
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

            {/* Center - Menu Items */}
            <div className="flex items-center gap-2">
              {/* İlk Kurulum Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    İlk Kurulum
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-80 p-4">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-900 mb-3">İlk Kurulum İşlemleri</div>

                    {/* First button */}
                    <div>
                      <Button
                        onClick={handleSearchAllFiles}
                        className="w-full justify-start text-xs sm:text-sm bg-transparent"
                        variant="outline"
                        disabled={isUyapSearching || isUyapExtracting || !uyapSessionId}
                      >
                        {isUyapSearching ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                        ) : (
                        <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        )}
                        Bütün Dosyaları UYAP'ta Ara
                      </Button>
                    </div>

                    {/* Second button with input */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleFetchFromUyap}
                        className="flex-1 justify-start text-xs sm:text-sm bg-transparent"
                        variant="outline"
                        disabled={isUyapSearching || isUyapExtracting || !uyapSessionId}
                      >
                        {isUyapExtracting ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                        ) : (
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        )}
                        Föyleri UYAP'tan Çek
                      </Button>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={pageCount}
                          onChange={(e) => setPageCount(e.target.value)}
                          placeholder="10"
                          className="w-16 h-8 text-xs text-center"
                          min="1"
                          max="100"
                          disabled={isUyapSearching || isUyapExtracting}
                        />
                        <span className="text-xs text-gray-500">sayfa</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Profil
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 p-4">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-900 mb-3">Profil Bilgileri</div>

                    {/* Username field */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-medium text-gray-700">
                        Kullanıcı Adı
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Kullanıcı adı"
                        className="w-full h-8 text-xs"
                      />
                    </div>

                    {/* Pincode field */}
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-xs font-medium text-gray-700">
                        Pin Kodu
                      </Label>
                      <Input
                        id="pincode"
                        type="password"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pin kodu"
                        className="w-full h-8 text-xs"
                      />
                    </div>

                    {/* Save button */}
                    <div className="pt-2">
                      <Button
                        onClick={handleProfileSave}
                        className="w-full text-xs bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Uyap Status Badge */}
            <div className="flex items-center">
              <Badge
                onClick={handleUyapToggle}
                className={cn(
                  "text-[10px] sm:text-xs px-2 py-1 cursor-pointer transition-all duration-300 hover:scale-105 select-none",
                  uyapStatus === "Bağlı"
                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    : uyapStatus === "Bağlanıyor"
                      ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
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
                              disabled={isLoading}
                            >
                              {isLoading && button.active ? (
                                <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0 flex-shrink-0 animate-spin" />
                              ) : (
                                <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0 flex-shrink-0" />
                              )}
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
                    {/* Error Display */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setError(null)
                            fetchData()
                          }}
                          className="mt-2"
                        >
                          Tekrar Dene
                        </Button>
                      </div>
                    )}

                    {/* Success Display */}
                    {successMessage && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">{successMessage}</p>
                      </div>
                    )}

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
                            disabled={isLoading}
                          />
                        </div>

                        {isLoading && (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-orange-600" />
                            <p className="text-sm text-gray-600">Veriler yükleniyor...</p>
                          </div>
                        )}

                        {!isLoading && (
                          <>
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
                                          <p className="text-xs text-gray-600">Dosya No: {item.dosyaNo}</p>
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
                                          Dosya No
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
                                      <TableHead className="font-semibold text-gray-700 py-1 px-1 w-16">
                                        Durum
                                      </TableHead>
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
                                        <TableCell className="py-1 px-1 text-[10px] font-medium">
                                          {item.klasor}
                                        </TableCell>
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

                            {filteredData.length === 0 && !isLoading && (
                              <div className="text-center py-8 text-gray-500">
                                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Arama sonucu bulunamadı</p>
                                <p className="text-sm mt-2">Farklı arama terimleri deneyebilirsiniz</p>
                              </div>
                            )}
                          </>
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
