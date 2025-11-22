# Copy Express Claremont - Admin Backend Documentation

## Overview
This backend provides CRUD operations for pricing data management with admin authentication using NextAuth and MongoDB.

## Features
- ✅ Admin authentication with NextAuth
- ✅ CRUD operations for categories and subcategories
- ✅ PDF data extraction for automated pricing updates
- ✅ MongoDB integration with Mongoose
- ✅ Secure password hashing with bcryptjs
- ✅ TypeScript support
- ✅ RESTful API design

## Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://jbangala90_db_user:QrT558FI9Ym7Dr5Y@copyexpress-claremont.40qgguu.mongodb.net/?appName=copyexpress-claremont

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Admin credentials
ADMIN_EMAIL=admin@copyexpress.com
ADMIN_PASSWORD=ChangeMeInProduction123!
```

## Database Setup

### 1. Seed the Database

Make a POST request to initialize the database with the admin user and pricing data:

```bash
curl -X POST http://localhost:3000/api/admin/seed
```

This will:
- Create an admin user with credentials from `.env.local`
- Import all pricing categories from `data/pricingData.ts`

### 2. Clear the Database (Optional)

To reset the database:

```bash
curl -X DELETE http://localhost:3000/api/admin/seed
```

## API Endpoints

### Authentication

#### Login
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@copyexpress.com",
  "password": "ChangeMeInProduction123!"
}
```

#### Logout
```
POST /api/auth/signout
```

### Categories

#### Get All Categories
```
GET /api/admin/categories
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "a4-a3",
      "name": "A4 & A3 Prints",
      "description": "Professional A4 & A3 printing options",
      "subcategories": [...],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Category
```
GET /api/admin/categories/[id]
```

Example:
```
GET /api/admin/categories/a4-a3
```

#### Create New Category
```
POST /api/admin/categories
Authorization: Required (NextAuth session)
Content-Type: application/json

{
  "id": "new-category",
  "name": "New Category",
  "description": "Description here",
  "subcategories": []
}
```

#### Update Category
```
PUT /api/admin/categories/[id]
Authorization: Required (NextAuth session)
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "subcategories": [...]
}
```

#### Delete Category
```
DELETE /api/admin/categories/[id]
Authorization: Required (NextAuth session)
```

### Subcategories

#### Add Subcategory to Category
```
POST /api/admin/categories/[id]/subcategories
Authorization: Required (NextAuth session)
Content-Type: application/json

{
  "id": "new-subcategory",
  "name": "New Subcategory",
  "type": "table",
  "data": [...],
  "columns": [...]
}
```

#### Update Subcategory
```
PUT /api/admin/categories/[id]/subcategories/[subcategoryId]
Authorization: Required (NextAuth session)
Content-Type: application/json

{
  "name": "Updated Subcategory",
  "data": [...]
}
```

#### Delete Subcategory
```
DELETE /api/admin/categories/[id]/subcategories/[subcategoryId]
Authorization: Required (NextAuth session)
```

### PDF Extraction

#### Extract Pricing Data from PDF
```
POST /api/admin/extract-pdf
Authorization: Required (NextAuth session)
Content-Type: multipart/form-data

Form Data:
- file: [PDF file]
```

Response:
```json
{
  "success": true,
  "data": {
    "rawText": "Extracted text from PDF...",
    "parsedData": [
      {
        "qty": "1-5",
        "price_1": "R100.00",
        "price_2": "R150.00"
      }
    ],
    "pages": 3
  }
}
```

## Usage Examples

### Using Next.js API Routes

```typescript
// In your Next.js component or API route
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your protected logic here
}
```

### Using fetch in Client Components

```typescript
'use client';

// Login
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Get categories
async function getCategories() {
  const response = await fetch('/api/admin/categories');
  return response.json();
}

// Create category (requires authentication)
async function createCategory(data: Category) {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Upload PDF
async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/admin/extract-pdf', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}
```

## Data Models

### Category Model
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Category name
  description: string;     // Category description
  subcategories: SubCategory[];
  createdAt: Date;
  updatedAt: Date;
}
```

### SubCategory Model
```typescript
{
  id: string;
  name: string;
  description?: string;
  type?: 'table' | 'image-gallery';
  data?: PricingRow[];     // For table-based subcategories
  columns?: ColumnDefinition[];
  images?: ImagePage[];    // For image-based subcategories
  additionalNotes?: string[] | string;
}
```

### Admin Model
```typescript
{
  email: string;
  password: string;        // Hashed with bcrypt
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security

- All mutations (POST, PUT, DELETE) require admin authentication
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens are used for session management
- Sessions expire based on NextAuth configuration

## Development

### Running the Dev Server
```bash
bun run dev
```

### Testing API Endpoints

You can use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Example curl Commands

```bash
# Get all categories
curl http://localhost:3000/api/admin/categories

# Create category (with authentication)
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"id":"test","name":"Test Category","description":"Test","subcategories":[]}'

# Upload PDF
curl -X POST http://localhost:3000/api/admin/extract-pdf \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@path/to/your/file.pdf"
```

## PDF Extraction

The PDF extraction feature:
1. Accepts PDF file uploads
2. Extracts text using `pdf-parse`
3. Parses pricing information using regex patterns
4. Returns both raw text and parsed data
5. Admin can review and manually adjust before saving

### Customizing PDF Parser

The `parsePricingData` function in `/app/api/admin/extract-pdf/route.ts` can be customized based on your PDF format. Currently, it:
- Detects lines containing price information (R followed by numbers)
- Extracts quantities and descriptions
- Creates structured data objects

## Deployment

For production deployment:

1. Update `.env.local` with production values
2. Change `NEXTAUTH_SECRET` to a strong random string
3. Update `NEXTAUTH_URL` to your production URL
4. Use strong admin credentials
5. Consider adding rate limiting
6. Enable HTTPS
7. Set up proper CORS policies if needed

## Troubleshooting

### Database Connection Issues
- Verify MongoDB URI is correct
- Check network/firewall settings
- Ensure IP is whitelisted in MongoDB Atlas

### Authentication Issues
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set
- Check session configuration

### PDF Extraction Issues
- Ensure file is valid PDF
- Check file size limits
- Verify `pdf-parse` package is installed

## Support

For issues or questions, contact the development team.
