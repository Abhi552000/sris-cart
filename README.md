# SrisCart - Real-Time Grocery & Store Delivery Platform

SrisCart is a modern, high-performance web application designed for express grocery and store deliveries. It features client-side product browsing, address range boundary checks, and a full-stack real-time tracking system integrating **Leaflet.js** and **OpenStreetMap (OSM)**.

---

## 🚀 Key Features Catalog (Why & When Implemented)

### 1. 📍 4 km Delivery Range Check (Baghbazar, Kolkata)
* **When**: Implemented during the shipping address configuration updates.
* **Why**: To prevent out-of-bounds orders and guarantee delivery SLA times, we enforce a strict 4.0 km range boundary around the primary store hub (`22.6030, 88.3660`).
* **Details**:
  - Displays a custom delivery zone circle (4 km radius) using Leaflet.js maps.
  - Allows users to pin their exact location using a draggable marker or the Geolocation API.
  - Enforces distance validation in the checkout cart and prevents checkout for addresses out of bounds.

### 2. 🚲 Rider Panel Dashboard (`/rider`) & Geolocation
* **When**: Implemented during the Rider ecosystem release.
* **Why**: To isolate logistic agent workflows, allowing riders to register, manage their duty status, and handle order acceptances separately.
* **Details**:
  - **Auto Geolocation**: Synchronizes coordinates dynamically to MongoDB.
  - **Manual Pins**: Allows riders to click on the map to manually set and update their coordinates.
  - **Simulation**: Drags simulated riders in real-time along street routes, writing updated coordinates (`riderLatitude`, `riderLongitude`) straight to the database.

### 3. 🔄 Database-Synchronized Live Tracking
* **When**: Implemented to replace client-side mock timers.
* **Why**: To give buyers an accurate, real-time representation of where their delivery agent is by pulling live coordinates directly from the database.
* **Details**:
  - Refactored buyer track-order page (`/track-order/:id`) utilizing polling updates (every 3 seconds).
  - Renders live driver marker updates dynamically based on coordinates retrieved from MongoDB, creating a fully synchronized full-stack connection.

### 4. 🔗 Stepped Delivery Timeline
* **When**: Implemented during status flow normalization.
* **Why**: To establish a clean, case-insensitive, state-based progression that splits responsibilities between sellers and riders.
* **Details**:
  - **Seller Role**: Only performs inventory confirmation, changing status from `Order Placed` to `Order Accepted`. Once accepted, the seller can no longer modify the status.
  - **Rider Role**: Handles the logistics. The rider accepts the job (`Rider Assigned`), marks it pick-up ready (`Out for Delivery`) to start simulation, and completes delivery (`Delivered`).

### 5. 🛠️ Admin Control Room Panel (`/admin`)
* **When**: Implemented to enforce user activation controls.
* **Why**: To allow platform administrators to monitor registrations, view sales metrics, and block compromised or deactivated accounts instantly from accessing APIs.
* **Details**:
  - Enforces dynamic account activation/deactivation. Deactivated users, sellers, or riders are blocked from accessing authenticated APIs instantly.
  - **Live Dispatch Map**: Plots physical locations of all store sellers (orange pins) and active riders (green/grey bike markers) dynamically.

### 6. 🛣️ React Router Nested Routing
* **When**: Implemented during the dashboard refactoring phase.
* **Why**: Replaced heavy monolithic dashboard screens with layout containers and nested child routes (e.g. `/rider/profile`, `/admin/users`), improving modularity, reducing file sizes, and matching standard React architectures.

### 7. 🔑 Dual-Token Authentication Flow (Access + Refresh Tokens)
* **When**: Implemented during security optimization phase.
* **Why**: To meet industry-grade security standards. Avoids exposing long-lived tokens to potential session hijacks by separating validation into short-lived access credentials and long-lived refresh tokens.
* **Details**:
  - **Access Token**: Short-lived (expires in 15 minutes) for standard API requests.
  - **Refresh Token**: Long-lived (7 days) for generating new access tokens.
  - **Database Persistence**: Persists the `refreshToken` inside MongoDB for each partner type (`User`, `Seller`, and `Rider`).
  - **Silent Token Rotation**: An Axios interceptor catches `401 TOKEN_EXPIRED` errors, blocks requests, silently requests new access tokens from the role-specific `/refresh` endpoints, and retries original requests transparently.

