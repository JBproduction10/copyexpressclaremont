# CopyExpress Claremont - Professional Printing Services

A modern, full-stack web application for CopyExpress Claremont, featuring a comprehensive admin dashboard for managing services, pricing, content, and customer communications.

🌐 **Live Site**: [https://copyexpressclaremont.com](https://copyexpressclaremont.com)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Admin Dashboard](#-admin-dashboard)
- [API Routes](#-api-routes)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

## ✨ Features

### Customer-Facing Features

- Dynamic Hero Section with customizable background images and CTAs
- Services Display with real-time updates
- Interactive Pricing Tables with search and pagination
- Image Galleries for visual catalogs (stamps, designs, etc.)
- Contact Form with email notifications to both admin and customers
- Responsive Design optimized for mobile, tablet, and desktop
- SEO Optimized with structured data, meta tags, and sitemap

### Admin Dashboard Features

- Secure Authentication with NextAuth.js (credential-based)
- Category Management with search, pagination, and CRUD operations
- Pricing Editor with dynamic column management
- Image Gallery Manager with Cloudinary integration
- Services Manager with drag-and-drop reordering
- Content Managers for About, Contact, and Hero sections
- Email Settings Configuration with test email functionality
- Activity Logging for all admin actions
- Import/Export functionality for data backup
- Real-time Updates across all admin panels

## 🛠️ Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn/ui components
- Lucide React icons
- React Hook Form + Zod validation
- Framer Motion animations

### Backend

- Next.js API Routes
- MongoDB with Mongoose ODM
- NextAuth.js for authentication
- Cloudinary for image storage
- Nodemailer for email functionality
- bcryptjs for password hashing

### Development Tools

- ESLint for code linting
- TypeScript for type safety
- tsx for running TypeScript scripts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/copyexpress-claremont.git
   cd copyexpress-claremont
   Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env
# Edit .env with your credentials (see Environment Variables)
Run database seeds

bash
npm run seed:all
Start development server

bash
npm run dev
Visit http://localhost:3000 to see the application.

🔐 Environment Variables
Create a .env file in the root directory with the following variables:

env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/copyexpressclaremont

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@copyexpressclaremont.com
Obtaining Credentials
MongoDB Atlas:

Create account at mongodb.com/cloud/atlas

Create cluster and database user

Get connection string from "Connect" → "Connect your application"

Cloudinary:

Sign up at cloudinary.com

Find credentials in Dashboard → Settings → API Keys

Gmail App Password:

Enable 2FA on your Google account

Visit myaccount.google.com/apppasswords

Generate app password for "Mail"

🗄️ Database Setup
Seeding the Database
The project includes several seed scripts to populate initial data:

bash
# Seed all data at once
npm run seed:all

# Or seed individually
npm run seed:admin      # Create admin user
npm run seed:pricing    # Add pricing categories
npm run seed:services   # Add services
npm run seed:contact    # Add contact information
npm run seed:hero       # Add hero section
npm run seed:email      # Configure email settings
Default Admin Credentials
After running seed:admin:

Email: admin@copyexpressclaremont.com

Password: admin123

⚠️ Important: Change these credentials immediately after first login!

📁 Project Structure
text
copyexpress-claremont/
├── app/
│   ├── (main)/              # Customer-facing pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx
│   │   ├── login/
│   │   └── register/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── services/
│   │   ├── contact/
│   │   ├── about/
│   │   ├── hero/
│   │   ├── email-settings/
│   │   └── upload/
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── admin/               # Admin components
│   │   ├── AboutManager.tsx
│   │   ├── CategoryList.tsx
│   │   ├── ContactManager.tsx
│   │   ├── DataEditor.tsx
│   │   ├── EmailSettingsManager.tsx
│   │   ├── HeroManager.tsx
│   │   ├── ImageGalleryManager.tsx
│   │   └── ServiceManager.tsx
│   ├── ui/                  # Shadcn components
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── Pricing.tsx
│   ├── PricingTable.tsx
│   ├── Services.tsx
│   └── StructuredData.tsx
├── hooks/
│   ├── useAbout.ts
│   ├── useCategories.ts
│   ├── useContact.ts
│   ├── useDataEditor.ts
│   ├── useEmailSettings.ts
│   ├── useHero.ts
│   ├── useNotification.ts
│   └── useServices.ts
├── lib/
│   ├── models/              # Mongoose schemas
│   │   ├── About.ts
│   │   ├── ActivityLog.ts
│   │   ├── Category.ts
│   │   ├── Contact.ts
│   │   ├── EmailSettings.ts
│   │   ├── Hero.ts
│   │   ├── Service.ts
│   │   └── User.ts
│   ├── auth-middleware.ts
│   ├── auth.config.ts
│   ├── cloudinary.ts
│   ├── mongodb.ts
│   ├── realtime-events.ts
│   └── utils.ts
├── providers/
│   ├── providers.tsx
│   └── SessionProvider.tsx
├── scripts/                 # Database seed scripts
│   ├── seedPricingData.ts
│   ├── seedServices.ts
│   ├── seedContact.ts
│   ├── seedHero.ts
│   └── seedEmailSettings.ts
├── types/
│   ├── index.ts
│   └── next-auth.d.ts
├── public/
│   ├── logo.png
│   └── copyexpresshero.jpeg
├── .env
├── package.json
├── tailwind.config.ts
└── tsconfig.json
🎛️ Admin Dashboard
Access the admin dashboard at /admin after logging in.

Dashboard Sections
Dashboard

Overview statistics

Quick actions

Recent activity

Services

Create, edit, delete services

Drag-and-drop reordering

Toggle visibility

Icon selection

Categories

Manage pricing categories

Search functionality

Pagination (4 per page)

Subcategory management

Data Editor

Edit pricing tables

Dynamic column management

Add/remove rows

Image gallery management

Auto-save functionality

About Section

Edit main content

Manage feature list

Update statistics

Drag-and-drop feature reordering

Contact Section

Update contact information

Manage contact methods

Reorder contact items

Icon customization

Hero Section

Edit hero text

Upload background image

Configure CTA buttons

Toggle visibility

Email Settings

Configure SMTP settings

Set email templates

Test email functionality

Toggle test mode

Import/Export

Export all data as JSON

Import data from backup

Data validation

🔌 API Routes
Authentication
POST /api/auth/register - Register new admin

POST /api/auth/[...nextauth] - NextAuth endpoints

Categories
GET /api/categories - List categories (paginated)

POST /api/categories - Create category

GET /api/categories/[id] - Get single category

PUT /api/categories/[id] - Update category

DELETE /api/categories/[id] - Delete category

Services
GET /api/services - List services

POST /api/services - Create service

PUT /api/services/[id] - Update service

DELETE /api/services/[id] - Delete service

PUT /api/services/reorder - Reorder services

Content Management
GET /api/about - Get about content

PUT /api/about - Update about content

GET /api/contact-info - Get contact info

PUT /api/contact-info - Update contact info

GET /api/hero - Get hero content

PUT /api/hero - Update hero content

Email
POST /api/contact - Submit contact form

GET /api/email-settings - Get email config

POST /api/email-settings - Save email config

PUT /api/email-settings - Send test email

Images
POST /api/upload - Upload image to Cloudinary

DELETE /api/upload - Delete image from Cloudinary

Activity Logs
GET /api/activity-logs - List activity logs

Import/Export
GET /api/import-export/export - Export all data

POST /api/import-export/import - Import data

All admin routes require authentication via NextAuth.

📦 Deployment
Vercel (Recommended)
Push to GitHub

bash
git add .
git commit -m "Initial commit"
git push origin main
Deploy to Vercel

Visit vercel.com

Import your repository

Add environment variables

Deploy

Configure Domain

Add custom domain in Vercel settings

Update DNS records

Update NEXTAUTH_URL environment variable

Environment Variables on Vercel
Add all variables from your .env file to Vercel:

Project Settings → Environment Variables

Add each variable individually

Redeploy after adding variables

📜 Scripts
bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Seeds
npm run seed:admin      # Create admin user
npm run seed:pricing    # Seed pricing data
npm run seed:services   # Seed services
npm run seed:contact    # Seed contact info
npm run seed:hero       # Seed hero section
npm run seed:email      # Seed email settings
npm run seed:all        # Run all seeds
🔒 Security Best Practices
Change default admin credentials immediately after first login

Use strong passwords for all accounts

Enable 2FA on MongoDB Atlas and Cloudinary

Use environment variables for all sensitive data

Keep dependencies updated regularly

Review activity logs periodically

Backup data regularly using export feature

🎨 Customization
Changing Colors
Edit tailwind.config.ts:

typescript
theme: {
  extend: {
    colors: {
      primary: '#FF6B35',    // Your brand color
      secondary: '#1A1D2E',  // Secondary color
      // ... other colors
    }
  }
}
Adding New Services
Use Admin Dashboard → Services → Add Service

Or seed directly via scripts/seedServices.ts

Modifying Email Templates
Edit templates in:

app/api/contact/route.ts - Contact form emails

Admin Dashboard → Email Settings - Subject lines

🐛 Troubleshooting
Common Issues
MongoDB Connection Error

Solution: Verify MONGODB_URI and whitelist IP in MongoDB Atlas

Image Upload Fails

Solution: Check Cloudinary credentials and API limits

Email Not Sending

Solution: Verify EMAIL_USER and EMAIL_PASSWORD (use app password for Gmail)

NextAuth Error

Solution: Ensure NEXTAUTH_SECRET is set and NEXTAUTH_URL matches your domain

Build Errors

bash
# Clear cache and rebuild
rm -rf .next
npm run build
📝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is proprietary software for CopyExpress Claremont.

👨‍💻 Developer
Built with ❤️ for CopyExpress Claremont
For support or inquiries: info@copyexpressclaremont.com

🔄 Version History
v1.0.0 - Initial release

Customer-facing website

Admin dashboard

Category and pricing management

Image galleries

Email integration

Real-time updates

🙏 Acknowledgments
Next.js - React framework

Shadcn/ui - UI components

Cloudinary - Image hosting

MongoDB - Database

Vercel - Hosting platform