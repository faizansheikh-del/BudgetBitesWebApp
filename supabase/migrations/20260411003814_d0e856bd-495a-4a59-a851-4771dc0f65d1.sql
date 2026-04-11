
-- Fix invitations INSERT: only admins can assign elevated roles
DROP POLICY IF EXISTS "Authenticated can create invitations" ON public.invitations;
CREATE POLICY "Authenticated can create invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = invited_by
  AND (
    role = 'user'
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Add explicit INSERT policy on user_roles (admin-only)
-- The "Admins can manage roles" ALL policy already covers this,
-- but let's be explicit to prevent any bypass
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
