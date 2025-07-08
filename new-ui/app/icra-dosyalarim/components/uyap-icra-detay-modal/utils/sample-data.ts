// Centralized sample data for all UYAP query modals and main page
// When connecting to real API, only modify this file

// Main Page Execution Files Data (İcra Dosyalarım Page)
export const icraDosyalariSampleData = [
  {
    file_id: 1,
    klasor: "1",
    no: "001",
    borcluAdi: "Ahmet Yılmaz",
    alacakliAdi: "ABC Şirketi Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    durum: "Açık",
    takipTarihi: "15.01.2024",
    icraMudurlugu: "İstanbul 1. İcra Müdürlüğü",
    
    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Fatma Demir",
    borcMiktari: "125.000,00 TL",
    faizOrani: "10%",
    guncelBorc: "127.500,00 TL",
    borcluList: [
      {
        borclu_id: "1_1",
        file_id: "1",
        ad: "Ahmet Yılmaz",
        tcKimlik: "12345678901",
        telefon: "0532 123 45 67",
        adres: "Moda Mahallesi, Bahariye Caddesi No: 45/7",
        vekil: "Av. Mehmet Özkan",
      },
    ],
  },
  {
    file_id: 2,
    klasor: "2",
    no: "002",
    borcluAdi: "Ayşe Demir, Mehmet Demir",
    alacakliAdi: "XYZ Holding A.Ş.",
    foyTuru: "İlamlı İcra",
    durum: "Derdest",
    takipTarihi: "10.01.2024",
    icraMudurlugu: "Ankara 2. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Ali Kaya",
    borcMiktari: "75.500,00 TL",
    faizOrani: "10%",
    guncelBorc: "78.200,00 TL",
    borcluList: [
      {
        borclu_id: "2_1",
        file_id: "2",
        ad: "Ayşe Demir",
        tcKimlik: "98765432109",
        telefon: "0533 987 65 43",
        adres: "Kızılay Mahallesi, Atatürk Bulvarı No: 123/5",
        vekil: "Av. Zeynep Öz",
      },
      {
        borclu_id: "2_2",
        file_id: "2",
        ad: "Mehmet Demir",
        tcKimlik: "11223344556",
        telefon: "0534 111 22 33",
        adres: "Kızılay Mahallesi, Atatürk Bulvarı No: 123/5",
        vekil: "Av. Zeynep Öz",
      },
    ],
  },
  {
    file_id: 3,
    klasor: "3",
    no: "003",
    borcluAdi: "Hasan Çelik, Fatma Çelik, Oğuz Çelik",
    alacakliAdi: "Emlak Yatırım A.Ş.",
    foyTuru: "Tahliye Takibi",
    durum: "İtiraz",
    takipTarihi: "05.01.2024",
    icraMudurlugu: "İzmir 3. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Fatma Demir",
    borcMiktari: "25.000,00 TL",
    faizOrani: "10%",
    guncelBorc: "26.750,00 TL",
    borcluList: [
      {
        borclu_id: "3_1",
        file_id: "3",
        ad: "Hasan Çelik",
        tcKimlik: "11223344556",
        telefon: "0534 111 22 33",
        adres: "Alsancak Mahallesi, Cumhuriyet Bulvarı No: 67/2",
        vekil: "-",
      },
      {
        borclu_id: "3_2",
        file_id: "3",
        ad: "Fatma Çelik",
        tcKimlik: "55667788990",
        telefon: "0535 555 66 77",
        adres: "Alsancak Mahallesi, Cumhuriyet Bulvarı No: 67/2",
        vekil: "Av. Murat Kaya",
      },
      {
        borclu_id: "3_3",
        file_id: "3",
        ad: "Oğuz Çelik",
        tcKimlik: "33445566778",
        telefon: "0536 333 44 55",
        adres: "Bornova Mahallesi, İzmir Caddesi No: 89/3",
        vekil: "-",
      },
    ],
  },
  {
    file_id: 4,
    klasor: "4",
    no: "004",
    borcluAdi: "Fatma Kara",
    alacakliAdi: "Teknoloji Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    durum: "Sonuçlandı",
    takipTarihi: "20.12.2023",
    icraMudurlugu: "Bursa 1. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Mehmet Ak",
    borcMiktari: "45.250,25 TL",
    faizOrani: "10%",
    guncelBorc: "0,00 TL",
    borcluList: [
      {
        borclu_id: "4_1",
        file_id: "4",
        ad: "Fatma Kara",
        tcKimlik: "55667788990",
        telefon: "0535 555 66 77",
        adres: "Görükle Mahallesi, Uludağ Üniversitesi Caddesi No: 89/12",
        vekil: "-",
      },
    ],
  },
  {
    file_id: 5,
    klasor: "5",
    no: "005",
    borcluAdi: "Mehmet Özkan, Zeynep Özkan",
    alacakliAdi: "Finans Bankası A.Ş.",
    foyTuru: "İlamlı İcra",
    durum: "Açık",
    takipTarihi: "22.01.2024",
    icraMudurlugu: "Antalya 1. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Selin Acar",
    borcMiktari: "180.000,00 TL",
    faizOrani: "10%",
    guncelBorc: "185.400,00 TL",
    borcluList: [
      {
        borclu_id: "5_1",
        file_id: "5",
        ad: "Mehmet Özkan",
        tcKimlik: "33445566778",
        telefon: "0536 333 44 55",
        adres: "Lara Mahallesi, Güzeloba Caddesi No: 156/8",
        vekil: "Av. Kemal Yurt",
      },
      {
        borclu_id: "5_2",
        file_id: "5",
        ad: "Zeynep Özkan",
        tcKimlik: "77889900112",
        telefon: "0537 777 88 99",
        adres: "Lara Mahallesi, Güzeloba Caddesi No: 156/8",
        vekil: "Av. Kemal Yurt",
      },
    ],
  },
  {
    file_id: 6,
    klasor: "6",
    no: "006",
    borcluAdi: "Zeynep Şahin",
    alacakliAdi: "İnşaat Müteahhitlik Ltd.",
    foyTuru: "İlamsız İcra",
    durum: "Derdest",
    takipTarihi: "28.01.2024",
    icraMudurlugu: "Adana 2. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Okan Demir",
    borcMiktari: "95.750,00 TL",
    faizOrani: "10%",
    guncelBorc: "98.200,00 TL",
    borcluList: [
      {
        borclu_id: "6_1",
        file_id: "6",
        ad: "Zeynep Şahin",
        tcKimlik: "77889900112",
        telefon: "0537 777 88 99",
        adres: "Reşatbey Mahallesi, İnönü Caddesi No: 234/15",
        vekil: "-",
      },
    ],
  },
  {
    file_id: 7,
    klasor: "7",
    no: "007",
    borcluAdi: "Can Yıldız",
    alacakliAdi: "Otomotiv Ticaret A.Ş.",
    foyTuru: "Rehinli Alacak Takibi",
    durum: "İtiraz",
    takipTarihi: "15.11.2023",
    icraMudurlugu: "Konya 1. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Cem Özgür",
    borcMiktari: "220.000,00 TL",
    faizOrani: "10%",
    guncelBorc: "225.800,00 TL",
    borcluList: [
      {
        borclu_id: "7_1",
        file_id: "7",
        ad: "Can Yıldız",
        tcKimlik: "44556677889",
        telefon: "0538 444 55 66",
        adres: "Yazır Mahallesi, Ankara Caddesi No: 78/3",
        vekil: "Av. Deniz Kaya",
      },
    ],
  },
  {
    file_id: 8,
    klasor: "8",
    no: "008",
    borcluAdi: "Elif Arslan",
    alacakliAdi: "Tekstil İhracat Ltd. Şti.",
    foyTuru: "İlamsız İcra",
    durum: "Açık",
    takipTarihi: "02.02.2024",
    icraMudurlugu: "Gaziantep 1. İcra Müdürlüğü",

    // it will be on detail page (dosya-detayi-tab.tsx)
    takipSekli: "ÖRNEK: 7 İlamsız Takiplerde Ödeme Emri - Eski No: 49",
    alacakliVekili: "Av. Murat Çelik",
    borcMiktari: "65.400,00 TL",
    faizOrani: "10%",
    guncelBorc: "67.100,00 TL",
    borcluList: [
      {
        borclu_id: "8_1",
        file_id: "8",
        ad: "Elif Arslan",
        tcKimlik: "66778899001",
        telefon: "0539 666 77 88",
        adres: "İstasyon Mahallesi, Atatürk Bulvarı No: 345/7",
        vekil: "-",
      },
    ],
  },
]

