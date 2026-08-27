# Hajzkom — Product Architecture

This file is the mandatory product architecture reference for all Hajzkom screens.

## Product Surfaces

Hajzkom has three main surfaces:

1. **Marketing Website**
2. **Public Customer Booking**
3. **Business Dashboard**

---

## User Types

### Customer

Public booking user.

* Has no account.
* Does not Sign Up or Login.
* Does not access the Dashboard.
* Uses only the Public Booking flow.

### Owner

Business owner.

* Can create a new account from the Marketing Website.
* Creates and manages a Business.
* Has full Dashboard access.
* Has Billing access.
* Goes through Owner Onboarding after creating a new account.

### Admin

Business management user.

* Does not create a Business through public Sign Up.
* Joins a Business through an invitation.
* Uses the shared Dashboard with Admin permissions.
* Cannot access Billing.

### Staff

Business staff member.

* Does not create a Business through public Sign Up.
* Joins through an invitation.
* Is assigned to one Location.
* Uses the shared Dashboard with restricted Staff permissions.

---

## Authentication Architecture

Authentication is ONLY for:

* Owner
* Admin
* Staff

Customers never authenticate.

### Public Sign Up

Public Sign Up is primarily:

**Create Account → Owner → Create New Business**

Do not provide role selection during Sign Up.

Admin and Staff roles are assigned through invitations.

### Login

Use ONE shared Login screen for:

* Owner
* Admin
* Staff

After successful login:

**Authenticate → Resolve Role → Apply Permissions → Dashboard**

Do not create separate Login screens for each role.

---

## Invitation Architecture

Admin and Staff join an existing Business through invitations.

### New invited user

Invitation
→ Sign Up
→ Invitation Details
→ Accept
→ Dashboard

### Existing user

Invitation
→ Login
→ Invitation Details
→ Accept
→ Dashboard

The invitation defines:

* Business
* Role
* Location when Staff

The user does not select their role.

---

## Owner Onboarding

Only new Owners creating a Business use this flow:

Create Business
→ Create First Location
→ Set Opening Hours
→ Add First Service
→ Dashboard

After Create Business, later steps may be skipped temporarily.

Continue prompting the Owner until:

* Opening Hours exist
* At least one Service exists

Admin and Staff do not use Owner Onboarding.

---

## Dashboard Architecture

Do NOT build separate Owner, Admin and Staff dashboard products.

Use one shared Dashboard architecture with role-based:

* Navigation visibility
* Data visibility
* Available actions
* Permissions

### Owner

Full access:

* Home
* Calendar
* Appointments
* Customers
* Services
* Team
* Locations
* Opening Hours
* Business Settings
* Billing

### Admin

Can access/manage:

* Home
* Calendar
* Appointments
* Customers
* Services
* Team
* Locations
* Opening Hours
* Business Settings

Cannot access:

* Billing

### Staff

Assigned to one Location.

Can:

* Access Home
* View individual Appointment Detail
* Update appointment status
* View Team as read-only

Cannot:

* Access full Calendar
* Reschedule appointments
* Manage Customers
* Manage Services
* Manage Team
* Manage Locations
* Manage Opening Hours
* Manage Business Settings
* Access Billing

Reuse shared screens with role variants whenever possible instead of creating duplicate screens.

---

## Public Booking Architecture

Customers use:

**Public Booking → Review → Confirmation**

The main Public Booking experience is ONE continuous screen containing:

1. Business / Location information
2. Service Selection
3. Date & Time Selection
4. Customer Details

Then:

→ Booking Review
→ Booking Confirmation

Do not split these four sections into separate pages.

No customer account is created.

---

## Core Business Rules

### Services

Phase 1 Service fields:

* Name
* Duration

Do not add:

* Price
* Category
* Description
* Staff assignment
* Active/Inactive

### Locations

Fields:

* Name
* Description
* Opening Hours

Do not add:

* Address
* Map
* Location phone

### Plans

**Free**

* 1 staff
* 200 appointments/month
* 30-day retention
* 1 location

**Pro**

* Up to 5 staff
* Unlimited appointments
* Unlimited retention
* 1 location

**Max**

* Unlimited staff
* Unlimited appointments
* Unlimited retention
* Multiple locations

Use plan-limit/upgrade states when restrictions are reached.

### Billing

Owner only.

Payment gateway:

* ZainCash only

Never create credit-card forms.

---

## Reuse Architecture — Mandatory

Before creating any new UI, check whether an existing component, form, layout, or screen pattern can be reused.

Reuse instead of redesigning.

Examples:

**Business Form**

* Created during Owner Onboarding
* Reused in Business Settings

**Location Form**

* Created during Owner Onboarding
* Reused for Create/Edit Location

**Opening Hours**

* Created during Owner Onboarding
* Reused in Location Settings

**Service Form**

* Created during Owner Onboarding
* Reused for Create/Edit Service

**Global States**

* Empty
* Loading
* Validation
* Error
* Plan Limit
* Confirmation
* Destructive Confirmation

Create these as reusable patterns rather than redesigning them for every screen.

Do not create a new component when an existing component can represent the required UI.

---

## Phase 1 Exclusions

Do not introduce unless explicitly requested:

* Forgot/reset password
* 2FA
* Edit profile
* Change password
* Service pricing
* Service categories
* Service descriptions
* Staff assignment to services
* Service active/inactive
* Location address
* Maps
* Location-specific phone
* WhatsApp reminder settings
* Google Calendar integration
* Analytics
* Reports
* Excel export
* Custom booking-page branding

---

## Mandatory Implementation Rule

For every future screen:

1. Follow this architecture.
2. Follow `USER_FLOWS.md`.
3. Follow `STYLE_GUIDE.md`.
4. Use the existing global color tokens.
5. Reuse existing components and patterns first.
6. Respect role permissions and plan restrictions.
7. Do not invent fields, features, roles, screens, or functionality outside Phase 1.
