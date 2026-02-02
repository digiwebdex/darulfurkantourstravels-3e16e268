
# Demo Admin Account Implementation Plan

## Overview
Create a view-only demo admin account for client demonstrations that can see all admin dashboard features but cannot make any edits. This will be a "demo_admin" role with restricted write permissions.

## Implementation Steps

### 1. Database Changes

**Add new role to user_role enum:**
```sql
ALTER TYPE user_role ADD VALUE 'demo_admin';
```

**Create demo admin user account:**
- Email: `demo@darulfurkantravels.com`
- Password: (you will set this during creation)
- Role: `demo_admin`

### 2. Authentication Context Update

**Update `src/hooks/useAuth.tsx`:**
- Add `isDemoAdmin` boolean to context
- Add `canEdit` boolean (true for regular admin, false for demo_admin)
- Modify `checkAdminStatus` to detect both `admin` and `demo_admin` roles

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;        // Access to dashboard
  isDemoAdmin: boolean;    // Is demo account
  canEdit: boolean;        // Can make changes
  loading: boolean;
  signOut: () => Promise<void>;
}
```

### 3. Admin Components Protection

**Create a reusable wrapper/hook for edit permissions:**
- Create `useDemoMode` hook that provides `canEdit` status
- Components will conditionally disable/hide edit buttons

**Update admin components to check `canEdit`:**
- Disable "Add", "Edit", "Delete" buttons when `canEdit` is false
- Show a subtle "Demo Mode - View Only" banner at the top
- All tables, charts, and data remain fully visible

**Components to update:**
- `AdminDashboard.tsx` - Add demo mode banner
- All admin sub-components that have edit functionality will receive `canEdit` prop

### 4. Visual Indicators

**Demo Mode Banner:**
- Display a subtle banner at the top of admin dashboard
- Text: "Demo Mode - View Only"
- Yellow/amber background for visibility

**Button States:**
- Edit/Delete/Add buttons will be disabled with `opacity-50 cursor-not-allowed`
- Tooltip: "Editing disabled in demo mode"

---

## Technical Details

### Database Migration
```sql
-- Add demo_admin role
ALTER TYPE user_role ADD VALUE 'demo_admin';
```

### Edge Function (setup-super-admin)
Will be updated to support creating demo admin accounts.

### Demo Account Credentials
- **Email:** `demo@darulfurkantravels.com`
- **Password:** You will provide this during setup
- **Role:** `demo_admin`

---

## Security Considerations

1. **RLS Policies:** The demo_admin role will have READ access through existing RLS policies but write operations will be blocked at the UI level
2. **Additional Safety:** Consider adding RLS policy restrictions for demo_admin users to prevent API-level modifications (optional but recommended)
3. **Session Handling:** Demo accounts function identically to admin for authentication flow

---

## Benefits

- Clients can explore all dashboard features
- No risk of accidental data modification
- Clear visual indication of demo mode
- Same user experience as full admin (minus editing)
