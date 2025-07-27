// API Response Types for İcra Dosyalarım

export interface IcraDosyasiListItem {
  file_id: number
  klasor: string
  dosyaNo: string
  borcluAdi: string
  alacakliAdi: string
  foyTuru: string
  durum: string
  takipTarihi: string
  icraMudurlugu: string
}

export interface BorcluBilgisi {
  borclu_id: number | string
  file_id: number
  ad: string
  tcKimlik: string
  telefon: string
  adres: string
  vekil: string
}

export interface IcraDosyasiDetay {
  file_id: number
  klasor: string
  dosyaNo: string
  borcluAdi: string
  alacakliAdi: string
  foyTuru: string
  durum: string
  takipTarihi: string
  icraMudurlugu: string
  takipSekli: string
  alacakliVekili: string
  borcMiktari: string
  faizOrani: string
  guncelBorc: string
  borcluList: BorcluBilgisi[]
}

// Modal Query Response Types
export interface AdresSorgulamaResponse {
  file_id: number
  borclu_id: number
  kisiselBilgiler: Record<string, string>
  adresBilgileri: Record<string, string>
  timestamp: string
}

export interface AracSorgulamaResponse {
  file_id: number
  borclu_id: number
  aracSorguSonucu: {
    Sonuc: string
    Araclar: Array<{
      No: string
      Plaka: string
      Marka: string
      Model: string
      Tipi: string
      Renk: string
      Cins: string
      Mahrumiyet: Array<{
        "Takyidat Sirasi": string
        "Ekleyen Birim": string
        "Ekleme Tarihi": string
        "Serh Turu": string
        "Kurum Adi": string
      }>
    }>
  }
  timestamp: string
}

export interface GayrimenkulSorgulamaResponse {
  file_id: number
  borclu_id: number
  gayrimenkulSorguSonucu: {
    sonuc: string
    tasinmazlar: Array<{
      no: string
      tapu_mudurlugu: string
      il_ilce: string
      mahalle: string
      vasfi: string
      yuzolcumu: string
      mevki: string
      ada_no: string
      parcel_no: string
      bagimsiz_bolum: string
      hisse_bilgisi: Array<{
        no: string
        aciklama: string
        hisse_tipi: string
        durum: string
        takdiyat_bilgisi: Array<{
          no: string
          tipi: string
          aciklama: string
        }>
      }>
    }>
  }
  timestamp: string
}

export interface BankaSorgulamaResponse {
  file_id: number
  borclu_id: number
  bankaSorguSonucu: {
    sonuc: string
    bankalar: Array<{
      no: string
      kurum: string
    }>
  }
  timestamp: string
}

export interface AlacakliDosyalariResponse {
  file_id: number
  borclu_id: number
  alacakliDosyalariSonucu: {
    sonuc: string
    icra_dosyalari: Array<{
      No: string
      "Birim Adi/Dosya": string
      "Takip Türü": string
      "Takip Yolu/Şekli": string
      Durumu: string
      Açılış: string
      Kapanış: string
    }>
  }
  timestamp: string
}

export interface TelefonSorgulamaResponse {
  file_id: number
  borclu_id: number
  gsmSorguSonucu: {
    sonuc: string
    "GSM Adres": Array<{
      Operatör: string
      adres: string
    }>
  }
  timestamp: string
}

export interface SgkHacizSorgulamaResponse {
  file_id: number
  borclu_id: number
  sgkSorguSonucu: {
    sonuc: string
    "SGK kayit": Array<{
      no: string
      kurum: string
      islem: string
    }>
  }
  timestamp: string
}

export interface GibSorgulamaResponse {
  file_id: number
  borclu_id: number
  gibSorguSonucu: {
    sonuc: string
    "GİB Adres": string
  }
  timestamp: string
}

export interface IskiSorgulamaResponse {
  file_id: number
  borclu_id: number
  iskiSorguSonucu: {
    sonuc: string
    İSKİ: string
  }
  timestamp: string
}

export interface PostaCekiSorgulamaResponse {
  file_id: number
  borclu_id: number
  postaCekiSorguSonucu: {
    sonuc: string
    "Posta Çeki": string
  }
  timestamp: string
}

export interface DisIsleriSorgulamaResponse {
  file_id: number
  borclu_id: number
  disIsleriSorguSonucu: {
    sonuc: string
    "Dış İşleri": string
  }
  timestamp: string
}

export interface SgkSorgulamaResponse {
  file_id: number
  borclu_id: number
  sskCalisani: Record<string, string>
  bagkurCalisani: Record<string, string>
  sskIsYeriBilgisi: Array<{
    type: string
    title: string
    data: Record<string, string>
  }>
  timestamp: string
}
