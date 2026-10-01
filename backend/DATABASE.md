# LanceNexa Database Architecture (PostgreSQL & TypeORM)

This document describes the PostgreSQL database schema, TypeORM configuration, entity relationships, and operational instructions for LanceNexa.

---

## 1. Architecture Overview

* **Engine**: PostgreSQL 16+
* **ORM**: TypeORM with NestJS (`@nestjs/typeorm`)
* **Schema Synchronization**: `synchronize: true` for automatic schema migrations during development
* **Connection Support**:
  * Individual credentials (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`)
  * Unified `DATABASE_URL` (for Supabase, Neon, Railway, Render, or AWS RDS)
  * SSL auto-negotiation (`rejectUnauthorized: false` for cloud providers)

---

## 2. Entity Model & Schema

### `users`
* `id` (`uuid`, Primary Key)
* `name` (`varchar(150)`)
* `email` (`varchar(150)`, Unique, Indexed)
* `password` (`varchar`, Bcrypt hash)
* `role` (`varchar(50)`, `'FREELANCER' | 'CLIENT' | 'ADMIN'`)
* `companyName` (`varchar(150)`, nullable)
* `title` (`varchar(150)`, nullable)
* `hourlyRate` (`numeric(10,2)`, nullable)
* `phone` (`varchar(50)`, nullable)
* `avatarUrl` (`text`, nullable)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `clients`
* `id` (`uuid`, Primary Key)
* `name` (`varchar(150)`)
* `company` (`varchar(150)`)
* `email` (`varchar(150)`)
* `phone` (`varchar(50)`, nullable)
* `status` (`varchar(50)`, `'Active' | 'Inactive'`)
* `totalBilled` (`numeric(12,2)`)
* `totalPaid` (`numeric(12,2)`)
* `pendingAmount` (`numeric(12,2)`)
* `activeProjects` (`int`)
* `avatarUrl` (`text`, nullable)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `projects`
* `id` (`uuid`, Primary Key)
* `name` (`varchar(200)`)
* `client` (`varchar(150)`)
* `status` (`varchar(50)`, `'Planning' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold'`)
* `deadline` (`varchar(100)`, nullable)
* `budget` (`numeric(12,2)`)
* `spent` (`numeric(12,2)`)
* `progress` (`int`, 0 to 100)
* `description` (`text`, nullable)
* `category` (`varchar(100)`, nullable)
* `tasksCount` (`int`)
* `completedTasks` (`int`)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `tasks`
* `id` (`uuid`, Primary Key)
* `title` (`varchar(250)`)
* `projectId` (`varchar(150)`, nullable)
* `projectName` (`varchar(200)`, nullable)
* `client` (`varchar(150)`, nullable)
* `dueDate` (`varchar(100)`, nullable)
* `priority` (`varchar(50)`, `'Low' | 'Medium' | 'High' | 'Urgent'`)
* `status` (`varchar(50)`, `'Pending' | 'In Progress' | 'Completed'`)
* `estimatedHours` (`int`)
* `loggedHours` (`int`)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `quotations`
* `id` (`uuid`, Primary Key)
* `quoteNumber` (`varchar(50)`, Unique)
* `clientId` (`varchar(150)`, nullable)
* `clientName` (`varchar(150)`)
* `clientEmail` (`varchar(150)`)
* `date`, `validUntil` (`varchar(50)`)
* `subtotal` (`numeric(12,2)`)
* `gstRate` (`numeric(5,2)`, default 18%)
* `gstAmount` (`numeric(12,2)`)
* `totalAmount` (`numeric(12,2)`)
* `status` (`varchar(50)`, `'Draft' | 'Sent' | 'Approved' | 'Rejected'`)
* `notes` (`text`, nullable)
* `items` (`jsonb`)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `invoices`
* `id` (`uuid`, Primary Key)
* `invoiceNumber` (`varchar(50)`, Unique)
* `clientId` (`varchar(150)`, nullable)
* `clientName`, `clientEmail` (`varchar(150)`)
* `projectId` (`varchar(150)`, nullable)
* `issueDate`, `dueDate` (`varchar(50)`)
* `subtotal`, `taxAmount`, `totalAmount`, `paidAmount`, `balanceAmount` (`numeric(12,2)`)
* `status` (`varchar(50)`, `'Draft' | 'Sent' | 'Paid' | 'Overdue'`)
* `paymentMethod` (`varchar(50)`, nullable)
* `items` (`jsonb`)
* `createdAt`, `updatedAt` (`timestamp with time zone`)

### `payments`
* `id` (`uuid`, Primary Key)
* `invoiceId` (`varchar(150)`)
* `amount` (`numeric(12,2)`)
* `paymentMethod` (`varchar(50)`, `'UPI' | 'Bank Transfer' | 'Card'`)
* `referenceNumber` (`varchar(150)`)
* `transactionDate` (`varchar(50)`)
* `status` (`varchar(50)`, `'Completed' | 'Pending'`)
* `createdAt` (`timestamp with time zone`)

---

## 3. How to Start the Database

### Option A: Using Docker (One Command)
If you have Docker Desktop installed, start the database with:
```bash
docker compose up -d
```
This automatically boots PostgreSQL 16 on port `5432` with volume persistence.

### Option B: Local PostgreSQL Server
If you have PostgreSQL installed on your machine:
1. Ensure the PostgreSQL service is running.
2. Create the database:
   ```sql
   CREATE DATABASE freelancehub_db;
   ```
3. Update `backend/.env` with your username & password if different from defaults:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=freelancehub_db
   ```

### Option C: Cloud PostgreSQL (Neon / Supabase / Render / Railway)
Simply set `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
DB_SSL=true
```

---

## 4. Automatic Seeding

Upon first boot, the `DatabaseSeedService` automatically verifies whether tables are populated. If empty, it seeds:
* **Freelancer Account**: `prem@lancenexa.dev` (pass: `freelancer123`)
* **Client Account**: `rahul@abcpvtltd.com` (pass: `client123`)
* **Admin Account**: `admin@lancenexa.dev` (pass: `admin123`)
* Realistic client records, active projects, tasks, GST quotations, and invoices.

---

## 5. Running the Backend REST API

```bash
# From workspace root:
npm run start:backend

# Or from backend directory:
cd backend
npm run start:dev
```
The REST API will launch at `http://localhost:3000/api`.
