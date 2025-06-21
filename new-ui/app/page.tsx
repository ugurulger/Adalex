import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Scale } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Hukuk Takip Sistemi</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Anasayfa</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dava ve icra dosyalarınızı kolayca yönetin ve takip edin
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Dava Dosyalarım */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Scale className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dava Dosyalarım</h2>
              <p className="text-gray-600 mb-6">Mahkeme davalarınızı görüntüleyin ve yönetin</p>
              <Link href="/dava-dosyalarim">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg">
                  Dava Dosyalarına Git
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* İcra Dosyalarım */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <FileText className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İcra Dosyalarım</h2>
              <p className="text-gray-600 mb-6">İcra takip dosyalarınızı görüntüleyin ve yönetin</p>
              <Link href="/icra-dosyalarim">
                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg">
                  İcra Dosyalarına Git
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Sistem Özellikleri</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kolay Dosya Yönetimi</h3>
              <p className="text-gray-600">Tüm dosyalarınızı tek yerden yönetin</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hızlı Arama</h3>
              <p className="text-gray-600">Gelişmiş arama özellikleri ile hızlı erişim</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenli Saklama</h3>
              <p className="text-gray-600">Verileriniz güvenli şekilde saklanır</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