// Personal Information Data (Adres Sorgulama Modal)
export const kisiselBilgilerData = {
  "T.C Kimlik No": "23334223423",
  Cinsiyeti: "E",
  Adı: "TACETTİN",
  Soyadı: "AYDOĞDU",
  "Baba Adı": "MURAT",
  "Ana Adı": "MUNADİYE",
  "Doğum Yeri": "KIZILKAVRAZ",
  "Doğum Tarihi": "23/05/1959",
  "Nüf. Kay. İl": "",
  "Nüf. Kay. İlçe": "",
  "Mah/Köy": "",
  "Ver. Nedeni": "",
  "Ver. Tarih": "",
  "Ver. İl": "Bilinmiyor",
  "Ver. İlçe": "",
  "Cüzdan Seri": "A49C07005",
  "Cüzdan No": "",
  "Cilt No": "",
  "Aile Sıra No": "",
  "Sıra No": "",
  Dini: "",
  "Önceki Soyadı": "",
  "Ölüm Tarihi": "",
}

// Address Information Data (Adres Sorgulama Modal)
export const adresBilgileriData = {
  "Adres Tipi": "IlIlceMerkeziAdresi",
  "Beyan Tarihi": "5/2/2007",
  "Taşınma Tarihi": "0/0/0",
  "Tescil Tarihi": "0/0/0",
  Mahalle: "GÜLYURTT MAH.",
  "Cadde/Sokak": "ABDULVAHAB GAZİ CAD.",
  "Dış Kapı No": "68/1",
  "İç Kapı No": "4",
  İl: "SİVAS",
  İlçe: "MERKEZ",
}

