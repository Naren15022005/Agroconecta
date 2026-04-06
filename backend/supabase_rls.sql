-- Supabase RLS and policies starter for AgroConecta
-- Run this in your Supabase SQL editor.
-- NOTES:
-- 1) Review and adapt policies that reference auth.uid() to your auth/user id mapping.
-- 2) Replace admin-role checks with your application's role identifiers if needed.
-- 3) This script is conservative for sensitive tables (completely denies public access).

-- Helper: revoke all privileges from public on listed tables to avoid PostgREST exposing them
-- Then enable RLS and create baseline policies.

-------------------------------
-- SENSITIVE TABLES: deny public (service role only)
-------------------------------

-- accounts (contains tokens)
REVOKE ALL ON TABLE public.accounts FROM PUBLIC;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_deny_all ON public.accounts FOR ALL USING (false) WITH CHECK (false);

-- sessions (contains session_token)
REVOKE ALL ON TABLE public.sessions FROM PUBLIC;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_deny_all ON public.sessions FOR ALL USING (false) WITH CHECK (false);

-- verification_tokens (contains tokens)
REVOKE ALL ON TABLE public.verification_tokens FROM PUBLIC;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY verification_tokens_deny_all ON public.verification_tokens FOR ALL USING (false) WITH CHECK (false);

-------------------------------
-- USER/PROFILE TABLES: owner-only access for users to read/update their own row
-------------------------------

-- users
REVOKE ALL ON TABLE public.users FROM PUBLIC;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Allow a user to SELECT their own user row
CREATE POLICY users_select_own ON public.users FOR SELECT USING (id = auth.uid());
-- Allow a user to UPDATE their own row (but not role changes)
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- Disable inserts from anon/public; inserts should be handled by server-side or auth flows
CREATE POLICY users_insert_server ON public.users FOR INSERT USING (false) WITH CHECK (false);

-- notes: if your auth.uid() is not equal to users.id, adapt the condition (e.g. users.correo = current_setting('jwt.claims.email'))

-- agricultores (profile tied to user)
REVOKE ALL ON TABLE public.agricultores FROM PUBLIC;
ALTER TABLE public.agricultores ENABLE ROW LEVEL SECURITY;
CREATE POLICY agricultores_select_own ON public.agricultores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY agricultores_update_own ON public.agricultores FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY agricultores_insert_server ON public.agricultores FOR INSERT USING (false) WITH CHECK (false);

-- clientes
REVOKE ALL ON TABLE public.clientes FROM PUBLIC;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY clientes_select_own ON public.clientes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY clientes_update_own ON public.clientes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY clientes_insert_server ON public.clientes FOR INSERT USING (false) WITH CHECK (false);

-- empresas
REVOKE ALL ON TABLE public.empresas FROM PUBLIC;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresas_select_own ON public.empresas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY empresas_update_own ON public.empresas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY empresas_insert_server ON public.empresas FOR INSERT USING (false) WITH CHECK (false);

-------------------------------
-- CATALOG / PUBLIC READ TABLES: allow public SELECT on active items only
-------------------------------

-- categories
REVOKE ALL ON TABLE public.categories FROM PUBLIC;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_select ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY categories_deny_mutation ON public.categories FOR INSERT, UPDATE, DELETE USING (false) WITH CHECK (false);

-- subcategories
REVOKE ALL ON TABLE public.subcategories FROM PUBLIC;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY subcategories_public_select ON public.subcategories FOR SELECT USING (is_active = true);
CREATE POLICY subcategories_deny_mutation ON public.subcategories FOR INSERT, UPDATE, DELETE USING (false) WITH CHECK (false);

-- products (public read for active products)
REVOKE ALL ON TABLE public.products FROM PUBLIC;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_select ON public.products FOR SELECT USING (is_active = true);
-- Allow product owners (agricultor) to insert/update/delete their own products
CREATE POLICY products_manage_own ON public.products FOR ALL USING (agricultor_id = (SELECT id FROM public.agricultores WHERE user_id = auth.uid())) WITH CHECK (agricultor_id = (SELECT id FROM public.agricultores WHERE user_id = auth.uid()));

