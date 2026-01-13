-- vault_starter_purchases is managed by service_role via Stripe webhook
-- Users should only be able to view their own purchases (already exists)
-- and update their email preferences

-- Allow users to update their own purchase email preferences (unsubscribe)
CREATE POLICY "Users can update own purchase email preferences"
ON vault_starter_purchases FOR UPDATE
USING (
  user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);