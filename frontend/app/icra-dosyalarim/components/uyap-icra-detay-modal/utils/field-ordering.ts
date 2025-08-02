/**
 * Utility functions for consistent field ordering in data tables
 */

/**
 * Sort object entries according to a predefined order
 * @param data - Object to sort
 * @param orderArray - Array defining the desired order of keys
 * @returns Sorted array of [key, value] pairs
 */
export function sortObjectEntries<T>(
  data: Record<string, T>,
  orderArray: readonly string[]
): [string, T][] {
  return Object.entries(data).sort(([keyA], [keyB]) => {
    const indexA = orderArray.indexOf(keyA)
    const indexB = orderArray.indexOf(keyB)
    
    // If both keys are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    
    // If only one key is in the order array, prioritize it
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    
    // If neither key is in the order array, sort alphabetically
    return keyA.localeCompare(keyB)
  })
}

/**
 * Predefined field orders for different data types
 */
export const FIELD_ORDERS = {
  // Personal information fields (MERNIS)
  kisiselBilgiler: [
    "T.C Kimlik No",
    "Adı",
    "Soyadı", 
    "Baba Adı",
    "Ana Adı",
    "Cinsiyeti",
    "Doğum Yeri",
    "Doğum Tarihi",
    "Nüf. Kay. İl",
    "Nüf. Kay. İlçe",
    "Mah/Köy",
    "Ver. Nedeni",
    "Ver. Tarih",
    "Ver. İl",
    "Ver. İlçe",
    "Cüzdan Seri",
    "Cüzdan No",
    "Cilt No",
    "Aile Sıra No",
    "Sıra No",
    "Dini",
    "Önceki Soyadı",
    "Ölüm Tarihi"
  ],
  
  // Address information fields (MERNIS)
  adresBilgileri: [
    "Adres Tipi",
    "Mahalle",
    "Cadde/Sokak",
    "Dış Kapı No",
    "İç Kapı No",
    "İl",
    "İlçe",
    "Beyan Tarihi",
    "Taşınma Tarihi",
    "Tescil Tarihi"
  ]
} as const 