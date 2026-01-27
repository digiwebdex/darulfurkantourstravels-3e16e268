
# Implementation Plan: Critical Missing Features

This plan covers the implementation of two high-priority features for your SM Elite Hajj website:
1. **Password Reset / Forgot Password** - Allow users to recover their accounts
2. **Google Analytics Integration** - Track visitor behavior and conversions

---

## Phase 1: Password Reset / Forgot Password

### Overview
Users currently have no way to recover their accounts if they forget their password. This is critical for customer experience and reduces support burden.

### What Will Be Built

**1. Forgot Password Link on Login Page**
- Add "Forgot Password?" link below the sign-in form
- Opens a modal or switches to a forgot password view

**2. Forgot Password Form**
- Email input field with validation
- "Send Reset Link" button
- Success/error feedback messages

**3. Reset Password Page (`/reset-password`)**
- New route to handle the password reset callback
- New password input with confirmation
- Password strength requirements display
- Submit button to update password

### User Flow
```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Login Page     │───▶│ Forgot Password  │───▶│  Check Email    │
│  Click "Forgot" │    │  Enter Email     │    │  for Reset Link │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Login Page     │◀───│ Password Updated │◀───│  Reset Password │
│  Success!       │    │  Success Toast   │    │  Enter New Pass │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Add forgot password mode and form |
| `src/pages/ResetPassword.tsx` | New page for password update |
| `src/App.tsx` | Add `/reset-password` route |

---

## Phase 2: Google Analytics Integration

### Overview
Track visitor behavior, page views, booking conversions, and package popularity to make data-driven decisions.

### What Will Be Built

**1. Admin Settings - Analytics Tab**
- New "Analytics" tab in Admin Settings
- Input field for Google Analytics Measurement ID (G-XXXXXXXXXX)
- Toggle to enable/disable tracking
- Instructions for getting the Measurement ID

**2. Analytics Tracking Component**
- Page view tracking on route changes
- Event tracking for key actions:
  - Package views
  - Booking initiations
  - Payment completions
  - Contact form submissions

**3. Database Storage**
- Store analytics configuration in `site_settings` table

### Admin Settings Preview
The new Analytics tab will include:
- Measurement ID input field
- Enable/disable toggle
- Link to Google Analytics dashboard
- Setup instructions

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/components/AnalyticsTracker.tsx` | New component for page tracking |
| `src/components/admin/AdminSettings.tsx` | Add Analytics tab |
| `src/App.tsx` | Include AnalyticsTracker component |
| `src/hooks/useAnalytics.ts` | Hook for tracking custom events |

### Tracking Events
| Event Name | Trigger |
|------------|---------|
| `page_view` | Every route change |
| `view_package` | Package details opened |
| `begin_checkout` | Booking modal opened |
| `purchase` | Booking confirmed |
| `contact_submit` | Contact form submitted |

---

## Technical Details

### Password Reset Implementation
```text
Authentication Flow:
1. User clicks "Forgot Password"
2. Enters email, system calls supabase.auth.resetPasswordForEmail()
3. User receives email with reset link
4. Link redirects to /reset-password with recovery token
5. Auth state listener detects PASSWORD_RECOVERY event
6. User enters new password, calls supabase.auth.updateUser()
```

### Analytics Implementation
```text
Tracking Flow:
1. Admin enters GA4 Measurement ID in settings
2. App loads measurement ID from site_settings
3. AnalyticsTracker initializes GA4 on app load
4. useLocation hook tracks page changes
5. Custom events tracked via useAnalytics hook
```

### Dependencies
- No new packages required for password reset (uses existing Supabase auth)
- **New package for analytics**: `react-ga4` (lightweight GA4 wrapper)

---

## Implementation Order

1. **Password Reset** (Priority: Critical)
   - Update Auth.tsx with forgot password flow
   - Create ResetPassword.tsx page
   - Add route in App.tsx
   - Test complete flow

2. **Google Analytics** (Priority: High)
   - Install react-ga4 package
   - Add Analytics tab to AdminSettings
   - Create AnalyticsTracker component
   - Add tracking hook for custom events
   - Test tracking in GA4 debug mode

---

## Summary

| Feature | Impact | Effort |
|---------|--------|--------|
| Password Reset | Critical - User account recovery | Medium |
| Google Analytics | High - Business insights | Medium |

**Total estimated changes**: 5 new/modified files
