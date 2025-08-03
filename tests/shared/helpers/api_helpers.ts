// API helper functions for frontend tests

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface TestUser {
  id: number
  username: string
  pincode: string
  role: string
}

export interface TestCase {
  file_id: number
  klasor: string
  dosyaNo: string
  eYil: number
  eNo: number
  borcluAdi: string
  alacakliAdi: string
  foyTuru: string
  durum: string
  takipTarihi: string
  icraMudurlugu: string
}

export interface TestQueryResult {
  sorgu_id: number
  borclu_id: number
  sorgu_tipi: string
  sorgu_verisi: any
  timestamp: string
}

// Mock API functions
export const mockApi = {
  // Mock UYAP login
  login: async (pincode: string): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay
    
    if (pincode === '9092') {
      return {
        success: true,
        message: 'Successfully logged in to UYAP',
        data: { session_id: '9092' }
      }
    }
    
    return {
      success: false,
      message: 'Invalid PIN code'
    }
  },

  // Mock UYAP logout
  logout: async (sessionId: string): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return {
      success: true,
      message: 'Successfully logged out from UYAP'
    }
  },

  // Mock get files
  getFiles: async (): Promise<ApiResponse<TestCase[]>> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      success: true,
      data: [
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
    }
  },

  // Mock get file details
  getFileDetails: async (fileId: number): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (fileId === 1) {
      return {
        success: true,
        data: {
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
                toplam_bakiye: 15000
              },
              timestamp: '2024-01-15T10:30:00'
            }
          ]
        }
      }
    }
    
    return {
      success: false,
      message: 'File not found'
    }
  },

  // Mock trigger query
  triggerQuery: async (dosyaNo: string, sorguTipi: string, borcluId: string): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate query time
    
    return {
      success: true,
      message: `${sorguTipi} sorgulaması başarıyla tamamlandı`,
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
    }
  },

  // Mock search files
  searchFiles: async (sessionId: string): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: 'File search completed successfully'
    }
  },

  // Mock extract data
  extractData: async (sessionId: string, pageCount: number): Promise<ApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: 'Data extraction completed successfully',
      data: [
        {
          file_id: 1,
          klasor: '2024/1',
          dosyaNo: '2024/1',
          borcluAdi: 'Ahmet Yılmaz',
          alacakliAdi: 'Mehmet Demir'
        }
      ]
    }
  }
}

// Error simulation helpers
export const simulateApiError = (errorType: 'network' | 'timeout' | 'server' | 'auth') => {
  switch (errorType) {
    case 'network':
      throw new Error('Network error: Failed to connect')
    case 'timeout':
      throw new Error('Request timeout')
    case 'server':
      throw new Error('Internal server error')
    case 'auth':
      throw new Error('Authentication failed')
    default:
      throw new Error('Unknown error')
  }
}

// Test data generators
export const generateTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 1,
  username: 'test_user',
  pincode: '9092',
  role: 'admin',
  ...overrides
})

export const generateTestCase = (overrides: Partial<TestCase> = {}): TestCase => ({
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
  icraMudurlugu: 'İstanbul',
  ...overrides
})

export const generateQueryResult = (overrides: Partial<TestQueryResult> = {}): TestQueryResult => ({
  sorgu_id: 1,
  borclu_id: 1,
  sorgu_tipi: 'Banka',
  sorgu_verisi: {
    hesap_sayisi: 2,
    toplam_bakiye: 15000
  },
  timestamp: '2024-01-15T10:30:00',
  ...overrides
})

// API response validators
export const validateApiResponse = (response: ApiResponse): boolean => {
  if (typeof response !== 'object' || response === null) {
    return false
  }
  
  if (typeof response.success !== 'boolean') {
    return false
  }
  
  return true
}

export const validateTestCase = (caseData: TestCase): boolean => {
  const requiredFields = ['file_id', 'klasor', 'dosyaNo', 'borcluAdi', 'alacakliAdi']
  
  for (const field of requiredFields) {
    if (!(field in caseData)) {
      return false
    }
  }
  
  return true
}

// API call wrappers with error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  retries: number = 3
): Promise<ApiResponse<T>> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiFunction()
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Performance monitoring
export const measureApiPerformance = async <T>(
  apiFunction: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now()
  const result = await apiFunction()
  const duration = Date.now() - startTime
  
  return { result, duration }
} 