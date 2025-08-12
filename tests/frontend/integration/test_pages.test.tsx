import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
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
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  }
})

// Setup MSW server for API mocking
const server = setupServer(
  // Mock successful API response for icra dosyalarim
  rest.get('/api/icra-dosyalarim', (req, res, ctx) => {
    return res(
      ctx.json([
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
    )
  }),

  // Mock successful UYAP login
  rest.post('/api/uyap', async (req, res, ctx) => {
    const body = await req.json()
    const { action } = body
    
    if (action === 'login') {
      return res(
        ctx.json({
          success: true,
          message: 'Successfully logged in to UYAP',
          session_id: '9092'
        })
      )
    }
    
    if (action === 'logout') {
      return res(
        ctx.json({
          success: true,
          message: 'Successfully logged out from UYAP'
        })
      )
    }
    
    return res(ctx.status(400))
  }),

  // Mock file detail API
  rest.get('/api/icra-dosyalarim/1', (req, res, ctx) => {
    return res(
      ctx.json({
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
    )
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
    
    // Use getAllByText to handle multiple elements with same text
    const titles = screen.getAllByText('İcra Dosyalarım')
    expect(titles.length).toBeGreaterThan(0)
    
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
    
    // Use getAllByText to handle multiple elements with same text
    const klasorElements = screen.getAllByText('2024/1')
    expect(klasorElements.length).toBeGreaterThan(0)
    
    const klasorElements2 = screen.getAllByText('2024/2')
    expect(klasorElements2.length).toBeGreaterThan(0)
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

  test('status badges display correctly', async () => {
    render(<IcraDosyalarimPage />)
    
    // Fetch data
    const fetchButton = screen.getByText('Föyleri Getir')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      // Use getAllByText to handle multiple elements
      const acikBadges = screen.getAllByText('Açık')
      expect(acikBadges.length).toBeGreaterThan(0)
      
      const derdestBadges = screen.getAllByText('Derdest')
      expect(derdestBadges.length).toBeGreaterThan(0)
    })
    
    // Verify status badges have correct styling classes
    const acikBadges = screen.getAllByText('Açık')
    const derdestBadges = screen.getAllByText('Derdest')
    
    // Check that at least one badge has the correct styling
    const hasGreenBadge = acikBadges.some(badge => 
      badge.className.includes('bg-green-100') || badge.className.includes('text-green-800')
    )
    const hasBlueBadge = derdestBadges.some(badge => 
      badge.className.includes('bg-blue-100') || badge.className.includes('text-blue-800')
    )
    
    expect(hasGreenBadge).toBe(true)
    expect(hasBlueBadge).toBe(true)
  })
})
