

# Fix Build Error in Vault.tsx

## The Problem

The `Vault.tsx` file queries the `vault_members` table for an `email` column that doesn't exist. The table only has: `id`, `vault_id`, `user_id`, `joined_at`.

This was likely introduced by a GitHub sync where someone added code expecting an `email` column.

## The Fix

Update the query on line 187 to only select columns that exist (`id, user_id`), and remove the code path that tries to read `member.email`. Instead, always use the `vault_invitations` fallback to find member emails.

### Changes to `src/pages/Vault.tsx`

1. **Line 187**: Change `.select('id, user_id, email')` to `.select('id, user_id')`
2. **Lines 198-212**: Simplify the member mapping logic:
   - Keep the owner check (line 200-201) as-is
   - Remove the `member.email` check (lines 203-206) since the column doesn't exist
   - Keep the invitation-based fallback (lines 207-212) as the default path for non-owner members

The resulting logic will be:
- If the member is the current user (owner) → use their auth email
- Otherwise → look up their email from `vault_invitations`
- If no invitation found → show "Member"

## Technical Details

```text
Before:  .select('id, user_id, email')
After:   .select('id, user_id')

Before:  if (member.email) { return {..., email: member.email }; }
After:   (removed - go straight to invitation lookup)
```

No database changes needed. This is a code-only fix.

