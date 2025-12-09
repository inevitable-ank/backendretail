# Architecture Documentation

## Backend Architecture

### Overview
The backend is built using Node.js with Express.js framework, following a layered architecture pattern with clear separation of concerns. The system uses Prisma ORM for database interactions and implements RESTful API endpoints.

### Architecture Layers

#### 1. Routes Layer (`src/routes/`)
- **Purpose**: Define API endpoints and route handlers
- **Files**:
  - `authRoutes.js`: Authentication endpoints (login, register, logout)
  - `transactionRoutes.js`: Transaction-related endpoints
- **Responsibilities**:
  - Route definition and HTTP method mapping
  - Request validation and middleware application
  - File upload configuration (Multer)

#### 2. Controllers Layer (`src/controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Files**:
  - `authController.js`: Authentication logic (sign up, sign in, user management)
  - `transactionController.js`: Transaction operations (CRUD, search, filters, stats)
- **Responsibilities**:
  - Parse request parameters and query strings
  - Validate input data
  - Call service layer methods
  - Format and send HTTP responses
  - Error handling and status code management

#### 3. Services Layer (`src/services/`)
- **Purpose**: Business logic and data processing
- **Files**:
  - `transactionService.js`: Core transaction operations (search, filter, sort, paginate, stats)
  - `csvImportService.js`: CSV file parsing and data import
  - `authService.js`: Authentication and user management logic
- **Responsibilities**:
  - Implement business rules
  - Build database queries
  - Data transformation and validation
  - Cache management
  - Aggregate calculations

#### 4. Utils Layer (`src/utils/`)
- **Purpose**: Shared utilities and configurations
- **Files**:
  - `prisma.js`: Prisma client singleton instance
  - `cache.js`: In-memory caching system with TTL
  - `supabaseClient.js`: Supabase client configuration
- **Responsibilities**:
  - Database connection management
  - Caching implementation
  - External service clients
  - Shared helper functions

#### 5. Database Layer
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Schema**: Defined in `prisma/schema.prisma`
- **Migrations**: Managed through Prisma migrations
- **Indexes**: 
  - Single-column indexes on frequently queried fields
  - Composite indexes for common filter combinations
  - Case-insensitive index for search optimization

### Key Design Patterns

1. **Singleton Pattern**: Prisma client instance is shared across the application
2. **Repository Pattern**: Service layer abstracts database operations
3. **Middleware Pattern**: Express middleware for CORS, logging, error handling
4. **Caching Pattern**: In-memory cache with TTL for frequently accessed data

### API Endpoints

#### Transaction Endpoints
- `GET /api/transactions` - Get transactions with search, filters, sort, pagination
- `GET /api/transactions/filters` - Get available filter options
- `GET /api/transactions/stats` - Get aggregated statistics
- `POST /api/transactions/upload` - Upload CSV file
- `GET /api/transactions/uploads` - Get upload history

#### Auth Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user

### Performance Optimizations

1. **Database Indexes**: 
   - Composite indexes on filter combinations
   - Case-insensitive index for search
   - Indexes on sortable fields

2. **Query Optimization**:
   - Single aggregate query for stats (instead of multiple)
   - Optimized search using `startsWith` instead of `contains`
   - Smart count query skipping when possible

3. **Caching**:
   - 30-second TTL cache for stats queries
   - Cache invalidation on data updates
   - In-memory cache implementation

4. **Connection Pooling**:
   - Supabase connection pooling
   - Prisma connection management

---

## Frontend Architecture

### Overview
The frontend is built using Next.js 16 with App Router, React 19, and TypeScript. It follows a component-based architecture with clear separation between UI components, business logic, and data fetching.

### Architecture Layers

#### 1. Pages Layer (`app/`)
- **Purpose**: Route definitions and page components
- **Files**:
  - `page.tsx`: Main dashboard (transaction list)
  - `profile/page.tsx`: User profile and CSV upload
  - `(auth)/login/page.tsx`: Login page
  - `(auth)/register/page.tsx`: Registration page
- **Responsibilities**:
  - Route handling
  - Page-level state management
  - Data fetching coordination
  - Layout composition

#### 2. Components Layer (`components/`)
- **Purpose**: Reusable UI components
- **Files**:
  - `header.tsx`: Top navigation with search bar
  - `sidebar.tsx`: Side navigation menu
  - `filter-panel.tsx`: Multi-select filters and sorting
  - `transaction-table.tsx`: Data table display
  - `pagination.tsx`: Page navigation controls
  - `stats-cards.tsx`: Statistics display cards
- **Responsibilities**:
  - UI rendering
  - User interaction handling
  - Component-level state
  - Props-based communication

#### 3. Contexts Layer (`contexts/`)
- **Purpose**: Global state management
- **Files**:
  - `AuthContext.tsx`: Authentication state and user data
