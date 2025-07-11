# Field Ordering Utility

This utility provides consistent field ordering for data tables across different modals.

## Problem Solved

JavaScript objects don't guarantee a specific order for their keys, especially when:
- Data is serialized/deserialized (JSON.parse/stringify)
- Data comes from different sources
- Objects are merged or updated

This causes table rows to appear in different orders between database and UI.

## Solution

The `field-ordering.ts` utility provides:

1. **`sortObjectEntries<T>()`** - A generic function to sort object entries according to a predefined order
2. **`FIELD_ORDERS`** - Predefined field order arrays for different data types

## Usage

```typescript
import { sortObjectEntries, FIELD_ORDERS } from "../utils/field-ordering"

// Sort data according to predefined field orders
const sortedKisiselBilgiler = sortObjectEntries(kisiselBilgiler, FIELD_ORDERS.kisiselBilgiler)
const sortedAdresBilgileri = sortObjectEntries(adresBilgileri, FIELD_ORDERS.adresBilgileri)

// Use in table rendering
{sortedKisiselBilgiler.map(([key, value]) => (
  <TableRow key={key}>
    <TableCell>{key}</TableCell>
    <TableCell>{value}</TableCell>
  </TableRow>
))}
```

## Adding New Field Orders

To add field orders for new data types:

1. Add the order array to `FIELD_ORDERS`:
```typescript
export const FIELD_ORDERS = {
  // ... existing orders
  newDataType: [
    "Field1",
    "Field2", 
    "Field3"
  ]
} as const
```

2. Use it in your component:
```typescript
const sortedData = sortObjectEntries(data, FIELD_ORDERS.newDataType)
```

## Benefits

- ✅ Consistent data display order
- ✅ Reusable across components
- ✅ Type-safe with TypeScript
- ✅ Handles missing fields gracefully
- ✅ Falls back to alphabetical sorting for unknown fields 