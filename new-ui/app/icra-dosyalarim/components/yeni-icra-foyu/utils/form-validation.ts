import type { FormData, FormErrors } from "../types/form-types"

export const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {}

  // Genel Bilgiler Validation
  if (!data.genelBilgiler.takipTuru) {
    errors.genelBilgiler = { ...errors.genelBilgiler, takipTuru: "Takip türü seçilmelidir" }
  }
  if (!data.genelBilgiler.dosyaTipi) {
    errors.genelBilgiler = { ...errors.genelBilgiler, dosyaTipi: "Dosya tipi girilmelidir" }
  }
  if (!data.genelBilgiler.takipTarihi) {
    errors.genelBilgiler = { ...errors.genelBilgiler, takipTarihi: "Takip tarihi seçilmelidir" }
  }

  // Alacaklı Bilgileri Validation
  if (!data.alacakliBilgileri.tcknVkn) {
    errors.alacakliBilgileri = { ...errors.alacakliBilgileri, tcknVkn: "TCKN/VKN girilmelidir" }
  } else if (data.alacakliBilgileri.tcknVkn.length < 10) {
    errors.alacakliBilgileri = { ...errors.alacakliBilgileri, tcknVkn: "TCKN 11 haneli, VKN 10 haneli olmalıdır" }
  }
  if (!data.alacakliBilgileri.adSoyad) {
    errors.alacakliBilgileri = { ...errors.alacakliBilgileri, adSoyad: "Ad soyad/kurum adı girilmelidir" }
  }

  // Alacaklı Adres Validation
  if (!data.alacakliBilgileri.adresBilgisi.adresTuru) {
    errors.alacakliBilgileri = {
      ...errors.alacakliBilgileri,
      adresBilgisi: { ...errors.alacakliBilgileri?.adresBilgisi, adresTuru: "Adres türü seçilmelidir" },
    }
  }
  if (!data.alacakliBilgileri.adresBilgisi.il) {
    errors.alacakliBilgileri = {
      ...errors.alacakliBilgileri,
      adresBilgisi: { ...errors.alacakliBilgileri?.adresBilgisi, il: "İl seçilmelidir" },
    }
  }
  if (!data.alacakliBilgileri.adresBilgisi.ilce) {
    errors.alacakliBilgileri = {
      ...errors.alacakliBilgileri,
      adresBilgisi: { ...errors.alacakliBilgileri?.adresBilgisi, ilce: "İlçe seçilmelidir" },
    }
  }
  if (!data.alacakliBilgileri.adresBilgisi.adres) {
    errors.alacakliBilgileri = {
      ...errors.alacakliBilgileri,
      adresBilgisi: { ...errors.alacakliBilgileri?.adresBilgisi, adres: "Adres bilgisi girilmelidir" },
    }
  }

  // Borçlu Bilgileri Validation
  if (data.borcluBilgileri.length === 0) {
    errors.borcluBilgileri = [{ tcknVkn: "En az bir borçlu bilgisi girilmelidir" }]
  } else {
    errors.borcluBilgileri = data.borcluBilgileri.map((borclu) => {
      const borcluErrors: any = {}
      if (!borclu.tcknVkn) {
        borcluErrors.tcknVkn = "TCKN/VKN girilmelidir"
      } else if (borclu.tcknVkn.length < 10) {
        borcluErrors.tcknVkn = "TCKN 11 haneli, VKN 10 haneli olmalıdır"
      }
      if (!borclu.adSoyad) {
        borcluErrors.adSoyad = "Ad soyad/kurum adı girilmelidir"
      }

      // Borçlu Adres Validation
      if (!borclu.adresBilgisi.adresTuru) {
        borcluErrors.adresBilgisi = { ...borcluErrors.adresBilgisi, adresTuru: "Adres türü seçilmelidir" }
      }
      if (!borclu.adresBilgisi.il) {
        borcluErrors.adresBilgisi = { ...borcluErrors.adresBilgisi, il: "İl seçilmelidir" }
      }
      if (!borclu.adresBilgisi.ilce) {
        borcluErrors.adresBilgisi = { ...borcluErrors.adresBilgisi, ilce: "İlçe seçilmelidir" }
      }
      if (!borclu.adresBilgisi.adres) {
        borcluErrors.adresBilgisi = { ...borcluErrors.adresBilgisi, adres: "Adres bilgisi girilmelidir" }
      }

      return borcluErrors
    })
  }

  // Alacak Kalemleri Validation
  if (data.alacakKalemleri.length === 0) {
    errors.alacakKalemleri = [{ kalemAdi: "En az bir alacak kalemi girilmelidir" }]
  } else {
    errors.alacakKalemleri = data.alacakKalemleri.map((kalem) => {
      const kalemErrors: any = {}
      if (!kalem.kalemAdi) {
        kalemErrors.kalemAdi = "Kalem adı girilmelidir"
      }
      if (!kalem.tutar) {
        kalemErrors.tutar = "Tutar girilmelidir"
      }
      return kalemErrors
    })
  }

  // İlam Bilgileri Validation (İlamlı takip için)
  if (data.genelBilgiler.takipTuru === "2") {
    if (!data.ilamBilgileri.mahkemeAdi) {
      errors.ilamBilgileri = { ...errors.ilamBilgileri, mahkemeAdi: "Mahkeme adı girilmelidir" }
    }
    if (!data.ilamBilgileri.kararYili) {
      errors.ilamBilgileri = { ...errors.ilamBilgileri, kararYili: "Karar yılı girilmelidir" }
    }
    if (!data.ilamBilgileri.dosyaNo) {
      errors.ilamBilgileri = { ...errors.ilamBilgileri, dosyaNo: "Dosya numarası girilmelidir" }
    }
    if (!data.ilamBilgileri.kararTarihi) {
      errors.ilamBilgileri = { ...errors.ilamBilgileri, kararTarihi: "Karar tarihi seçilmelidir" }
    }
  }

  // Talep Açıklaması Validation
  if (!data.talepAciklamasi.talepMetni) {
    errors.talepAciklamasi = { ...errors.talepAciklamasi, talepMetni: "Talep metni girilmelidir" }
  }
  if (!data.talepAciklamasi.icraYolu) {
    errors.talepAciklamasi = { ...errors.talepAciklamasi, icraYolu: "İcra yolu seçilmelidir" }
  }
  if (!data.talepAciklamasi.talepTipi) {
    errors.talepAciklamasi = { ...errors.talepAciklamasi, talepTipi: "Talep tipi seçilmelidir" }
  }

  // Remove empty error objects
  Object.keys(errors).forEach((key) => {
    const errorSection = errors[key as keyof FormErrors]
    if (Array.isArray(errorSection)) {
      const filteredErrors = errorSection.filter((err) => Object.keys(err).length > 0)
      if (filteredErrors.length === 0) {
        delete errors[key as keyof FormErrors]
      } else {
        ;(errors as any)[key] = filteredErrors
      }
    } else if (typeof errorSection === "object" && Object.keys(errorSection).length === 0) {
      delete errors[key as keyof FormErrors]
    }
  })

  return errors
}
