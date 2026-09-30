# 🚀 LanceNexus — Enterprise Freelancer Project Management Platform

An enterprise-grade, role-based Freelancer Project Management, Invoicing, and Milestone Tracking platform built with **Angular 22**, **PrimeNG 22**, **Angular Signals**, **RxJS**, **NestJS**, and **TypeScript**.

---

## 🏗️ Architecture Overview

The repository is structured as a full-stack monorepo:

```
Freelancer app/
├── frontend/                     # Angular 22 Client (PrimeNG, Signals, SCSS)
│   ├── src/app/
│   │   ├── core/                 # Singleton services, interceptors, guards, models
│   │   │   ├── guards/           # authGuard & guestGuard with RBAC
│   │   │   ├── interceptors/     # functional JWT authInterceptor
│   │   │   ├── models/           # TypeScript interfaces & DTOs
│   │   │   └── services/         # Signal-based reactive state services
│   │   ├── shared/               # Reusable UI components & pipes
│   │   │   ├── components/       # StatCardComponent, StatusBadgeComponent
│   │   │   └── pipes/            # CurrencyInrPipe (₹ formatting)
│   │   ├── features/             # Lazy-loaded feature modules
│   │   │   ├── auth/login/       # Reactive Form with validation & demo credentials
│   │   │   ├── dashboard/        # KPIs, Monthly Revenue Chart, Recent Sprints
│   │   │   ├── clients/          # Client CRM, search, filter, Add/Edit modal
│   │   │   ├── projects/         # Interactive tasks checklist, budget & progress
│   │   │   ├── quotations/       # Quotation generator with 18% GST & Printable PDF
│   │   │   ├── payments/         # Milestone payment tracking & UPI reconciliation
│   │   │   └── reports/          # Financial performance charts & CSV export
│   │   └── layout/               # AppLayout, Collapsible Sidebar, Header with notifications
│   └── styles.scss               # Global design tokens & PrimeIcons
│
└── backend/                      # NestJS REST API Server
    └── src/                      # Controllers, Services, Modules, DTOs
```

---

## ✨ Features Implemented

### 1. Phase 1 — Authentication & Security
- Reactive Forms with strict validation.
- Functional `authInterceptor` attaching Bearer JWT tokens with automated 401 redirection.
- Functional `authGuard` and `guestGuard` with Role-Based Access Control (RBAC): `FREELANCER`, `ADMIN`, `CLIENT`.
- 1-click Demo credentials for instant testing.

### 2. Phase 2 — Management Dashboard
- Enterprise KPIs: Total Projects (24), Active (8), Completed (16), Total Revenue (₹4,25,000), Pending Collections (₹75,000).
- Monthly revenue distribution chart.
- Real-time active sprints table with milestone progress bars and deadlines.
- Actionable pending payment alerts with 1-click reminder triggers.

### 3. Phase 3 — Client Management (CRM)
- Search and filter by client status (`Active`, `Lead`, `Completed`).
- Data table with client avatars, contact details, total billed revenue, and project counts.
- Add and Edit Client modal with Reactive Forms.

### 4. Phase 4 — Project Management & Sprints
- Projects with client association, contract budgets, and countdown deadlines.
- **Interactive Deliverables & Tasks Checklist**: Check/uncheck tasks dynamically recalculates project completion percentage in real time.
- Milestone breakdown with Paid vs Pending badges.
- Status transition workflow: Planning ➔ In Progress ➔ In Review ➔ Completed.

### 5. Phase 5 — Quotation System 💰
- Line-item estimate builder with quantity, rates, and automatic amount multiplication.
- Automatic Subtotal, **18% GST tax calculation**, discount handling, and Grand Total.
- Quotation workflow statuses: `Draft`, `Sent`, `Accepted`, `Rejected`, `Expired`.
- **Printable / Downloadable PDF invoice view** with custom print stylesheet.

### 6. Phase 6 — Milestone Payment Tracking 💳
- Summary cards: Total Collected vs Pending Collections vs Total Contract Value.
- Detailed invoice history table with payment methods (UPI, Bank Transfer, Stripe).
- 1-click "Mark Received" action that updates ledger state and reconciles invoices instantly.

### 7. Phase 7 — Analytics & Financial Reports 📊
- Fiscal 2026 Monthly Invoicing trend.
- Client lifetime value (LTV) share distribution.
- Project health & milestone delivery matrix.
- 1-click **Export to CSV** functionality.

### 8. Phase 8 — Reminders & Notifications 🔔
- Topbar notification bell with unread badge counter.
- Approaching deadline warnings and payment reminders.
- Role switcher (Freelancer / Admin / Client) in the topbar.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- Angular CLI `v22+`

### Running the Application

1. **Start the Angular Frontend:**
   ```bash
   npm run start:frontend
   ```
   Open your browser at `http://localhost:4200`.

2. **Start the NestJS Backend:**
   ```bash
   npm run start:backend
   ```
   REST API available at `http://localhost:3000/api`.

3. **Production Builds:**
   ```bash
   npm run build:frontend
   npm run build:backend
   ```

---

## 💼 Interview Talking Points

> *"I architected and developed a full-stack, role-based Freelancer Project Management Platform named **LanceNexus** using **Angular 22**, **TypeScript**, **Signals**, **PrimeNG**, and **NestJS**.*
>
> *Key technical highlights:*
> - *Replaced legacy NgRx boilerplate with **Angular Signals** (`signal`, `computed`) for reactive state management.*
> - *Implemented standalone components with lazy loading via modern routing.*
> - *Built functional HTTP interceptors for JWT token propagation and functional route guards for role-based permissions.*
> - *Designed an invoicing engine with dynamic GST tax calculations and print/PDF formatting.*
> - *Engineered real-time interactive task progress tracking and milestone reconciliation."*
