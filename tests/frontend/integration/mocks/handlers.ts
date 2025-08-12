import { rest } from 'msw'

// Mock data for tests
const mockFiles = [
  {
    file_id: 1,
    klasor: '2024/1',
    dosyaNo: '2024/1',
    eYil: 2024,
    eNo: 1,
    borcluAdi: 'Ahmet Yılmaz',
    alacakliAdi: 'Mehmet Demir',
    foyTuru: 'İlamlı',
    durum: 'Açık',
    takipTarihi: '2024-01-15',
    icraMudurlugu: 'İstanbul'
  },
  {
    file_id: 2,
    klasor: '2024/2',
    dosyaNo: '2024/2',
    eYil: 2024,
    eNo: 2,
    borcluAdi: 'Fatma Kaya',
    alacakliAdi: 'Ali Özkan',
    foyTuru: 'İlamsız',
    durum: 'Derdest',
    takipTarihi: '2024-01-20',
    icraMudurlugu: 'Ankara'
  }
]

const mockFileDetails = {
  file_id: 1,
  klasor: '2024/1',
  dosyaNo: '2024/1',
  borcluAdi: 'Ahmet Yılmaz',
  alacakliAdi: 'Mehmet Demir',
  borclular: [
    {
      borclu_id: 1,
      borclu_adi: 'Ahmet',
      borclu_soyadi: 'Yılmaz',
      tc_no: '12345678901'
    }
  ],
  sorgular: [
    {
      sorgu_id: 1,
      sorgu_tipi: 'Banka',
      sorgu_verisi: {
        hesap_sayisi: 2,
        toplam_bakiye: 15000,
        hesaplar: [
          {
            banka_adi: 'Ziraat Bankası',
            hesap_no: '1234567890',
            bakiye: 10000
          },
          {
            banka_adi: 'İş Bankası',
            hesap_no: '0987654321',
            bakiye: 5000
          }
        ]
      },
      timestamp: '2024-01-15T10:30:00'
    }
  ]
}

export const handlers = [
  // Mock icra dosyalarim endpoint
  rest.get('/api/icra-dosyalarim', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockFiles)
    )
  }),

  // Mock icra dosyalarim detail endpoint
  rest.get('/api/icra-dosyalarim/:id', (req, res, ctx) => {
    const { id } = req.params
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json(mockFileDetails)
      )
    }
    return res(
      ctx.status(404),
      ctx.json({ message: 'File not found' })
    )
  }),

  // Mock UYAP endpoints
  rest.post('/api/uyap', (req, res, ctx) => {
    const { action } = req.body as any
    
    if (action === 'login') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Successfully logged in to UYAP',
          session_id: '9092'
        })
      )
    }
    
    if (action === 'logout') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Successfully logged out from UYAP'
        })
      )
    }
    
    if (action === 'search-files') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'File search completed successfully'
        })
      )
    }
    
    if (action === 'extract-data') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Data extraction completed successfully',
          data: mockFiles
        })
      )
    }
    
    return res(
      ctx.status(400),
      ctx.json({ success: false, message: 'Invalid action' })
    )
  }),

  // Mock trigger sorgulama endpoint
  rest.post('/api/uyap/trigger-sorgulama', (req, res, ctx) => {
    const { dosya_no, sorgu_tipi, borclu_id } = req.body as any
    
    if (!dosya_no || !sorgu_tipi || !borclu_id) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'Missing required parameters'
        })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: `${sorgu_tipi} sorgulaması başarıyla tamamlandı`,
        data: {
          hesap_sayisi: 2,
          toplam_bakiye: 15000,
          hesaplar: [
            {
              banka_adi: 'Ziraat Bankası',
              hesap_no: '1234567890',
              bakiye: 10000
            },
            {
              banka_adi: 'İş Bankası',
              hesap_no: '0987654321',
              bakiye: 5000
            }
          ]
        },
        timestamp: new Date().toISOString()
      })
    )
  }),

  // Mock UYAP status endpoint
  rest.get('/api/uyap/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        active_sessions: ['9092'],
        total_sessions: 1
      })
    )
  }),

  // Mock search files endpoint
  rest.post('/api/uyap/search-files', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'File search completed successfully'
      })
    )
  }),

  // Mock extract data endpoint
  rest.post('/api/uyap/extract-data', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Data extraction completed successfully',
        data: mockFiles
      })
    )
  }),

  // Mock query endpoint
  rest.post('/api/uyap/query', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Query completed successfully',
        result: {
          query_type: 'Banka',
          results: {
            hesap_sayisi: 2,
            toplam_bakiye: 15000
          }
        }
      })
    )
  }),

  // Mock error responses
  rest.get('/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: 'Internal server error'
      })
    )
  }),

  // Mock timeout responses
  rest.get('/api/timeout', (req, res, ctx) => {
    return res(
      ctx.status(408),
      ctx.json({
        success: false,
        message: 'Request timeout'
      })
    )
  }),

  // Mock network error
  rest.get('/api/network-error', (req, res, ctx) => {
    return res.networkError('Failed to connect')
  })
] 