- **Responsibilities**:
  - Global state management
  - Cross-component data sharing
  - Authentication state
  - User session management

#### 4. Services Layer (`lib/`)
- **Purpose**: API communication and business logic
- **Files**:
  - `api.ts`: Transaction API calls (getTransactions, getStats, getFilterOptions, upload)
  - `auth.ts`: Authentication API calls
- **Responsibilities**:
  - HTTP request construction
  - Query parameter building
  - Response parsing
  - Error handling
  - Type definitions

#### 5. Styles Layer
- **Purpose**: Styling and theming
- **Files**:
  - `globals.css`: Global styles and Tailwind configuration
- **Responsibilities**:
  - CSS variables
  - Global styles
  - Theme configuration

### State Management

1. **Local State**: React `useState` for component-specific state
2. **Context API**: `AuthContext` for global authentication state
3. **URL State**: Query parameters for search, filters, sort, pagination (shareable URLs)
4. **Server State**: Fetched data stored in component state

### Key Design Patterns

1. **Component Composition**: Small, focused components combined into larger pages
2. **Custom Hooks**: Reusable logic extraction (implicit in useEffect/useCallback patterns)
3. **Debouncing**: Search input debounced to reduce API calls
4. **Optimistic Updates**: UI updates before server confirmation where appropriate

---

## Data Flow

### Transaction List Flow

1. **User Interaction**:
   - User types in search bar → Debounced search (500ms)
   - User selects filters → Immediate filter application
   - User changes sort → Immediate sort application
   - User clicks pagination → Page change

2. **State Update**:
   - Frontend updates local state (search, filters, sort, page)
   - URL query parameters updated (for shareability)

3. **API Request**:
   - `lib/api.ts` builds query string from state
   - HTTP GET request to `/api/transactions` with query parameters

4. **Backend Processing**:
   - `transactionRoutes.js` receives request
   - `transactionController.js` parses query parameters
   - `transactionService.js` builds Prisma query:
     - Constructs `where` clause from filters and search
     - Applies `orderBy` from sort parameters
     - Calculates `skip` and `take` for pagination
   - Executes database query with timeout protection
   - Returns results with pagination metadata

5. **Response Handling**:
   - Frontend receives JSON response
   - Updates component state with transactions and pagination info
   - UI re-renders with new data

### CSV Upload Flow

1. **User Action**: User selects CSV file and clicks upload
2. **File Upload**: `lib/api.ts` sends POST request with FormData
3. **Backend Processing**:
   - `transactionController.js` receives file via Multer
   - Creates upload record in database
   - `csvImportService.js` parses CSV in batches
   - Inserts transactions using Prisma `createMany`
   - Updates upload record with results
   - Clears cache for fresh stats
4. **Response**: Success/error message returned to frontend
5. **UI Update**: Upload history refreshed, cache invalidated

### Statistics Flow

1. **Initial Load**: Stats fetched with current filters
2. **Filter Change**: Stats re-fetched with new filters
3. **Caching**: 
   - Check cache first (30-second TTL)
   - If cache hit, return cached data
   - If cache miss, query database and cache result
4. **Cache Invalidation**: Cache cleared on CSV upload

---

## Folder Structure

```
Retail Service/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.js
│   │   │   └── transactionController.js
│   │   ├── services/             # Business logic
│   │   │   ├── authService.js
│   │   │   ├── csvImportService.js
│   │   │   └── transactionService.js
│   │   ├── routes/               # API routes
│   │   │   ├── authRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── utils/                # Utilities
│   │   │   ├── cache.js
│   │   │   ├── prisma.js
│   │   │   └── supabaseClient.js
│   │   └── index.js              # Entry point
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── scripts/                  # Utility scripts
│   │   ├── setup-db.js
│   │   ├── test-db-connection.js
│   │   └── apply-case-insensitive-index.js
│   ├── package.json
│   └── README-PRISMA.md
│
├── app_v1/                        # Frontend (Next.js)
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── profile/               # Profile page
│   │   ├── page.tsx               # Main dashboard
│   │   └── layout.tsx             # Root layout
│   ├── components/                # React components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── filter-panel.tsx
│   │   ├── transaction-table.tsx
│   │   ├── pagination.tsx
│   │   └── stats-cards.tsx
│   ├── contexts/                  # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                       # Services and utilities
│   │   ├── api.ts                 # API client
│   │   └── auth.ts                # Auth client
│   ├── public/                    # Static assets
│   ├── globals.css                # Global styles
│   └── package.json
│
├── docs/
│   └── architecture.md           # This file
│
└── README.md                      # Project documentation
```

---

## Module Responsibilities

### Backend Modules