-------------------------------
-- CART, ORDERS, PAYMENT TRANSACTIONS, FAVORITES, WALLETS: owner-only
-------------------------------

-- cart_items
REVOKE ALL ON TABLE public.cart_items FROM PUBLIC;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY cart_items_owner ON public.cart_items FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- orders
REVOKE ALL ON TABLE public.orders FROM PUBLIC;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Buyers can see their own orders
CREATE POLICY orders_buyer ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY orders_buyer_manage ON public.orders FOR INSERT, UPDATE, DELETE USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());

-- payment_transactions
REVOKE ALL ON TABLE public.payment_transactions FROM PUBLIC;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_transactions_owner ON public.payment_transactions FOR ALL USING (comprador_id = auth.uid() OR agricultor_id = (SELECT id FROM public.agricultores WHERE user_id = auth.uid())) WITH CHECK (comprador_id = auth.uid() OR agricultor_id = (SELECT id FROM public.agricultores WHERE user_id = auth.uid()));

-- order_items - access via orders/ products; restrict direct access
REVOKE ALL ON TABLE public.order_items FROM PUBLIC;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_via_order_owner ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));
CREATE POLICY order_items_no_mutation ON public.order_items FOR INSERT, UPDATE, DELETE USING (false) WITH CHECK (false);

-- favorites
REVOKE ALL ON TABLE public.favorites FROM PUBLIC;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_owner ON public.favorites FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- wallets
REVOKE ALL ON TABLE public.wallets FROM PUBLIC;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_owner ON public.wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY wallets_write_service ON public.wallets FOR INSERT, UPDATE, DELETE USING (false) WITH CHECK (false);

-- wallet_transactions
REVOKE ALL ON TABLE public.wallet_transactions FROM PUBLIC;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_transactions_via_wallet ON public.wallet_transactions FOR SELECT USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));
CREATE POLICY wallet_transactions_no_mutation ON public.wallet_transactions FOR INSERT, UPDATE, DELETE USING (false) WITH CHECK (false);

-------------------------------
-- SALES / FINANCIAL TABLES: restrict to admin or server-side
-------------------------------

REVOKE ALL ON TABLE public.sales FROM PUBLIC;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_server_only ON public.sales FOR ALL USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.comisiones FROM PUBLIC;
ALTER TABLE public.comisiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY comisiones_server_only ON public.comisiones FOR ALL USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.impuestos FROM PUBLIC;
ALTER TABLE public.impuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY impuestos_server_only ON public.impuestos FOR ALL USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.withdraw_requests FROM PUBLIC;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY withdraw_requests_owner ON public.withdraw_requests FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

REVOKE ALL ON TABLE public.pagos FROM PUBLIC;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pagos_owner ON public.pagos FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

REVOKE ALL ON TABLE public.transacciones FROM PUBLIC;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY transacciones_owner ON public.transacciones FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- liquidaciones and payment_orders are financial and should be server-side only
REVOKE ALL ON TABLE public.payment_orders FROM PUBLIC;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_orders_server_only ON public.payment_orders FOR ALL USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.liquidaciones FROM PUBLIC;
ALTER TABLE public.liquidaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY liquidaciones_server_only ON public.liquidaciones FOR ALL USING (false) WITH CHECK (false);

-------------------------------
-- favorites/notifications already handled above
-------------------------------

-- notifications: allow recipient to see their own notifications
REVOKE ALL ON TABLE public.notifications FROM PUBLIC;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_owner ON public.notifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-------------------------------
-- FINAL NOTES
-------------------------------
-- After running this script, review PostgREST / Supabase API rules:
-- * For public read endpoints (products/categories), consider creating views that expose only safe columns and grant SELECT on those views to anon (if you use anon access).
-- * For admin-only operations, handle via server-side (service role key) or create policies that verify a user's role by joining users->roles and checking role name.

-- Example admin check (replace 'ADMIN_ROLE_ID' with actual roles.id):
-- (SELECT EXISTS(SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.name = 'ADMINISTRADOR'))

-- Consider creating helper SQL functions to map jwt claims to users.id if your auth uses different identifiers.

-- Done.
