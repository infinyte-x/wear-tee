-- Create a view joining profiles with user_roles for easier querying
-- This allows admins to see all users with their roles in one query

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.email,
  p.full_name,
  p.phone,
  p.created_at,
  p.updated_at,
  COALESCE(ur.role::text, 'user') as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;

-- Grant access to the view (inherits RLS from underlying tables)
GRANT SELECT ON public.admin_users_view TO authenticated;

-- Create function to change user role (admin only)
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id UUID, new_role app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  -- Prevent self-demotion (optional safety)
  IF target_user_id = auth.uid() AND new_role = 'user' THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET role = new_role;
  
  -- Remove old role if changing
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id 
    AND role != new_role;
END;
$$;
