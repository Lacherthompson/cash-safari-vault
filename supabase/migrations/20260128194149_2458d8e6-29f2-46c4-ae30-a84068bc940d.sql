-- Block direct INSERT on vault_starter_purchases 
-- Only Stripe webhook (using service role) should create purchases
CREATE POLICY "Block direct user inserts to purchases"
ON public.vault_starter_purchases
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block direct DELETE on vault_starter_purchases
-- Purchases should never be deleted by users
CREATE POLICY "Block direct user deletes to purchases"
ON public.vault_starter_purchases
FOR DELETE
TO authenticated
USING (false);