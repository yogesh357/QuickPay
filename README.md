# QuickPay — UPI QR Generation Service (MVP)

QuickPay is a service that allows merchants to integrate UPI QR-based payments into their websites using a simple API.

A merchant registers on QuickPay, adds their UPI ID, and receives a secure API key. When a customer clicks Checkout on the merchant's website, QuickPay generates a dynamic UPI QR code containing the merchant's UPI ID and the exact payment amount. The customer scans the QR code using any UPI application (Google Pay, PhonePe, Paytm, BHIM, Cred) to complete payment.

---

## 1. Core Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **QR Generation**: `qrcode` npm package
- **Validation**: Zod schema validation
- **Authentication**: JWT for merchant dashboard, secure API keys (`qp_live_...`) for payment API requests

---

## 2. API Reference

### Payment QR Creation Endpoint

`POST /api/v1/payments/create`

#### Headers
| Header | Value | Description |
|---|---|---|
| `Content-Type` | `application/json` | Required |
| `x-api-key` | `qp_live_...` | Merchant API Key (or `Authorization: Bearer <key>`) |

#### Request Body
```json
{
  "amount": 500,
  "order_id": "ORDER_101"
}
```

#### Backend Processing Steps:
1. Validates merchant API key against PostgreSQL database.
2. Identifies merchant and verifies their configured UPI ID and business name.
3. Converts INR amount into integer paise (e.g. `500` -> `50000` paise) and formats to 2 decimal places for UPI standard (`500.00`).
4. Generates standard UPI payment URI:
   `upi://pay?pa=merchant@upi&pn=MerchantName&am=500.00&cu=INR&tn=ORDER_101`
5. Generates high-resolution Base64 QR code image using `qrcode`.
6. Saves payment request history in PostgreSQL with audit timestamp.
7. Returns complete payment details and dynamic QR code.

#### Response (HTTP 201 Created)
```json
{
  "id": "c86e0df3-2d93-41bb-9461-9c173160b726",
  "order_id": "ORDER_101",
  "amount": 500,
  "amount_paise": 50000,
  "upi_id": "merchant@okhdfcbank",
  "business_name": "Apex Innovations",
  "qr_code": "data:image/png;base64,iVBORw0KGgo...",
  "upi_link": "upi://pay?pa=merchant%40okhdfcbank&pn=Apex%20Innovations&am=500.00&cu=INR&tn=ORDER_101",
  "created_at": "2026-11-01T06:30:00.000Z"
}
```

---

## 3. Database Schema (Drizzle ORM)

### `merchants` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, defaultRandom() | Unique merchant ID |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | Merchant login email |
| `password_hash` | `text` | NOT NULL | Bcrypt hashed password |
| `business_name` | `varchar(255)` | NOT NULL | Legal display name for UPI |
| `upi_id` | `varchar(255)` | NULLABLE | Merchant UPI ID (`name@bank`) |
| `api_key` | `varchar(255)` | UNIQUE, NOT NULL | Secret `qp_live_...` key |
| `created_at` | `timestamptz` | DEFAULT NOW() | Creation timestamp |
| `updated_at` | `timestamptz` | DEFAULT NOW() | Last update timestamp |

### `payment_requests` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, defaultRandom() | Unique payment request ID |
| `merchant_id` | `uuid` | FK -> merchants(id) | Linked merchant |
| `order_id` | `varchar(255)` | NOT NULL | Merchant order reference |
| `amount_paise` | `integer` | NOT NULL | Exact amount stored in paise |
| `upi_id` | `varchar(255)` | NOT NULL | Snapshot of destination UPI ID |
| `business_name` | `varchar(255)` | NOT NULL | Snapshot of payee business name |
| `upi_link` | `text` | NOT NULL | Full `upi://pay` URI string |
| `qr_code` | `text` | NOT NULL | Base64 Data URL PNG image |
| `created_at` | `timestamptz` | DEFAULT NOW() | Generation timestamp |

---

## 4. Pages Included

1. **Landing Page** (`/`): High-converting overview of QuickPay, single-endpoint simplicity, interactive code block, supported UPI apps.
2. **Merchant Registration & Login** (`/register`, `/login`): Secure onboarding with automatic API key generation.
3. **Merchant Dashboard** (`/dashboard`): Metrics, volume overview, destination UPI status, and payment request history table with instant QR preview modals.
4. **Merchant Settings** (`/dashboard/settings`): Add and update business name and UPI ID with real-time format validation.
5. **API Keys & Integration Guide** (`/dashboard/integration`): Show/hide API key, copy key, roll/regenerate key, copyable snippets for cURL, Node.js Fetch, and Python.
6. **Hosted QR Checkout Page** (`/checkout/[id]`): Hosted checkout page displaying merchant name, order ID, amount in ₹, dynamically rendered UPI QR code, instruction text, and direct mobile deep links.
7. **Sample Merchant Store** (`/demo-store`): Complete simulation of a merchant store integrating QuickPay. Select products, checkout, and view generated QR code and API payloads live.

---

## 5. Running the Application

### Prerequisites
- Node.js v18+ (tested on v24.18.1)
- PostgreSQL database running on `localhost:5432`

### Start Backend
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5001
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 6. End-to-End Demo Steps

1. **Register**: Visit `http://localhost:3000/register` and create an account with business name "Apex Tech" and UPI ID `apex@okhdfcbank`.
2. **Inspect API Key**: Navigate to **API Keys & Integration** (`/dashboard/integration`) to view or copy your live API key (`qp_live_...`).
3. **Open Sample Store**: Click **Sample Checkout Demo** (`/demo-store`).
4. **Checkout**: Select an item (e.g., QuickPay Ceramic Dev Mug — ₹499) and click **Pay with QuickPay**.
5. **Dynamic QR Code**: See the QR generated instantly with the pre-filled UPI URI `upi://pay?pa=apex@okhdfcbank&pn=Apex%20Tech&am=499.00&cu=INR&tn=ORDER_...`.
6. **Payment History**: Go back to the **Merchant Dashboard** (`/dashboard`) to view the newly logged payment request in the PostgreSQL history table.
