"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getStatusBadgeForDoc } from "../utils/status-badges"

export default function EvrakGonderTab() {
  const [selectedDocType, setSelectedDocType] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [documentNotes, setDocumentNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error" | "info"; message: string } | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample sent documents data
  const [sentDocuments, setSentDocuments] = useState([
    {
      id: 1,
      docType: "Ödeme Emri",
      fileName: "odeme_emri_2024_001.pdf",
      sentDate: "15.01.2024 14:30",
      status: "Gönderildi",
      uyapRef: "UYP-2024-001234",
      notes: "İlk ödeme emri gönderimi",
    },
    {
      id: 2,
      docType: "Tebligat",
      fileName: "tebligat_belgesi.pdf",
      sentDate: "10.01.2024 09:15",
      status: "Teslim Edildi",
      uyapRef: "UYP-2024-001235",
      notes: "",
    },
    {
      id: 3,
      docType: "Haciz Talebi",
      fileName: "haciz_talebi_form.docx",
      sentDate: "05.01.2024 16:45",
      status: "İşlemde",
      uyapRef: "UYP-2024-001236",
      notes: "Banka hesap haczi için",
    },
  ])

  const documentTypes = [
    "Ödeme Emri",
    "Haciz Talebi",
    "Tebligat",
    "İtiraz Cevabı",
    "Satış Talebi",
    "Tahsilat Bildirimi",
    "Masraf Bildirimi",
    "Vekalet Belgesi",
    "İcra İflas Kanunu Dilekçesi",
    "Diğer Resmi Evrak",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

    if (file.size > maxSize) {
      setUploadMessage({ type: "error", message: "Dosya boyutu 10MB'dan büyük olamaz." })
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadMessage({ type: "error", message: "Sadece PDF ve DOCX dosyaları kabul edilir." })
      return
    }

    setUploadedFile(file)
    setUploadMessage({ type: "success", message: `Dosya başarıyla seçildi: ${file.name}` })
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setUploadMessage(null)
  }

  const handleSendDocument = async () => {
    if (!selectedDocType || !uploadedFile) {
      setUploadMessage({ type: "error", message: "Lütfen evrak türü seçin ve dosya yükleyin." })
      return
    }

    setIsUploading(true)
    setUploadMessage({ type: "info", message: "Evrak UYAP'a gönderiliyor..." })

    // Simulate API call
    setTimeout(() => {
      const newDoc = {
        id: sentDocuments.length + 1,
        docType: selectedDocType,
        fileName: uploadedFile.name,
        sentDate:
          new Date().toLocaleDateString("tr-TR") +
          " " +
          new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        status: "Gönderildi",
        uyapRef: `UYP-2024-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
        notes: documentNotes,
      }

      setSentDocuments([newDoc, ...sentDocuments])
      setSelectedDocType("")
      setUploadedFile(null)
      setDocumentNotes("")
      setIsUploading(false)
      setUploadMessage({ type: "success", message: "Evrak başarıyla UYAP'a gönderildi!" })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Vertical Layout - All blocks stacked */}

      {/* 1. Evrak Gönder Bölümü - Top Block */}
      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          📤 Evrak Gönder
          <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">UYAP Entegre</Badge>
        </h3>

        <div className="space-y-3">
          {/* New Layout - Left column (Evrak Türü + Dosya Yükle) and Right column (Açıklama) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column - Evrak Türü and Dosya Yükle stacked */}
            <div className="space-y-3">
              {/* Document Type Selection */}
              <div>
                <Label className="text-xs font-medium text-gray-600">Evrak Türü *</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Evrak türü seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType} value={docType}>
                        {docType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload - underneath Evrak Türü */}
              <div>
                <Label className="text-xs font-medium text-gray-600">
                  Dosya Yükle * <span className="text-gray-500">(PDF, DOCX - Max 10MB)</span>
                </Label>
                <div className="mt-1">
                  <label className="flex items-center justify-center w-full h-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Dosya Seç</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {uploadedFile && (
                    <div className="mt-2 p-2 bg-white rounded border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Aç��klama (full height to match left column) */}
            <div className="flex flex-col">
              <Label className="text-xs font-medium text-gray-600">Açıklama</Label>
              <Textarea
                value={documentNotes}
                onChange={(e) => setDocumentNotes(e.target.value)}
                className="mt-1 flex-1 resize-none w-full text-xs min-h-[120px]"
                placeholder="Evrak açıklaması..."
              />
            </div>
          </div>

          {/* Send Button Row */}
          <div className="flex justify-start">
            <Button
              onClick={handleSendDocument}
              disabled={!selectedDocType || !uploadedFile || isUploading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 h-8 text-xs"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-xs">Gönderiliyor...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>📤</span>
                  <span className="text-xs">UYAP'a Gönder</span>
                </div>
              )}
            </Button>
          </div>

          {/* Status Messages - Compact */}
          {uploadMessage && (
            <Alert
              className={`py-2 ${
                uploadMessage.type === "success"
                  ? "border-green-200 bg-green-50"
                  : uploadMessage.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadMessage.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                {uploadMessage.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
                {uploadMessage.type === "info" && <AlertCircle className="w-4 h-4 text-blue-600" />}
                <AlertDescription
                  className={`text-sm ${
                    uploadMessage.type === "success"
                      ? "text-green-800"
                      : uploadMessage.type === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                  }`}
                >
                  {uploadMessage.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </div>

      {/* 2. Gönderilen Evraklar Tablosu - Bottom Block (Responsive) */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          📋 Gönderilen Evraklar
          <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">{sentDocuments.length} Evrak</Badge>
        </h3>

        {/* Mobile Card View - Visible on small screens */}
        <div className="block lg:hidden space-y-2">
          {sentDocuments.map((doc) => (
            <div key={doc.id} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{doc.docType}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      {doc.fileName}
                    </p>
                  </div>
                  {getStatusBadgeForDoc(doc.status)}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{doc.sentDate}</span>
                  <span className="font-mono">{doc.uyapRef}</span>
                </div>
                {doc.notes && <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{doc.notes}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Hidden on small screens */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto border rounded-lg">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    Evrak Türü
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    Dosya Adı
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    Tarih
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    Durum
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    UYAP Ref.
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs py-2 text-left w-[16.66%] px-2">
                    Açıklama
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-xs py-2 text-left w-[16.66%] px-2">
                      <div className="break-words">{doc.docType}</div>
                    </TableCell>
                    <TableCell className="py-2 text-left w-[16.66%] px-2">
                      <div className="flex items-start gap-1">
                        <FileText className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="break-words min-w-0 text-[10px]" title={doc.fileName}>
                          {doc.fileName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-left w-[16.66%] px-2">
                      <div className="break-words">{doc.sentDate}</div>
                    </TableCell>
                    <TableCell className="py-2 text-left w-[16.66%] px-2">{getStatusBadgeForDoc(doc.status)}</TableCell>
                    <TableCell className="font-mono text-xs py-2 text-left w-[16.66%] px-2">
                      <div className="break-words">{doc.uyapRef}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 py-2 text-left w-[16.66%] px-2">
                      <div className="break-words" title={doc.notes || "-"}>
                        {doc.notes || "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {sentDocuments.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Henüz evrak gönderilmemiş</p>
            <p className="text-xs">Yukarıdaki formu kullanarak evrak gönderebilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  )
}