### 8. 📊 Mongoose Database Query Indexing
* **When**: Implemented during query optimizations.
* **Why**: To keep database read latencies low under scale.
* **Details**:
  - Added indexes on `Order` (`userId`, `riderId`, `status`) and partner schemas (`status` field) to ensure rapid lookups and filters.

### 9. 🛡️ Express Security & Performance (Helmet, Compression, Logger, Global Errors)
* **When**: Implemented during backend optimization.
* **Why**: To secure HTTP headers, compress JSON payloads, log request latency, and centralize controller exception formatting.
* **Details**:
  - **Helmet**: Sets secure HTTP response headers.
  - **Compression**: Compresses payload responses for faster network transit.
  - **Request Logger**: Prints HTTP method, path, status, and latency stats to the console.
  - **Global Error Handler**: Standardizes exception formats (e.g., duplicate email keys, mongoose validation errors).

### 10. ⚡ Vite Code Splitting & Dynamic Lazy Loading
* **When**: Added during performance profiling.
* **Why**: To ensure instantaneous storefront loading, we package heavy administrative and partner components into separate, on-demand code chunks.
* **Details**:
  - Reduced the primary JavaScript chunk size by **81.7%** (from **682.79 kB** to **125.01 kB**).
  - Uses `React.lazy` to dynamically load dashboard subcomponents on request.

### 11. 🔄 Fallback Loading Spinners & Suspense Boundaries
* **When**: Integrated alongside dynamic lazy loading.
* **Why**: Prevents layout layout-shifts and blank states. While dynamic route chunks are fetched, a clean, centered loader spinner animates to transition the viewport smoothly.

### 12. 🎡 Audio-Synthesized Loyalty Spin Wheel
* **When**: Integrated as a client reward mechanic.
* **Why**: Boosts platform gamification and user retention by letting buyers spin for coupons.
* **Details**:
  - Rendered entirely on HTML5 Canvas.
  - Uses the **Web Audio API** to synthesize oscillator tones directly in the browser (ticking sounds on segment transitions, a deep arpeggio on try-again slots, and C-major chord arpeggios on winning spins).
  - Restricts spins using a strict 24-hour local storage timestamp check.

### 13. 🤖 AI Chat Assistant (Shopping Companion)
* **When**: Added as a client-side shopping helper.
* **Why**: Elevates standard catalog navigation by offering buyers interactive AI search queries, automated recommendations, and direct cart insertions.

---

## 🛠️ Tech Stack

- **Client**: React (TypeScript), Vite, Tailwind CSS, Leaflet.js, Redux Toolkit, Lucide React, React Hot Toast.
- **Server**: Node.js, Express, Mongoose (MongoDB), Stripe, Cookie Parser, JWT Auth, Helmet, Compression.

---

## 🔑 Tester Login Credentials

Use the following pre-configured credentials to test all roles in the delivery ecosystem:

### 1. Buyer Accounts (Standard Users)
- **Email**: `abhisheksingh552000@gmail.com`
- **Password**: `12345678` *(or register a new user in the app)*

### 2. Seller Account (Store Manager)
- **Path**: `/seller`
- **Email**: `admin@sriscart.com`
- **Password**: `admin123`

### 3. Rider Accounts (Delivery Agents)
- **Path**: `/rider`
- **Email**: `rider1@sriscart.com` / `rider123` (Rahul) or `rider2@sriscart.com` / `rider123` (Amit)

### 4. Admin Account (Platform Control Room)
- **Path**: `/admin`
- **Email**: `admin@sriscart.com`
- **Password**: `admin123` *(Static credentials, no registration required)*

---

## 📋 Full Walkthrough Testing Process

1. **Add Address**: Log in as a Buyer, allow Geolocation or pin your coordinates inside the 4.0 km circle around Baghbazar Kolkata Ghat, and save the address.
2. **Place Order**: Add products to cart, select your address, choose COD, and checkout.
3. **Accept Order (Seller)**: Go to `/seller`, find the order, and choose `Order Accepted`.
4. **Accept Job & Simulate (Rider)**: Go to `/rider`, accept the job, click `Start Transit Simulation` to watch coordinates upload dynamically.
5. **Track Live (Buyer)**: Go to the buyer's orders list, select `Track Order`, and observe the bike marker move along the map in real-time.
6. **Mark Delivered**: Click `Mark Order Delivered` on the Rider dashboard; watch the buyer timeline update instantly to `Delivered`.