#### `transactionController.js`
- **Purpose**: Handle HTTP requests for transaction operations
- **Responsibilities**:
  - Parse query parameters (page, pageSize, search, sortBy, sortOrder, filters)
  - Validate input data
  - Call `transactionService` methods
  - Format JSON responses
  - Handle errors and return appropriate status codes

#### `transactionService.js`
- **Purpose**: Core business logic for transactions
- **Responsibilities**:
  - Build Prisma queries from filters and search
  - Implement search logic (case-insensitive, optimized)
  - Apply filters (AND logic for combinations)
  - Handle sorting and pagination
  - Calculate statistics (aggregates)
  - Manage query timeouts
  - Return formatted results

#### `csvImportService.js`
- **Purpose**: Handle CSV file import
- **Responsibilities**:
  - Parse CSV files (handle various formats)
  - Validate data fields
  - Batch processing (1000 records at a time)
  - Insert transactions into database
  - Handle duplicates (skipDuplicates)
  - Track import progress
  - Clear cache after import

#### `authService.js`
- **Purpose**: Authentication and user management
- **Responsibilities**:
  - User registration (Supabase Auth)
  - User login (Supabase Auth)
  - User data retrieval
  - Session management
  - Database user record creation

#### `cache.js`
- **Purpose**: In-memory caching system
- **Responsibilities**:
  - Store cached data with TTL
  - Generate cache keys from filters
  - Check cache expiration
  - Clean expired entries
  - Clear cache on demand

#### `prisma.js`
- **Purpose**: Database connection management
- **Responsibilities**:
  - Initialize Prisma client
  - Manage singleton instance
  - Handle connection pooling
  - Environment variable validation

### Frontend Modules

#### `page.tsx` (Dashboard)
- **Purpose**: Main transaction list page
- **Responsibilities**:
  - Manage page-level state (search, filters, sort, pagination)
  - Coordinate data fetching
  - Handle user interactions
  - Compose UI components
  - Manage loading and error states

#### `filter-panel.tsx`
- **Purpose**: Filter and sort UI
- **Responsibilities**:
  - Render filter dropdowns
  - Handle filter selection
  - Display active filters
  - Provide reset functionality
  - Sort dropdown UI

#### `transaction-table.tsx`
- **Purpose**: Display transaction data
- **Responsibilities**:
  - Render data table
  - Format data display
  - Handle table interactions
  - Responsive layout

#### `pagination.tsx`
- **Purpose**: Page navigation
- **Responsibilities**:
  - Display page numbers
  - Handle page navigation
  - Show current page
  - Disable buttons at boundaries

#### `api.ts`
- **Purpose**: API communication layer
- **Responsibilities**:
  - Build query strings from parameters
  - Make HTTP requests
  - Handle responses
  - Type definitions
  - Error handling

#### `AuthContext.tsx`
- **Purpose**: Global authentication state
- **Responsibilities**:
  - Manage user session
  - Provide auth state to components
  - Handle login/logout
  - Protect routes

---

## Database Schema

### Transaction Table
- Primary key: `id` (UUID)
- Unique: `transactionId` (Text)
- Indexed fields: customerName, phoneNumber, customerRegion, gender, age, productCategory, paymentMethod, date
- Composite indexes: (customerRegion, date), (customerRegion, productCategory), etc.
- Case-insensitive index: `LOWER(customerName)`

### User Table
- Primary key: `id` (UUID, references Supabase auth.users)
- Unique: `email` (Text)
- Fields: name, createdAt, updatedAt

### CSV Upload Table
- Primary key: `id` (UUID)
- Tracks: fileName, fileSize, totalRecords, importedRecords, failedRecords, status, errorMessage, uploadedBy, uploadedAt

---

## Security Considerations

1. **Authentication**: Supabase Auth with JWT tokens
2. **CORS**: Configured for specific frontend origin
3. **Input Validation**: Server-side validation of all inputs
4. **SQL Injection**: Prevented through Prisma ORM parameterized queries
5. **File Upload**: Size limits and type validation
6. **Error Handling**: No sensitive information in error messages

---

## Performance Considerations

1. **Database Indexes**: Comprehensive indexing strategy
2. **Query Optimization**: Single queries instead of multiple
3. **Caching**: Stats queries cached for 30 seconds
4. **Pagination**: Limits data transfer
5. **Debouncing**: Reduces API calls for search
6. **Connection Pooling**: Efficient database connections
7. **Batch Processing**: CSV import in batches of 1000

---

## Scalability Considerations

1. **Stateless Backend**: Can be horizontally scaled
2. **Database Indexes**: Support large datasets
3. **Caching Strategy**: Can be upgraded to Redis for distributed caching
4. **Connection Pooling**: Handles concurrent requests
5. **Pagination**: Prevents memory issues with large result sets

