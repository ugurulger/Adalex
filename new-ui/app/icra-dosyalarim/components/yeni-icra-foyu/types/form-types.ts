export interface GenelBilgiler {
  takipTuru: string
  dosyaTipi: string
  takipTarihi?: Date
  mahiyetKodu: string
  aciklama: string
}

export interface AdresBilgisi {
  adresTuru: string
  il: string
  ilce: string
  adres: string
}

export interface AlacakliBilgileri {
  tcknVkn: string
  adSoyad: string
  adresBilgisi: AdresBilgisi
  telefon?: string
  cepTelefonu?: string
  email?: string
}

export interface BorcluBilgileri {
  id: number
  tcknVkn: string
  adSoyad: string
  adresBilgisi: AdresBilgisi
  rol: string
}

export interface AlacakKalemi {
  id: number
  kalemAdi: string
  tutar: string
  faizTipi: string
  faizBaslangicTarihi?: Date
  faizOrani: string
  aciklama: string
}

export interface IlamKalemi {
  id: number
  kalemAdi: string
  tutar: string
  aciklama: string
}

export interface IlamBilgileri {
  mahkemeAdi: string
  kararYili: string
  dosyaNo: string
  kararTarihi?: Date
  ilamKalemleri: IlamKalemi[]
}

export interface VekilBilgileri {
  tckn: string
  adSoyad: string
  baroNo: string
  adres: string
  buroAdi: string
}

export interface TalepAciklamasi {
  talepMetni: string
  icraYolu: string
  talepTipi: string
  aciklama48e9: string
}

export interface FormData {
  genelBilgiler: GenelBilgiler
  alacakliBilgileri: AlacakliBilgileri
  borcluBilgileri: BorcluBilgileri[]
  alacakKalemleri: AlacakKalemi[]
  ilamBilgileri: IlamBilgileri
  vekilBilgileri: VekilBilgileri
  talepAciklamasi: TalepAciklamasi
}

export interface FormErrors {
  genelBilgiler?: Partial<GenelBilgiler>
  alacakliBilgileri?: Partial<AlacakliBilgileri>
  borcluBilgileri?: Array<Partial<BorcluBilgileri>>
  alacakKalemleri?: Array<Partial<AlacakKalemi>>
  ilamBilgileri?: Partial<IlamBilgileri>
  vekilBilgileri?: Partial<VekilBilgileri>
  talepAciklamasi?: Partial<TalepAciklamasi>
}
