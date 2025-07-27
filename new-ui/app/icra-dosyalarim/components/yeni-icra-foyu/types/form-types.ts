export interface FormData {
  // Page 1 - Türleri Seçme
  takipTuru: string
  takipYolu: string

  // Page 2 - Alacaklı Bilgisi
  alacakliTipi: string
  alacakliAdSoyad: string
  alacakliTcKimlik: string
  alacakliSirketUnvani: string
  alacakliVergiNumarasi: string
  alacakliTelefon: string
  alacakliAdres: string

  // Page 3 - Borçlu Bilgileri
  borcluTipi: string
  borcluAdSoyad: string
  borcluTcKimlik: string
  borcluSirketUnvani: string
  borcluVergiNumarasi: string
  borcluTelefon: string
  borcluAdres: string

  // Page 4 - Türlere Göre Seçim (dynamic fields)
  dynamicFields: Record<string, any>
}

export const TAKIP_YOLU_OPTIONS = {
  ILAMSIZ: [
    { value: "7_ornek", label: "7 Örnek (İLAMSIZ TAKIP)" },
    { value: "8_ornek", label: "8 Örnek (Menkul rehnin paraya çevrilmesi)" },
    { value: "9_ornek", label: "9 Örnek (İpoteğin Paraya çevrilmesi)" },
    { value: "10_ornek", label: "10 Örnek (Kambiyo Yoluyla Haciz Takibi)" },
    { value: "11_ornek", label: "11 Örnek (İflas Yoluyla Adi Takip)" },
    { value: "12_ornek", label: "12 Örnek (Kambiyo Yoluyla İflas Takibi)" },
    { value: "13_ornek", label: "13 Örnek (Adi Kira ve Hasilat Kiralarına Ait Takip)" },
    { value: "14_ornek", label: "14 Örnek (Tahliye Emri)" },
  ],
  ILAMLI: [
    { value: "2_5_ornek", label: "2-5 Örnek (Menkul Teslimi)" },
    { value: "4_5_ornek", label: "4-5 Örnek (Genel Alacak Teminat)" },
    { value: "6_ornek", label: "6 Örnek (İpoteğin Paraya Çevrilmesi)" },
  ],
}

export const FAIZ_TIPI_OPTIONS = [
  { value: "gunluk", label: "Günlük" },
  { value: "aylik", label: "Aylık" },
  { value: "yillik_365", label: "Yıllık 365" },
  { value: "yillik_360", label: "Yıllık 360" },
  { value: "360_gun_hesabi", label: "360 Gün Hesabı" },
]

export const BELGE_BILGILERI_OPTIONS = [
  { value: "bono", label: "Bono" },
  { value: "cek", label: "Çek" },
  { value: "police", label: "Poliçe" },
]

export const ALACAK_TURU_OPTIONS = [
  { value: "kira", label: "Kira" },
  { value: "kira_farki", label: "Kira Farkı" },
  { value: "diger", label: "Diğer" },
]
