# Content Attribution System Architecture

## Overview
Single-page React application for computing and comparing file fingerprints to identify similar content.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  File Upload     │  │  Matches Display │  │  Ledger View │  │
│  │  Component       │  │  Component       │  │  Component   │  │
│  └────────┬─────────┘  └────────▲─────────┘  └──────────▲───┘  │
│           │                     │                        │      │
│           └─────────────────────┼────────────────────────┘      │
│                                 │                               │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   App State Manager       │
                    │  (React Hooks/useState)   │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐      ┌──────────────────┐     ┌──────────────┐
│ File Processing │      │ Similarity       │     │ Storage      │
│ Engine          │      │ Computation      │     │ Manager      │
│                 │      │                  │     │              │
│ - Text Parser   │      │ - Jaccard Index  │     │ localStorage │
│ - Image Loader  │      │ - Hamming Dist.  │     │ (Ledger)     │
│ - Normalizer    │      │                  │     │              │
└────────┬────────┘      └────────▲─────────┘     └──────┬───────┘
         │                        │                      │
         └────────────────────────┼──────────────────────┘
                                  │
        ┌─────────────────────────▼─────────────────────────┐
        │         FINGERPRINT GENERATION ENGINE             │
        ├─────────────────────────────────────────────────────┤
        │                                                     │
        │  TEXT FINGERPRINT PIPELINE:                         │
        │  ┌────────────────────────────────────────┐        │
        │  │ 1. Normalize (lowercase, trim spaces)  │        │
        │  │ 2. Tokenize into n-grams (n=5)        │        │
        │  │ 3. Hash each n-gram with SHA-1        │        │
        │  │ 4. Sort unique hashes                 │        │
        │  │ 5. Concatenate and hash again         │        │
        │  │ → Produces: stable hex fingerprint     │        │
        │  └────────────────────────────────────────┘        │
        │                                                     │
        │  IMAGE FINGERPRINT PIPELINE:                        │
        │  ┌────────────────────────────────────────┐        │
        │  │ 1. Render image to 32x32 canvas       │        │
        │  │ 2. Extract pixel data                 │        │
        │  │ 3. Convert to grayscale               │        │
        │  │ 4. Compute average brightness         │        │
        │  │ 5. Generate bit string (pixel > avg)  │        │
        │  │ 6. Convert bits to hex                │        │
        │  │ → Produces: perceptual hash (phash)   │        │
        │  └────────────────────────────────────────┘        │
        │                                                     │
        └─────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────▼─────────────────────────┐
        │           SIMILARITY MATCHING ENGINE              │
        ├─────────────────────────────────────────────────────┤
        │                                                     │
        │  TEXT-TO-TEXT MATCHING:                             │
        │  • Compare n-gram hash sets                         │
        │  • Calculate Jaccard similarity                     │
        │  • Formula: |A ∩ B| / |A ∪ B|                     │
        │  • Output: 0.0 to 1.0 (0% to 100%)                │
        │                                                     │
        │  IMAGE-TO-IMAGE MATCHING:                           │
        │  • Convert hex phash to binary                      │
        │  • Calculate Hamming distance                       │
        │  • Formula: 1 - (distance / total_bits)            │
        │  • Output: 0.0 to 1.0 (0% to 100%)                │
        │                                                     │
        │  CROSS-TYPE MATCHING:                               │
        │  • No similarity (0.0)                              │
        │                                                     │
        └─────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────▼─────────────────────────┐
        │              LEDGER ENTRY STORAGE                 │
        ├─────────────────────────────────────────────────────┤
        │                                                     │
        │  Each entry contains:                               │
        │  {                                                  │
        │    id: string,           // timestamp-based ID      │
        │    filename: string,     // original filename       │
        │    filetype: 'text' | 'image',                     │
        │    fingerprint: string,  // hex hash/phash         │
        │    ngramHashes: string[], // for text only          │
        │    timestamp: string     // ISO 8601 datetime       │
        │  }                                                  │
        │                                                     │
        └─────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Browser Storage         │
                    │  (localStorage)           │
                    │  Key: 'attribution-       │
                    │        ledger'            │
                    │  Format: JSON Array       │
                    └───────────────────────────┘
