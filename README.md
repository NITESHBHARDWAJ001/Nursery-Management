# Plant Nursery Management & Ecommerce Web Application

A comprehensive MERN application for plant nursery operations and ecommerce with built-in automation for purchase orders, stock control, billing, and reporting. The frontend runs on React (CRA) with Tailwind and Recharts; the API proxy is configured to http://localhost:5000.

## Key Outcomes

- Less time generating purchase orders; the system drafts POs from low-stock signals.
- Fewer stockouts and overstocks through reorder points and velocity-aware suggestions.
- Faster invoicing and billing with one-click PDF/WhatsApp/email sharing.
- Better visibility via dashboards and exportable reports (CSV/PDF).

## Features

### Admin (Owner)
- Dashboard and analytics (sales, top products, low stock, trends).
- Plant/Inventory management (Add/Edit/Delete, stock adjustments, bulk import/export).
- Purchase Orders (POs)
  - Auto-drafted POs from low-stock thresholds and sales velocity.
  - Suggested quantities based on min/max levels and recent sell-through.
  - Supplier selection with saved lead times and last cost.
  - PO lifecycle: Draft → Sent → Partially Received → Received → Closed.
  - One-click share via email/WhatsApp; printable/PDF POs.
  - Goods receipt auto-updates stock and logs adjustments.
- Orders
  - Centralized order list with status updates and fulfillment workflow.
  - Automated billing and invoice generation (PDF).
- Reports
  - Sales by day/week/month, product performance, low-stock, inventory valuation.
  - Service requests summary and fulfillment metrics.
  - Export to CSV/PDF.
- Billing
  - Auto-calculated totals, tax, discounts, and invoice numbering.
  - Share invoices via email/WhatsApp and store PDFs for audit.

### User (Customer)
- Home and discovery
  - Featured plants, seasonal collections, and clear CTAs.
- Catalog browsing
  - Category and price filters, popularity sorting, and quick add-to-cart from cards.
- Product details
  - Images, descriptions, and care guidance with clear stock availability.
- Cart and checkout
  - Add/remove/update quantities with real-time totals; checkout handoff to backend.
- Orders and invoices
  - Order history with status tracking and downloadable invoices (PDF).
- Service requests
  - Request new varieties or on-site plantation with preferred dates and notes.
- Profile
  - Basic profile management and view of past orders and requests.
- Notifications
  - Email/SMS confirmations and updates when enabled by the backend (Nodemailer/Twilio).

## How Automation Reduces Work

- Purchase Orders
  - System monitors stock levels and sales velocity to auto-draft POs with suggested quantities.
  - Prefills supplier, last purchase price, and expected lead time.
  - Consolidates low-stock items across categories to reduce back-and-forth and spreadsheets.
- Stock Maintenance
  - Stock increments on goods receipt; decrements on order fulfillment.
  - Clear logs for adjustments and returns to minimize manual errors.
  - Low-stock alerts and reorder suggestions prevent emergency purchases.
- Reports and Bills
  - One-click invoices (PDF) with tax/discount rules applied automatically.
  - Scheduled and on-demand reports for sales and inventory; exportable for accounting.
  - Faster reconciliations with consistent document formats and IDs.
- Customer Self-Service
  - Users place orders and submit service requests online, reducing phone/email coordination.

## Tech Stack

- Frontend: React 18 (CRA), Tailwind CSS 3, Framer Motion, React Router v6, Axios, react-hot-toast, lucide-react, date-fns, Recharts.
- Backend: Node.js, Express.js, MongoDB with Mongoose.
- Auth: JWT with bcrypt.
- Notifications/Documents: Nodemailer, Twilio, PDFKit.

## Architecture Notes

- Frontend proxy: "proxy": "http://localhost:5000" in frontend/package.json.
- Charts: Recharts for dashboards.
- Dates/scheduling: date-fns for formatting and summaries.

## Setup

Backend
- npm install
- Create and configure .env (see .env.example).
- npm run dev

Frontend
- cd frontend
- npm install
- npm start
  - Runs at http://localhost:3000 and proxies API to http://localhost:5000

Build (frontend)
- npm run build
  - Outputs production build to frontend/build

## Project Structure (Frontend)

- src/components: Navbar, Footer, PlantCard, etc.
- src/pages/user/Home.js: Hero, features, featured plants, CTAs.
- src/context: CartContext for global cart state.
- src/utils/api: Axios instance and API helpers.

## API Integration

- Example: GET /plants?limit=8&sortBy=popular for featured list on Home.
- Tip: Use REACT_APP_* env vars if you need a custom baseURL in production.

## Workflows

- PO Automation
  1) Low-stock detection based on min levels and recent sales.
  2) Auto-draft PO with supplier and suggested quantities.
  3) Approve and send via email/WhatsApp (PDF).
  4) Receive goods → stock auto-updates → PO closes when complete.

- Billing
  1) Order created → totals/taxes auto-calculated.
  2) Invoice number assigned → PDF generated.
  3) Share and archive invoice; status updates reflect payment/fulfillment.

- Reporting
  - Sales and inventory dashboards with filters; export CSV/PDF.

- User Ordering
  1) Browse catalog with filters → add items to cart.
  2) Review cart → proceed to checkout → confirm order.
  3) Receive confirmation (email/SMS if enabled) → track order status.
  4) Download invoices (PDF) from order history.

- Service Request
  1) Submit request with preferred date, location, and notes.
  2) Receive confirmation and updates as status changes.
  3) Admin schedules/fulfills → user gets status and summary.

## Deployment

- Host frontend build (Netlify/Vercel/S3+CloudFront).
- Set Axios baseURL to your public API in production (not CRA proxy).

## License

MIT (or your organization’s policy).
