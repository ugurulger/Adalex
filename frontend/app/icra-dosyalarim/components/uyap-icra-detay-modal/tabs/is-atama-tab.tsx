"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { getTaskStatusBadge } from "../utils/status-badges"

export default function IsAtamaTab() {
  // Task assignment states
  const [selectedUser, setSelectedUser] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDueDate, setTaskDueDate] = useState<Date>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error" | "info"; message: string } | null>(
    null,
  )

  // Sample assigned tasks data
  const [assignedTasks, setAssignedTasks] = useState([
    {
      id: 1,
      kullanici: "Av. Fatma Demir",
      gorev: "Borçlu adres sorgulaması yap",
      tarih: "30.01.2024",
      durum: "Devam Ediyor",
      atanmaTarihi: "25.01.2024 14:30",
    },
    {
      id: 2,
      kullanici: "Sekreter Ayşe",
      gorev: "Tebligat durumunu kontrol et",
      tarih: "28.01.2024",
      durum: "Tamamlandı",
      atanmaTarihi: "24.01.2024 09:15",
    },
    {
      id: 3,
      kullanici: "Av. Ali Kaya",
      gorev: "Haciz işlemlerini takip et ve gerekli evrakları hazırla",
      tarih: "02.02.2024",
      durum: "Devam Ediyor",
      atanmaTarihi: "29.01.2024 16:45",
    },
  ])

  const userOptions = ["Av. Fatma Demir", "Av. Ali Kaya", "Sekreter Ayşe", "Sekreter Mehmet", "Stajyer Zeynep"]

  const handleAssignTask = () => {
    if (!selectedUser || !taskDescription || !taskDueDate) {
      setUploadMessage({ type: "error", message: "Lütfen tüm görev alanlarını doldurun." })
      return
    }

    const newTask = {
      id: assignedTasks.length + 1,
      kullanici: selectedUser,
      gorev: taskDescription,
      tarih: format(taskDueDate, "dd.MM.yyyy", { locale: tr }),
      durum: "Devam Ediyor",
      atanmaTarihi: format(new Date(), "dd.MM.yyyy HH:mm", { locale: tr }),
    }

    setAssignedTasks([...assignedTasks, newTask])

    // Reset form
    setSelectedUser("")
    setTaskDescription("")
    setTaskDueDate(undefined)

    setUploadMessage({ type: "success", message: "Görev başarıyla atandı!" })
  }

  const isFormValid = selectedUser && taskDescription.trim() && taskDueDate

  return (
    <div className="space-y-4">
      {/* Vertical Layout - All blocks stacked */}

      {/* 1. Görev Ata - Top Block */}
      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          👥 Görev Ata
          <Badge className="ml-2 bg-indigo-100 text-indigo-800 text-xs">Yeni Atama</Badge>
        </h3>

        <div className="space-y-3">
          {/* First Row - User and Date (Same Height) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* User Selection */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Kullanıcı *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Kullanıcı seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((user) => (
                    <SelectItem key={user} value={user}>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span className="text-xs">{user}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection - Same height as dropdown */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Son Tarih *</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1 h-8 text-xs">
                    <Calendar className="mr-2 h-3 w-3" />
                    {taskDueDate ? format(taskDueDate, "dd.MM.yyyy", { locale: tr }) : "Son tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={taskDueDate}
                    onSelect={(date) => {
                      setTaskDueDate(date)
                      setIsDatePickerOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Second Row - Wide Task Description */}
          <div>
            <Label className="text-xs font-medium text-gray-600">Görev Açıklaması *</Label>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="mt-1 h-20 resize-none w-full text-xs"
              placeholder="Görev açıklaması..."
            />
          </div>

          {/* Third Row - Assign Button (underneath description, smaller, left-aligned) */}
          <div className="flex justify-start">
            <Button
              onClick={handleAssignTask}
              disabled={!isFormValid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 h-8 text-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ➕ Görev Ata
            </Button>
          </div>

          {/* Status Messages - Compact */}
          {uploadMessage && (
            <div
              className={`py-2 ${
                uploadMessage.type === "success"
                  ? "border-green-200 bg-green-50"
                  : uploadMessage.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`text-sm ${
                    uploadMessage.type === "success"
                      ? "text-green-800"
                      : uploadMessage.type === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                  }`}
                >
                  {uploadMessage.message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Atanan Görevler - Bottom Block (Responsive) */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          📋 Atanan Görevler
          <Badge className="ml-2 bg-gray-100 text-gray-800 text-xs">{assignedTasks.length} Görev</Badge>
        </h3>

        {/* Mobile Card View - Visible on small screens */}
        <div className="block lg:hidden">
          <div className="overflow-y-auto max-h-96 border rounded-lg">
            <div className="space-y-2 p-2">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 break-words">{task.gorev}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{task.kullanici}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Son: {task.tarih}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        {getTaskStatusBadge(task.durum)}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                      Atanma: {task.atanmaTarihi}
                    </div>
                  </div>
                </div>
              ))}

              {assignedTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Henüz görev atanmamış</p>
                  <p className="text-xs">Yukarıdaki formu kullanarak görev atayabilirsiniz</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View - Hidden on small screens */}
        <div className="hidden lg:block">
          <div className="overflow-y-auto max-h-96 border rounded-lg">
            <div className="space-y-2 p-2">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{task.gorev}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <User className="w-3 h-3" />
                        <span>{task.kullanici}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>Son: {task.tarih}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {getTaskStatusBadge(task.durum)}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Atanma: {task.atanmaTarihi}</div>
                </div>
              ))}

              {assignedTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Henüz görev atanmamış</p>
                  <p className="text-xs">Yukarıdaki formu kullanarak görev atayabilirsiniz</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Load More Button - Only show if there are many tasks */}
        {assignedTasks.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Daha Fazla Göster
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
