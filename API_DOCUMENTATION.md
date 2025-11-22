# Admin Backend API Documentation

## Overview

This backend provides a complete CRUD (Create, Read, Update, Delete) API for managing pricing data with NextAuth authentication and PDF extraction capabilities.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses NextAuth with credentials provider. Admin must be authenticated to perform write operations.

### Login

**Endpoint:** `POST /api/auth/signin`

**Request Body:**
```json
{
  "email": "admin@copyexpress.com",
  "password": "ChangeMeInProduction123!"
}
```

### Session Management

NextAuth manages sessions using JWT tokens. Include the session cookie in all authenticated requests.

---

## Database Seeding

### Seed Database

**Endpoint:** `POST /api/admin/seed`

**Description:** Seeds the database with initial admin user and pricing categories from `pricingData.ts`

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "admin": {
      "email": "admin@copyexpress.com",
      "name": "Admin User"
    },
    "categoriesCount": 20
  }
}
```

### Clear Database

**Endpoint:** `DELETE /api/admin/seed`

**Description:** Clears all data from the database (use with caution!)

**Response:**
```json
{
  "success": true,
  "message": "Database cleared successfully"
}
```

---

## Category Management

### Get All Categories

**Endpoint:** `GET /api/admin/categories`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
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

### Get Single Category

**Endpoint:** `GET /api/admin/categories/:id`

**Authentication:** Not required

**Parameters:**
- `id` (string): Category ID (e.g., "a4-a3")

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "id": "a4-a3",
    "name": "A4 & A3 Prints",
    "description": "Professional A4 & A3 printing options",
    "subcategories": [...]
  }
}
```

### Create Category

**Endpoint:** `POST /api/admin/categories`

**Authentication:** Required

**Request Body:**
```json
{
  "id": "new-category",
  "name": "New Category",
  "description": "Category description",
  "subcategories": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "id": "new-category",
    "name": "New Category",
    "description": "Category description",
    "subcategories": []
  }
}
```

### Update Category

**Endpoint:** `PUT /api/admin/categories/:id`

**Authentication:** Required

**Parameters:**
- `id` (string): Category ID

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "subcategories": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "id": "new-category",
    "name": "Updated Category Name",
    "description": "Updated description"
  }
}
```

### Delete Category

**Endpoint:** `DELETE /api/admin/categories/:id`

**Authentication:** Required

**Parameters:**
- `id` (string): Category ID

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Subcategory Management

### Add Subcategory

**Endpoint:** `POST /api/admin/categories/:id/subcategories`

**Authentication:** Required

**Parameters:**
- `id` (string): Category ID

**Request Body:**
```json
{
  "id": "new-subcategory",
  "name": "New Subcategory",
  "description": "Subcategory description",
  "type": "table",
  "data": [...],
  "columns": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated category with new subcategory
  }
}
```

### Update Subcategory

**Endpoint:** `PUT /api/admin/categories/:id/subcategories/:subcategoryId`

**Authentication:** Required

**Parameters:**
- `id` (string): Category ID
- `subcategoryId` (string): Subcategory ID

**Request Body:**
```json
{
  "name": "Updated Subcategory Name",
  "data": [...],
  "columns": [...]
}
```

### Delete Subcategory

**Endpoint:** `DELETE /api/admin/categories/:id/subcategories/:subcategoryId`

**Authentication:** Required

**Parameters:**
- `id` (string): Category ID
- `subcategoryId` (string): Subcategory ID

**Response:**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully"
}
```

---

## PDF Extraction

### Extract Data from PDF

**Endpoint:** `POST /api/admin/extract-pdf`

**Authentication:** Required

**Request:** Multipart form data

**Form Fields:**
- `file`: PDF file

**Example using fetch:**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/admin/extract-pdf', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rawText": "Extracted text from PDF...",
    "parsedData": [
      {
        "qty": "1 - 20",
        "price_1": "R10.0",
        "price_2": "R15.0"
      }
    ],
    "pages": 3
  }
}
```

---

## Data Models

### Category Model

```typescript
{
  id: string;              // Unique identifier (e.g., "a4-a3")
  name: string;            // Display name
  description: string;     // Description
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
  data?: PricingRow[];              // For table type
  columns?: ColumnDefinition[];     // For table type
  images?: ImagePage[];             // For image-gallery type
  additionalNotes?: string[] | string;
}
```

### PricingRow Model

```typescript
{
  qty?: string;
  discount?: string;
  service?: string;
  [key: string]: string | undefined;  // Dynamic pricing columns
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   Create `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ADMIN_EMAIL=admin@copyexpress.com
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Seed the database:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

---

## Usage Examples

### Example: Update Pricing Data

```javascript
// 1. Login first
const loginResponse = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@copyexpress.com',
    password: 'your_password'
  })
});

// 2. Update a category
const updateResponse = await fetch('/api/admin/categories/a4-a3', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated A4 & A3 Prints',
    description: 'New description'
  })
});

const result = await updateResponse.json();
```

### Example: Extract PDF and Auto-populate

```javascript
// 1. Upload PDF
const formData = new FormData();
formData.append('file', pdfFile);

const extractResponse = await fetch('/api/admin/extract-pdf', {
  method: 'POST',
  body: formData
});

const { data } = await extractResponse.json();

// 2. Use extracted data to update category
const updateResponse = await fetch('/api/admin/categories/a4-a3', {
  method: 'PUT',
  body: JSON.stringify({
    subcategories: [{
      id: 'extracted-data',
      name: 'From PDF',
      data: data.parsedData
    }]
  })
});
```

---

## Security Notes

- All write operations require authentication
- Passwords are hashed using bcrypt
- JWT tokens are used for session management
- Change default admin credentials in production
- Use HTTPS in production
- Set strong `NEXTAUTH_SECRET` in production

---

## Additional Features

### Manual Update Flow
1. Admin logs in via NextAuth
2. Fetches current pricing data
3. Edits data manually in form
4. Submits updated data via API

### PDF Auto-population Flow
1. Admin logs in via NextAuth
2. Uploads PDF file to `/api/admin/extract-pdf`
3. Reviews extracted data
4. Optionally edits extracted data
5. Submits to update pricing via API

---

## Support

For issues or questions, please contact the development team.
