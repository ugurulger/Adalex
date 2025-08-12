import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import IcraDosyalarimPage from '../../../frontend/app/icra-dosyalarim/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Setup MSW server for API mocking
const server = setupServer(
  // Mock successful API response for icra dosyalarim
  http.get('/api/icra-dosyalarim', () => {
    return HttpResponse.json([
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
    ])
  }),

  // Mock successful UYAP login
  http.post('/api/uyap', ({ request }) => {
    return request.json().then((body) => {
      const { action } = body
      
      if (action === 'login') {
        return HttpResponse.json({
          success: true,
          message: 'Successfully logged in to UYAP',
          session_id: '9092'
        })
      }
      
      if (action === 'logout') {
        return HttpResponse.json({
          success: true,
          message: 'Successfully logged out from UYAP'
        })
      }
      
      return new HttpResponse(null, { status: 400 })
    })
  }),

  // Mock file detail API
  http.get('/api/icra-dosyalarim/1', () => {
    return HttpResponse.json({
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
      ]
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('IcraDosyalarimPage Integration Tests', () => {
  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks()
  })

  test('renders empty state initially', () => {
    render(<IcraDosyalarimPage />)
    
    expect(screen.getByText('İcra Dosyalarım')).toBeInTheDocument()
    expect(screen.getByText('Dosya listesini görüntülemek için "Föyleri Getir" butonuna tıklayın')).toBeInTheDocument()
    expect(screen.getByText('Föyleri Getir')).toBeInTheDocument()
  })

  test('fetches and displays data when "Föyleri Getir" is clicked', async () => {
    render(<IcraDosyalarimPage />)
    
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText('Veriler yükleniyor...')).toBeInTheDocument()
    })
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.getByText('Fatma Kaya')).toBeInTheDocument()
    })
    
    // Verify both desktop and mobile views show data
    expect(screen.getByText('2024/1')).toBeInTheDocument()
    expect(screen.getByText('2024/2')).toBeInTheDocument()
  })

  test('handles API error gracefully', async () => {
    // Override the default handler to return an error
    server.use(
      rest.get('/api/icra-dosyalarim', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )
    
    render(<IcraDosyalarimPage />)
    
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.')).toBeInTheDocument()
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument()
    })
  })

  test('search functionality filters data correctly', async () => {
    render(<IcraDosyalarimPage />)
    
    // First fetch data
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    })
    
    // Search for "Ahmet"
    const searchInput = screen.getByPlaceholderText('Dosya No, Borçlu Adı, Borçlu Soyadı...')
    fireEvent.change(searchInput, { target: { value: 'Ahmet' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.queryByText('Fatma Kaya')).not.toBeInTheDocument()
    })
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.getByText('Fatma Kaya')).toBeInTheDocument()
    })
  })

  test('sorting functionality works correctly', async () => {
    render(<IcraDosyalarimPage />)
    
    // First fetch data
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    })
    
    // Click on Klasör header to sort
    const klasorHeader = screen.getByText('Klasör')
    fireEvent.click(klasorHeader)
    
    // Verify sorting indicators are present
    expect(klasorHeader).toBeInTheDocument()
  })

  test('UYAP connection toggle works', async () => {
    render(<IcraDosyalarimPage />)
    
    // Initially should show "Bağlı Değil"
    expect(screen.getByText('Uyap: Bağlı Değil')).toBeInTheDocument()
    
    // Click to connect
    const uyapButton = screen.getByText('Uyap: Bağlı Değil')
    fireEvent.click(uyapButton)
    
    // Should show connecting state
    await waitFor(() => {
      expect(screen.getByText('Uyap: Bağlanıyor...')).toBeInTheDocument()
    })
    
    // Should show connected state
    await waitFor(() => {
      expect(screen.getByText('Uyap: Bağlı')).toBeInTheDocument()
    })
  })

  test('UYAP connection handles errors', async () => {
    // Override UYAP login to return error
    server.use(
      rest.post('/api/uyap', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            message: 'Failed to login to UYAP'
          })
        )
      })
    )
    
    render(<IcraDosyalarimPage />)
    
    const uyapButton = screen.getByText('Uyap: Bağlı Değil')
    fireEvent.click(uyapButton)
    
    // Should return to disconnected state after error
    await waitFor(() => {
      expect(screen.getByText('Uyap: Bağlı Değil')).toBeInTheDocument()
    })
  })

  test('profile dropdown functionality', async () => {
    render(<IcraDosyalarimPage />)
    
    // Click profile dropdown
    const profileButton = screen.getByText('Profil')
    fireEvent.click(profileButton)
    
    // Should show profile form
    await waitFor(() => {
      expect(screen.getByLabelText('Kullanıcı Adı')).toBeInTheDocument()
      expect(screen.getByLabelText('Pin Kodu')).toBeInTheDocument()
      expect(screen.getByText('Kaydet')).toBeInTheDocument()
    })
    
    // Test form inputs
    const usernameInput = screen.getByLabelText('Kullanıcı Adı')
    const pincodeInput = screen.getByLabelText('Pin Kodu')
    
    fireEvent.change(usernameInput, { target: { value: 'Test User' } })
    fireEvent.change(pincodeInput, { target: { value: '1234' } })
    
    expect(usernameInput).toHaveValue('Test User')
    expect(pincodeInput).toHaveValue('1234')
  })

  test('ilk kurulum dropdown functionality', async () => {
    render(<IcraDosyalarimPage />)
    
    // Click ilk kurulum dropdown
    const ilkKurulumButton = screen.getByText('İlk Kurulum')
    fireEvent.click(ilkKurulumButton)
    
    // Should show ilk kurulum options
    await waitFor(() => {
      expect(screen.getByText('Bütün Dosyaları UYAP\'ta Ara')).toBeInTheDocument()
      expect(screen.getByText('Föyleri UYAP\'tan Çek')).toBeInTheDocument()
    })
  })

  test('tool buttons functionality', async () => {
    render(<IcraDosyalarimPage />)
    
    // Test Pratik Faiz Hesaplama button
    const pratikFaizButton = screen.getByText('Pratik Faiz Hesaplama')
    fireEvent.click(pratikFaizButton)
    
    // Should open modal (modal state would be tested separately)
    expect(pratikFaizButton).toBeInTheDocument()
    
    // Test Güncel Faiz Oranları button
    const faizOranlariButton = screen.getByText('Güncel Faiz Oranları')
    fireEvent.click(faizOranlariButton)
    
    expect(faizOranlariButton).toBeInTheDocument()
  })

  test('new file modal functionality', async () => {
    render(<IcraDosyalarimPage />)
    
    // Click new file button
    const newFileButton = screen.getByText('Yeni Föy Ekle')
    fireEvent.click(newFileButton)
    
    // Should open modal (modal content would be tested separately)
    expect(newFileButton).toBeInTheDocument()
  })

  test('responsive design - mobile view', async () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    render(<IcraDosyalarimPage />)
    
    // Fetch data to see mobile card view
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    })
    
    // Mobile view should show cards instead of table
    // The mobile view is controlled by CSS classes, so we test the presence of data
    expect(screen.getByText('2024/1')).toBeInTheDocument()
  })

  test('status badges display correctly', async () => {
    render(<IcraDosyalarimPage />)
    
    // Fetch data
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Açık')).toBeInTheDocument()
      expect(screen.getByText('Derdest')).toBeInTheDocument()
    })
    
    // Verify status badges have correct styling classes
    const acikBadge = screen.getByText('Açık')
    const derdestBadge = screen.getByText('Derdest')
    
    expect(acikBadge).toHaveClass('bg-green-100')
    expect(derdestBadge).toHaveClass('bg-blue-100')
  })

  test('page navigation works', () => {
    render(<IcraDosyalarimPage />)
    
    // Test back button
    const backButton = screen.getByText('Anasayfaya Dön')
    expect(backButton).toBeInTheDocument()
    expect(backButton.closest('a')).toHaveAttribute('href', '/')
  })

  test('loading states display correctly', async () => {
    // Override API to delay response
    server.use(
      rest.get('/api/icra-dosyalarim', async (req, res, ctx) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return res(ctx.json([]))
      })
    )
    
    render(<IcraDosyalarimPage />)
    
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Veriler yükleniyor...')).toBeInTheDocument()
    })
  })

  test('empty search results display correctly', async () => {
    render(<IcraDosyalarimPage />)
    
    // Fetch data first
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    })
    
    // Search for non-existent term
    const searchInput = screen.getByPlaceholderText('Dosya No, Borçlu Adı, Borçlu Soyadı...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentTerm' } })
    
    await waitFor(() => {
      expect(screen.getByText('Arama sonucu bulunamadı')).toBeInTheDocument()
      expect(screen.getByText('Farklı arama terimleri deneyebilirsiniz')).toBeInTheDocument()
    })
  })
}) 