```

## Data Flow Diagram

### Upload and Process Flow
```
User selects file
         │
         ▼
File validation
(txt or image?)
         │
    ┌────┴────┐
    │          │
    ▼          ▼
TEXT        IMAGE
    │          │
    ▼          ▼
Process      Process
(normalize)  (canvas)
    │          │
    ▼          ▼
N-grams      Resize to
             32x32
    │          │
    ▼          ▼
SHA-1        Grayscale
hashing      conversion
    │          │
    ▼          ▼
Sort &       Bit-string
concat       generation
    │          │
    ▼          ▼
Final        Hex
SHA-1        encoding
    │          │
    └────┬─────┘
         │
         ▼
    Fingerprint
    (stable hex)
         │
         ▼
Compare with ledger
entries (same type)
         │
         ▼
Compute similarity
scores
         │
         ▼
Sort & take top 5
         │
         ▼
Display results
         │
         ▼
Add to ledger
         │
         ▼
Persist to
localStorage
```

## Component Architecture

```
App.tsx (Main Container)
├── State Management
│   ├── selectedFile
│   ├── ledger[]
│   ├── matches[]
│   ├── processing
│   └── error
├── Event Handlers
│   ├── handleFileSelect()
│   ├── handleProcess()
│   ├── saveLedger()
│   └── handleClear()
└── Child Components
    ├── FileUpload.tsx
    │   ├── File input validation
    │   ├── Visual feedback
    │   └── Process button
    ├── Matches.tsx
    │   ├── Top 5 results display
    │   ├── Similarity scoring
    │   └── Color-coded badges
    └── Ledger.tsx
        ├── Scrollable table
        ├── Entry metadata
        └── Clear action
```

## Module Structure

```
src/
├── App.tsx                      # Main app container & orchestration
├── components/
│   ├── FileUpload.tsx          # File selection & upload UI
│   ├── Matches.tsx             # Match results display
│   └── Ledger.tsx              # Ledger table view
├── utils/
│   └── fingerprint.ts          # All cryptographic & fingerprint logic
│       ├── sha1()
│       ├── normalizeText()
│       ├── generateNGrams()
│       ├── computeTextFingerprint()
│       ├── imageToCanvas()
│       ├── computePerceptualHash()
│       ├── computeImageFingerprint()
│       ├── hammingDistance()
│       ├── jaccardSimilarity()
│       └── computeSimilarity()
└── types/
    └── index.ts               # TypeScript interfaces
        ├── LedgerEntry
        ├── Match
        └── ProcessResult
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 | UI component library |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Icons | Lucide React | SVG icon library |
| Build Tool | Vite | Fast development & production builds |
| Cryptography | Web Crypto API | SHA-1 hashing |
| Image Processing | Canvas API | Perceptual hashing |
| Storage | localStorage | Session-persistent ledger |

## Security & Privacy

- **Client-side only**: No data sent to external servers
- **In-memory processing**: Files never persisted to disk
- **Browser storage**: Ledger persisted only in browser (session-specific)
- **No authentication**: Demo application (easily extendable)
- **SHA-1 for fingerprints**: Fast, deterministic hashing for comparison purposes

## Performance Characteristics

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Text fingerprinting | O(n) where n = text length | O(n) | Linear scan + hashing |
| Image fingerprinting | O(1) | O(1) | Fixed 32x32 canvas |
| Similarity matching | O(m) where m = ledger size | O(m) | Single pass comparison |
| Ledger lookup | O(1) | N/A | Direct localStorage access |

## Extensibility Points

1. **Backend Storage**: Replace localStorage with Supabase
2. **Advanced Hashing**: Add MD5, SHA-256, or specialized algorithms
3. **Image Algorithms**: Implement SIFT, ORB, or other CV methods
4. **Batch Processing**: Add multi-file upload capabilities
5. **Export Features**: Generate fingerprint reports
6. **Search Interface**: Advanced filtering and sorting of ledger
7. **Authentication**: User-specific ledgers with Supabase Auth

## Known Limitations

- No support for PDF or Word documents (user converts to .txt)
- Perceptual hash resolution fixed at 32x32 pixels
- Single n-gram size (n=5) for text
- No fuzzy matching or partial string comparison
- Ledger limited by browser storage capacity (~5-10MB)
