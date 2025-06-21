import { Badge } from "@/components/ui/badge"

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "Açık":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{status}</Badge>
    case "Derdest":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>
    case "İtiraz":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{status}</Badge>
    case "Sonuçlandı":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getStatusBadgeForDoc = (status: string) => {
  switch (status) {
    case "Gönderildi":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>
    case "Teslim Edildi":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{status}</Badge>
    case "İşlemde":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{status}</Badge>
    case "Reddedildi":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getTaskStatusBadge = (status: string) => {
  switch (status) {
    case "Tamamlandı":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">{status}</Badge>
    case "Devam Ediyor":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>
    case "Beklemede":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{status}</Badge>
    case "İptal Edildi":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