// Vehicle Query Results (Araç Sorgulama Modal)
export const aracSorguSonucuData = {
  Sonuc: "bulundu",
  Araclar: [
    {
      No: "1",
      Plaka: "45***21",
      Marka: "PEUGEOT",
      Model: "1996",
      Tipi: "103",
      Renk: "MAVİ",
      Cins: "MOTORLU BİSİKLET",
      Mahrumiyet: [
        {
          "Takyidat Sirasi": "1",
          "Ekleyen Birim": "Salihli İcra Dairesi (2019-1251 İcra)",
          "Ekleme Tarihi": "29.03.2019",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "2",
          "Ekleyen Birim": "İzmir 6. İcra Dairesi (2021-10805 İcra)",
          "Ekleme Tarihi": "18.11.2021",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "3",
          "Ekleyen Birim": "İstanbul Anadolu Abonelik Sözleşmeleri İcra Dairesi (2021-230456 İcra)",
          "Ekleme Tarihi": "26.11.2021",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "4",
          "Ekleyen Birim": "İzmir 11. İcra Dairesi (2021-13884 İcra)",
          "Ekleme Tarihi": "27.01.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "5",
          "Ekleyen Birim": "İzmir 26. İcra Dairesi (2021-15283 İcra)",
          "Ekleme Tarihi": "01.02.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "6",
          "Ekleyen Birim": "İzmir 28. İcra Dairesi (2022-729 İcra)",
          "Ekleme Tarihi": "11.04.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "7",
          "Ekleyen Birim": "İzmir 26. İcra Dairesi (2022-2178 İcra)",
          "Ekleme Tarihi": "12.04.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "8",
          "Ekleyen Birim": "Manisa İcra Dairesi (2023-25758 İcra)",
          "Ekleme Tarihi": "14.04.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "9",
          "Ekleyen Birim": "İzmir 11. İcra Dairesi (2021-13884 İcra)",
          "Ekleme Tarihi": "18.05.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
      ],
    },
    {
      No: "2",
      Plaka: "45***85",
      Marka: "HAOJİN",
      Model: "2005",
      Tipi: "110 CC",
      Renk: "KIRMIZI GRİ",
      Cins: "MOTOSİKLET",
      Mahrumiyet: [
        {
          "Takyidat Sirasi": "1",
          "Ekleyen Birim": "Salihli İcra Dairesi (2019-1251 İcra)",
          "Ekleme Tarihi": "29.03.2019",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "2",
          "Ekleyen Birim": "İzmir 6. İcra Dairesi (2021-10805 İcra)",
          "Ekleme Tarihi": "18.11.2021",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "3",
          "Ekleyen Birim": "İstanbul Anadolu Abonelik Sözleşmeleri İcra Dairesi (2021-230456 İcra)",
          "Ekleme Tarihi": "26.11.2021",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "4",
          "Ekleyen Birim": "İzmir 11. İcra Dairesi (2021-13884 İcra)",
          "Ekleme Tarihi": "27.01.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "5",
          "Ekleyen Birim": "İzmir 26. İcra Dairesi (2021-15283 İcra)",
          "Ekleme Tarihi": "01.02.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
        {
          "Takyidat Sirasi": "6",
          "Ekleyen Birim": "Manisa İcra Dairesi (2023-56451 İcra)",
          "Ekleme Tarihi": "25.02.2022",
          "Serh Turu": "HACİZLİ(H)",
          "Kurum Adi": "Adalet Bakanlığı",
        },
      ],
    },
  ],
}

// Real Estate Query Results (Gayrimenkul Sorgulama Modal)
export const gayrimenkulSorguSonucuData = {
  sonuc: "Kişiye ait taşınmaz kaydı var.",
  tasinmazlar: [
    {
      no: "1",
      tapu_mudurlugu: "Bismil",
      il_ilce: "DİYARBAKIR/BİSMİL",
      mahalle: "AĞILLI K",
      vasfi: "SUSUZ TARLA",
      yuzolcumu: "2679204.42000",
      mevki: "",
      ada_no: "262",
      parcel_no: "1",
      bagimsiz_bolum: "",
      hisse_bilgisi: [
        {
          no: "1",
          aciklama: "(SN:190557842) HASİNE CAN : ARAP Kızı KN:47098655262",
          hisse_tipi: "Istirak",
          durum: "Aktif",
          takdiyat_bilgisi: [
            {
              no: "1",
              tipi: "Beyan",
              aciklama: "3083 SAYILI YASANIN 13.MADDESİ GEREĞİNCE TARIM REFORMU ŞERHİ",
            },
            {
              no: "2",
              tipi: "Beyan",
              aciklama:
                "Diğer (Konusu: Bismil Kadastro Mahkemesinin 1958/18 E. ve 1993/14 K. Sayılı kesinleşmiş kararında paftasında Eski 40 nolu(Yeni 262 ada 1 parsel) parselin güneyindeA harfi ile gösterilen alan yenileme çalışmalırı sırasında HUKUKA AYKIRI şekilde dahil edilmiştir Düzeltme yapılacaktır. ) Tarih: 03/05/2018 Sayı: E.1252833",
            },
          ],
        },
        {
          no: "2",
          aciklama: "(SN:190557842) xxasd : ARAP Kızsadı KN:47098655262",
          hisse_tipi: "Istirak",
          durum: "Aktif",
          takdiyat_bilgisi: [
            {
              no: "1",
              tipi: "Beyan",
              aciklama: "3083 SAYILI YASANIN 13.MADDESİ GEREĞİNCE TARIM REFORMU ŞERHİ",
            },
            {
              no: "2",
              tipi: "Beyan",
              aciklama:
                "Diğer (Konusu: Bismil Kadastro Mahkemesinin 1958/18 E. ve 1993/14 K. Sayılı kesinleşmiş kararında paftasında Eski 40 nolu(Yeni 262 ada 1 parsel) parselin güneyindeA harfi ile gösterilen alan yenileme çalışmalırı sırasında HUKUKA AYKIRI şekilde dahil edilmiştir Düzeltme yapılacaktır. ) Tarih: 03/05/2018 Sayı: E.1252833",
            },
          ],
        },
      ],
    },
    {
      no: "2",
      tapu_mudurlugu: "Bismil",
      il_ilce: "DİYARBAKIR/BİSMİL",
      mahalle: "AKPINAR M",
      vasfi: "Kargir 2 Katlı Ev Ve Avlusu",
      yuzolcumu: "382.54000",
      mevki: "",
      ada_no: "209",
      parcel_no: "2",
      bagimsiz_bolum: "",
      hisse_bilgisi: [
        {
          no: "1",
          aciklama: "(SN:190557842) HASİNE CAN : ARAP Kızı KN:47098655262",
          hisse_tipi: "Istirak",
          durum: "Aktif",
          takdiyat_bilgisi: [
            {
              no: "1",
              tipi: "Beyan",
              aciklama: "3083 SAYILI YASANIN 13.MADDESİ GEREĞİNCE TARIM REFORMU ŞERHİ",
            },
            {
              no: "2",
              tipi: "Beyan",
              aciklama:
                "Diğer (Konusu: Bismil Kadastro Mahkemesinin 1958/18 E. ve 1993/14 K. Sayılı kesinleşmiş kararında paftasında Eski 40 nolu(Yeni 262 ada 1 parsel) parselin güneyindeA harfi ile gösterilen alan yenileme çalışmalırı sırasında HUKUKA AYKIRI şekilde dahil edilmiştir Düzeltme yapılacaktır. ) Tarih: 03/05/2018 Sayı: E.1252833",
            },
          ],
        },
      ],
    },
  ],
}

// Bank Query Results (Banka Sorgulama Modal)
export const bankaSorguSonucuData = {
  sonuc: "Kişiye ait banka hesap kaydı var.",
  bankalar: [
    {
      no: "1",
      kurum: "TÜRKİYE HALK BANKASI A.Ş.",
    },
    {
      no: "2",
      kurum: "TÜRKİYE VAKIFLAR BANKASI T.A.O.",
    },
    {
      no: "3",
      kurum: "TÜRK EKONOMİ BANKASI A.Ş.",
    },
    {
      no: "4",
      kurum: "AKBANK T.A.Ş.",
    },
    {
      no: "5",
      kurum: "TÜRKİYE GARANTİ BANKASI A.Ş.",
    },
    {
      no: "6",
      kurum: "TÜRKİYE İŞ BANKASI A.Ş.",
    },
    {
      no: "7",
      kurum: "YAPI VE KREDİ BANKASI A.Ş.",
    },
    {
      no: "8",
      kurum: "QNB BANK A.Ş.",
    },
    {
      no: "9",
      kurum: "DENİZBANK A.Ş.",
    },
  ],
}

// Creditor Files Query Results (Alacaklı Dosyaları Modal)
export const alacakliDosyalariSonucuData = {
  sonuc: "Kişiye ait alacaklı olduğu İcra Dosyası kaydı var.",
  icra_dosyalari: [
    {
      No: "1",
      "Birim Adi/Dosya": "İzmir 14. İcra Dairesi 2024/6152 İcra Dosyası",
      "Takip Türü": "İLAMLI",
      "Takip Yolu/Şekli":
        "İlamların İcrası, Para ve Teminat Verilmesi Hakkındaki İlamların İcrası ( ÖRNEK: Eski No: 53 - Yeni No: 4-5 ) Para Borcuna Veya Teminat Verilmesine Veya Bir İşin Yapılması Veya Yapılmamasına , İrtifak Hakkının Kaldırılmasına Veya Yükletilmesine Dair İcra Emri",
      Durumu: "Açık",
      Açılış: "02.07.2024\n21:21",
      Kapanış: "",
    },
    {
      No: "2",
      "Birim Adi/Dosya": "İzmir 22. İcra Dairesi 2019/70 İcra Dosyası",
      "Takip Türü": "İLAMLI",
      "Takip Yolu/Şekli":
        "İlamların İcrası, Para ve Teminat Verilmesi Hakkındaki İlamların İcrası ( ÖRNEK: Eski No: 53 - Yeni No: 4-5 ) Para Borcuna Veya Teminat Verilmesine Veya Bir İşin Yapılması Veya Yapılmamasına , İrtifak Hakkının Kaldırılmasına Veya Yükletilmesine Dair İcra Emri",
      Durumu: "Açık",
      Açılış: "04.01.2019\n15:16",
      Kapanış: "",
    },
  ],
}

// GSM Query Results (Telefon Sorgulama Modal)
export const gsmSorguSonucuData = {
  sonuc: "Kişiye ait GSM operatörlerinde kaydı var.",
  "GSM Adres": [
    {
      Operatör: "Turkcell",
      adres: "VATAN MH. POLAT CD. NO:30 D:4 YEŞİLYURT \\KARABAĞLAR, İZMİR",
    },
    {
      Operatör: "Türk Telekom",
      adres: "9076 SK. NO:12 YEŞİLYURT KONAK",
    },
    {
      Operatör: "Turkcell",
      adres: "HACET MH. BERK SK. NO:5 \\ALANYA, ANTALYA",
    },
    {
      Operatör: "Turkcell",
      adres: "BOZYAKA MH. 3031 SK. NO:65 D:5 \\KARABAĞLAR, İZMİR",
    },
    {
      Operatör: "Turkcell",
      adres: "BOZYAKA MH. 3056 SK. NO:43 D:3 \\KARABAĞLAR, İZMİR",
    },
    {
      Operatör: "Türk Telekom",
      adres: "KARABAĞLAR-KARABAĞLAR",
    },
    {
      Operatör: "Vodafone",
      adres: "VATAN MAH. POLAT CADDESİ 9061. SOK. KARABAĞLAR, İZMİR",
    },
    {
      Operatör: "Vodafone",
      adres: "9076 SOK. NO:12 İZMİR TÜRKİYE , İZMİR",
    },
    {
      Operatör: "Turkcell",
      adres: "NO:6 DEREBAŞI KÖYÜ \\KİRAZ, İZMİR",
    },
    {
      Operatör: "Türk Telekom",
      adres: "KARABAĞLAR-KARABAĞLAR",
    },
    {
      Operatör: "Türk Telekom",
      adres: "KÜBRA SOK 66 34000 - . AVCILAR",
    },
    {
      Operatör: "Vodafone",
      adres: "VATAN MAH. POLAT CADDESİ 9061. SOK. KARABAĞLAR, İZMİR",
    },
  ],
}

// SGK Haciz Query Results (SGK Haciz Sorgulama Modal)
export const sgkSorguSonucuData = {
  sonuc: "SGK kaydı var.",
  "SGK kayit": [
    {
      no: "1",
      kurum: "GSS Sigortalısı (Gerçek)",
      islem: "",
    },
    {
      no: "2",
      kurum: "Diğer - Gerçek",
      islem: "",
    },
  ],
}

// GİB Query Results (GİB Sorgulama Modal)
export const gibSorguSonucuData = {
  sonuc: "Kişiye ait GİB kayıtlarına göre adres kaydı var.",
  "GİB Adres": "ADRES: GAZİLER MAH. 604. SK. KAPI NO:6 DAİRE NO: 1 - SALİHLİ",
}

// İSKİ Query Results (İSKİ Sorgulama Modal)
export const iskiSorguSonucuData = {
  sonuc: "Bu işlem 120 dakikada 1 defa yapılabilmektedir.",
  İSKİ: "Adres Adres Adres - TBD",
}

// Postal Check Query Results (Posta Çeki Sorgulama Modal)
export const postaCekiSorguSonucuData = {
  sonuc: "Kişiye ait posta çeki kaydı var.",
  "Posta Çeki": "Adres Adres Adres - TBD",
}

// Foreign Affairs Query Results (Dış İşleri Sorgulama Modal)
export const disIsleriSorguSonucuData = {
  sonuc: "Kişiye ait dış işleri kaydı var.",
  "Dış İşleri": "Adres Adres Adres - TBD",
}

// SSK Employee Data (SGK Sorgulama Modal)
export const sskCalisaniData = {
  "İş Yeri Ünvanı": "UKASİS UZM AN KAYNAK SİSTEMLERİ SANAYİ VE TİCARET ANONİM ŞİRK",
  "İş Yeri Adresi": "MEHMET AKİF ERSOY MAH. 502 SK. 25 1 İZMİR KEMALPAŞA",
  "İş Yeri İl": "",
  "İş Yeri Sicil": "2-2553-01-01-1784935-035-10-79-000",
  "İlgili İş Yerindeki Kaydının Sonlanma Dönemi": "2025/3",
  Durum: "Aktif",
  "Sicil No": "3501200745212",
  "İlk İşe Giriş Tarihi": "2007-05-30",
  "Son İşe Giriş Tarihi": "",
  "Son İşten Çıkış Tarihi": "",
  "Mernis No TC Kimlik No": "",
  "Vergi No": "8871183609",
  "Alt İş Yeri Ünvanı": "UKASİS UZMAN KAYNAK SİSTEMLERİ SANAYİ VE TİCARET ANONİM ŞİRKETİ",
}

// Bağkur Employee Data (SGK Sorgulama Modal)
export const bagkurCalisaniData = {
  "Bağkur No": "6753618818",
  "Tescil Tarihi": "30.12.2023",
  "Meslek İlçe": "27",
  "Meslek İli": "35",
  "Terk Tarihi": "15.01.2024",
  "Terk Açıklama": "#01-İşi Bırakma",
}

// SSK Workplace Information Data (SGK Sorgulama Modal)
export const sskIsYeriBilgisiData = [
  {
    type: "workplace",
    title: "İŞ YERİ BİLGİLERİ #1",
    data: {
      "Eski Şube Kodu": "01",
      İl: "35",
      "İşyeri Açıklama": "",
      "İşyeri Adres": "",
      "İşyeri merkez Adresi": "",
      "İşyeri Sicil": "",
      "İşyeri Ünvanı": "CELAL ÇETİN",
      "Referans No": "",
      "Tescil Tip": "",
      "Yeni Şube Kodu": "01",
      "Sıra No": "1289008",
      Adres: "K.PAŞA TAHİR TUNCA CD. NO:57 İZMİR",
      Mahiyet: "OTOBÜS İŞL.",
    },
  },
  {
    type: "manager",
    title: "YÖNETİCİ BİLGİLERİ #1",
    data: {
      "T.C. Kimlik No": "37339687916",
      Uyruk: "TC",
      Adı: "CELAL",
      Soyadı: "ÇETİN",
      "Baba Adı": "HÜSAMETTİN",
      "Ana Adı": "AYŞE",
      Cinsiyet: "E",
      "Doğum Tarihi": "16.03.1969",
      "Doğum Yeri": "KEMALPAŞA",
      "Eski Şube Kodu": "01",
      "Yeni Şube Kodu": "01",
      İl: "035",
      "Referans No": "",
      "Sıra No": "1289008",
      "Yönetici Kod": "İŞVEREN",
    },
  },
  {
    type: "workplace",
    title: "İŞ YERİ BİLGİLERİ #2",
    data: {
      "Eski Şube Kodu": "01",
      İl: "35",
      "İşyeri Açıklama": "",
      "İşyeri Adres": "",
      "İşyeri merkez Adresi": "",
      "İşyeri Sicil": "",
      "İşyeri Ünvanı": "CELAL ÇETİN",
      "Referans No": "",
      "Tescil Tip": "",
      "Yeni Şube Kodu": "01",
      "Sıra No": "1786741",
      Adres: "SOĞUKPINAR MAH. ÖRNEKKÖY YOLU İZMİR KEMALPAŞA",
      Mahiyet: "OTOBÜS İŞLT.",
    },
  },
  {
    type: "manager",
    title: "YÖNETİCİ BİLGİLERİ #2",
    data: {
      "T.C. Kimlik No": "37339687916",
      Uyruk: "TC",
      Adı: "CELAL",
      Soyadı: "ÇETİN",
      "Baba Adı": "HÜSAMETTİN",
      "Ana Adı": "AYŞE",
      Cinsiyet: "E",
      "Doğum Tarihi": "16.03.1969",
      "Doğum Yeri": "KEMALPAŞA",
      "Eski Şube Kodu": "01",
      "Yeni Şube Kodu": "01",
      İl: "035",
      "Referans No": "",
      "Sıra No": "1786741",
      "Yönetici Kod": "YÖNETİCİ TİPİ TANIMSIZ",
    },
  },
  {
    type: "manager",
    title: "YÖNETİCİ BİLGİLERİ #3",
    data: {
      "T.C. Kimlik No": "37339687916",
      Uyruk: "TC",
      Adı: "CELAL",
      Soyadı: "ÇETİN",
      "Baba Adı": "HÜSAMETTİN",
      "Ana Adı": "AYŞE",
      Cinsiyet: "E",
      "Doğum Tarihi": "16.03.1969",
      "Doğum Yeri": "KEMALPAŞA",
      "Eski Şube Kodu": "01",
      "Yeni Şube Kodu": "01",
      İl: "035",
      "Referans No": "",
      "Sıra No": "1786741",
      "Yönetici Kod": "İŞVEREN",
    },
  },
]
