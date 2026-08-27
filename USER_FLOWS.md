# Hajzkom — User Flows

This file is the mandatory flow and navigation reference for all Hajzkom screens.

---

# 1. Customer Flow

Customers do NOT have accounts.

Public Booking
→ Complete Business/Location + Service + Date/Time + Customer Details on ONE screen
→ Review Booking
→ Confirm
→ Booking Confirmation

No:

* Sign Up
* Login
* Dashboard
* Customer Account

---

# 2. New Owner Flow

Marketing Website
→ Create Account
→ Owner Account Created
→ Create Business
→ Create First Location
→ Set Opening Hours
→ Add First Service
→ Owner Dashboard

After Create Business, remaining onboarding steps may be skipped temporarily.

Continue prompting until Opening Hours and at least one Service exist.

---

# 3. Existing Owner Flow

Marketing Website
→ Login
→ Authenticate
→ Resolve Owner Role
→ Owner Dashboard

Owner receives full permissions including Billing.

---

# 4. Admin Invitation — New User

Invitation Link
→ Sign Up
→ Account Created
→ Invitation Details
→ Accept Invitation
→ Admin Dashboard

Role comes from the invitation.

Do not allow role selection during Sign Up.

---

# 5. Admin Invitation — Existing User

Invitation Link
→ Login
→ Invitation Details
→ Accept Invitation
→ Admin Dashboard

---

# 6. Existing Admin Login

Marketing Website
→ Login
→ Authenticate
→ Resolve Admin Role
→ Admin Dashboard

Admin has management access but no Billing.

---

# 7. Staff Invitation — New User

Invitation Link
→ Sign Up
→ Account Created
→ Invitation Details
→ Accept Invitation
→ Assigned Location
→ Staff Dashboard

Role and Location come from the invitation.

---

# 8. Staff Invitation — Existing User

Invitation Link
→ Login
→ Invitation Details
→ Accept Invitation
→ Assigned Location
→ Staff Dashboard

---

# 9. Existing Staff Login

Marketing Website
→ Login
→ Authenticate
→ Resolve Staff Role
→ Assigned Location
→ Staff Dashboard

Staff receives restricted permissions.

---

# 10. Invalid Invitation Flow

Invitation Link
→ Invitation validation fails
→ Invalid Invitation

Possible states:

* Expired
* Already accepted
* Revoked
* Not found

Provide appropriate Login or Contact Business action.

---

# 11. Dashboard Home Flow

Owner/Admin:

Dashboard Home
→ View today's summary
→ View upcoming appointments
→ Open Appointment Detail

Optional:
→ Add Walk-in

Staff:

Dashboard Home
→ View assigned-location daily information
→ Open Appointment Detail

Hide unavailable management actions.

---

# 12. Appointment Flow

Owner/Admin:

Calendar
→ Select Appointment
→ Appointment Detail
→ Update Status

Possible status actions:

* Complete
* No-show
* Cancel

Optional:
→ Reschedule

Staff:

Dashboard Home / Appointment
→ Appointment Detail
→ Update Status

Staff cannot Reschedule.

---

# 13. Reschedule Flow

Owner/Admin only:

Appointment Detail
→ Reschedule
→ Select Location
→ Select Date
→ Select Available Time
→ Compare Original vs New Time
→ Confirm Reschedule

---

# 14. Walk-in Flow

Dashboard
→ Add Walk-in
→ Select Service
→ Select Date
→ Select Available Time
→ Enter Customer Details
→ Confirm
→ Appointment Created

Use current Dashboard Location automatically.

Reuse existing booking components.

---

# 15. Customers Flow

Owner/Admin only:

Customers List
→ Search / Filter
→ Customer Profile
→ Customer Information + Appointment History

---

# 16. Services Flow

Owner/Admin only:

Services List
→ Add Service
→ Save

or:

Services List
→ Edit Service
→ Save

or:

Services List
→ Delete
→ Confirm

If appointments exist:
→ Block Deletion

Reuse the Service Form created during onboarding.

---

# 17. Team Flow

Owner/Admin:

Team List
→ Invite Member
→ Enter Email
→ Select Admin or Staff

If Staff:
→ Select Location

→ Send Invitation

Existing member:

Team List
→ Edit Member
→ Change Role / Location
→ Save

or:

→ Remove Member
→ Confirm

If plan staff limit is reached:
→ Plan Limit / Upgrade State

Staff:

Team List
→ Read Only

---

# 18. Business Settings Flow

Owner/Admin:

Dashboard
→ Business Settings
→ Edit Business Information
→ Save

Reuse the Business Form created during onboarding.

Owner only:

Business Settings
→ Delete Business
→ Enter Business Name Confirmation
→ Delete

---

# 19. Locations Flow

Owner/Admin:

Locations List
→ Select Location
→ Edit
→ Save

or:

Locations List
→ Opening Hours
→ Edit Weekly Hours
→ Save

Max Plan:

Locations List
→ Add Location
→ Create Location
→ Configure Opening Hours

Free/Pro:

Attempt Add Location
→ Plan Limit / Upgrade State

Reuse Location and Opening Hours patterns created during onboarding.

---

# 20. Billing Flow

Owner only.

Billing
→ Current Plan

### Change Paid Plan

Current Plan
→ Change Plan
→ Select Pro / Max
→ Continue to ZainCash
→ External Payment
→ Return to Hajzkom
→ Payment Result

Possible results:

* Success
* Failed
* Expired
* Pending

### Move to Free

Current Plan
→ Change Plan
→ Select Free
→ Cancellation Flow

Do not open ZainCash.

### Extend / Renew

Current Plan
→ Extend / Renew
→ Review Amount and Period
→ ZainCash
→ Payment Return

### Cancel

Current Plan
→ Cancel Subscription
→ Confirm
→ Cancellation Scheduled

### Resume Cancellation

Cancellation Scheduled
→ Resume Subscription

### Payments

Billing
→ Payments List
→ Payment Detail

### Subscription History

Billing
→ Subscription History

---

# 21. Restriction & Error Flows

At any relevant point:

Unauthorized role
→ 403 Forbidden

Missing resource
→ 404 / Not Found

Plan restriction
→ Plan Limit / Upgrade State

Network failure
→ Error + Retry

Destructive action
→ Confirmation

Empty collection
→ Empty State + relevant CTA

Reuse existing shared states.

---

# 22. Navigation Rules

Do not create separate dashboard products for Owner/Admin/Staff.

Use shared layouts and screens with role-based visibility and actions.

Do not create duplicate screens or forms when an existing pattern can be reused.

Always preserve:

* Logical back navigation
* Current Business context
* Current Location context where relevant
* Role permissions
* Plan restrictions

Do not invent extra navigation steps.

---

# 23. Reference Priority

When generating any future screen:

1. `PRODUCT_ARCHITECTURE.md` defines what exists and who can access it.
2. `USER_FLOWS.md` defines how users move through it.
3. `STYLE_GUIDE.md` defines how it should look.
4. Existing color tokens define the color system.
5. Existing components/forms/layouts must be reused before creating new ones.
