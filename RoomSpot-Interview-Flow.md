# RoomSpot Application Flow & Interview Summary

## 1. Project Overview
RoomSpot is a room rental and room finder platform designed to connect tenants with available rooms and rental properties. The application has two main user roles:

- Admin
- Tenant/User

The app is built as a role-based system where each user sees different experiences and dashboard access.

---

## 2. Main User Flow

### A. Visitor Flow
1. Visitor opens the home page
2. Searches rooms by location, budget, and type
3. Views room details and property information
4. If interested, they can register or login

### B. Register / Login Flow
1. User opens /login or /register
2. For new user: register account
3. For existing user: login with email and password
4. System checks role
   - admin goes to /admin/dashboard
   - tenant/user goes to /dashboard

### C. Protected Access
- Non-logged-in users cannot access dashboard pages
- Logged-in users cannot open login/register page again
- They are redirected to their correct dashboard automatically

---

## 3. Role-Based Dashboard Flow

### Admin Flow
Admin login flow:

- Email and password verified
- Role = admin
- Redirect to /admin/dashboard

Admin dashboard contains:
- Overview
- Rooms
- Tenants
- Rent & payments
- Complaints
- Messages

Admin responsibilities:
- Manage rooms
- View tenant records
- Review payment information
- Update UPI / payment settings
- Resolve complaints
- Review inquiries and leads

### Tenant/User Flow
Tenant login flow:

- Email and password verified
- Role = tenant
- Redirect to /dashboard

Tenant dashboard contains:
- Overview
- My room
- Payments
- Complaints
- Messages

Tenant responsibilities:
- View room details
- Check payment status
- Pay pending dues
- Raise complaints
- Communicate with admin / manager

---

## 4. Room Booking / Inquiry Flow
This is the most important business flow for the application.

### Correct Flow
1. User opens RoomSpot home page
2. Browses properties
3. Searches property by location or budget
4. Clicks a property / room
5. If not logged in, system redirects to login/register
6. User logs in/registers as tenant
7. User sends booking request / room inquiry
8. Request is saved to the backend database
9. Admin sees the user request in the admin dashboard
10. Admin approves or rejects the application
11. Tenant sees updated booking status

### Why this matters
This is how the app converts a visitor into a tenant and gives admin full control over leads.

---

## 5. Booking / Lead Structure (Recommended)
For a complete functioning app, each booking request should include:

- userId
- roomId
- roomName / propertyTitle
- tenantName
- email
- phone
- message
- status (Pending / Approved / Rejected)
- createdAt

Example statuses:
- Pending
- Approved
- Rejected
- Confirmed

---

## 6. Admin Dashboard Responsibilities
The admin dashboard should act like the control center of the property business.

Admin can:
- See total rooms
- Review occupancy
- Manage tenant data
- View payment collections
- Update payment UPI details
- Resolve complaints
- Review all new user inquiries
- Approve room bookings

This makes the admin dashboard the decision hub of the platform.

---

## 7. Tenant Dashboard Responsibilities
The tenant dashboard is the user-side control panel.

Tenant can:
- View their assigned room
- See rent and payment details
- Pay pending dues
- Check payment history
- Submit complaints
- Read message notifications

This keeps all user-facing activities in one place.

---

## 8. Payment Flow
The payment process is a key part of lifecycle management.

### Tenant payment flow
1. Tenant checks pending dues
2. System shows all pending charges for that tenant
3. Tenant taps Pay Now
4. System fetches admin UPI ID from backend
5. UI shows:
   Pay to: 7087338600@ybl
6. Tenant pays using UPI
7. Payment status updates to Paid

### Admin payment flow
- Admin can update the UPI ID from admin dashboard
- This value is stored in backend database
- It is not hardcoded in the frontend

---

## 9. Complaint Flow
Users can create service complaints such as:
- Water issue
- Electricity issue
- Cleaning issue
- Plumbing issue
- General maintenance

The flow is:
1. Tenant clicks Request support or New complaint
2. Adds complaint title and description
3. Complaint is submitted
4. Admin sees complaint in support queue
5. Admin resolves it

---

## 10. Interview-Ready Summary
RoomSpot is a role-based rental management platform where guests can browse properties, users can register and log in, and the system directs them to a tenant or admin dashboard based on their role. Admins manage the full property operation, while tenants manage their room and payment-related needs. The critical next step is to implement a proper booking inquiry system so that when a user books a room, the request appears in the admin dashboard for review and approval.

---

## 11. Final Conclusion
The application is already strong in these areas:
- landing page and property listing
- login/register flow
- role-based routing
- protected dashboard access
- payment and complaint management

The final gap is the real booking/lead pipeline from user to admin review. Once this is added, the app becomes a complete rental management system.

---

## 12. Short Interview Answer
“RoomSpot is a full room rental management platform with admin and tenant roles. Users browse and search properties, log in, and then book or inquire about rooms. The booking lead is then stored in the backend and visible to the admin dashboard, where the admin can approve or reject it. The tenant dashboard tracks payments, complaints, and room-related information. This makes the platform functional for both property management and tenant experience.”
