import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
    profile_id: string;
    user_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: 'admin' | 'user';
    created_at: string;
    updated_at: string;
}

export interface AdminInvite {
    id: string;
    email: string;
    invited_by: string | null;
    created_at: string;
    expires_at: string;
}

export function useUsersPermissions() {
    const queryClient = useQueryClient();

    // Fetch all users with roles
    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            // Query profiles and join with user_roles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Get all user roles
            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('*');

            if (rolesError) throw rolesError;

            // Merge profiles with roles
            const users: AdminUser[] = (profiles || []).map((profile: any) => {
                const userRole = roles?.find((r: any) => r.user_id === profile.user_id);
                return {
                    profile_id: profile.id,
                    user_id: profile.user_id,
                    email: profile.email,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    role: (userRole?.role as 'admin' | 'user') || 'user',
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                };
            });

            return users;
        },
    });

    // Fetch pending admin invites
    const invitesQuery = useQuery({
        queryKey: ['admin-invites'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('admin_invites')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as AdminInvite[];
        },
    });

    // Invite new admin
    const inviteAdminMutation = useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase
                .from('admin_invites')
                .insert({ email });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('This email has already been invited');
                }
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
            toast.success('Admin invite sent successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send invite');
        },
    });

    // Cancel pending invite
    const cancelInviteMutation = useMutation({
        mutationFn: async (inviteId: string) => {
            const { error } = await supabase
                .from('admin_invites')
                .delete()
                .eq('id', inviteId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
            toast.success('Invite cancelled');
        },
        onError: () => {
            toast.error('Failed to cancel invite');
        },
    });

    // Change user role
    const changeRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'user' }) => {
            // Prevent self-demotion
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser?.id === userId && newRole === 'user') {
                throw new Error('Cannot demote yourself. Ask another admin to change your role.');
            }

            // First, delete existing role
            await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            // Then insert new role
            const { error } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role: newRole });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User role updated');
        },
        onError: () => {
            toast.error('Failed to update role');
        },
    });

    return {
        // Users
        users: usersQuery.data || [],
        isLoadingUsers: usersQuery.isLoading,
        usersError: usersQuery.error,

        // Invites
        invites: invitesQuery.data || [],
        isLoadingInvites: invitesQuery.isLoading,

        // Mutations
        inviteAdmin: inviteAdminMutation.mutate,
        isInviting: inviteAdminMutation.isPending,

        cancelInvite: cancelInviteMutation.mutate,
        isCancelling: cancelInviteMutation.isPending,

        changeRole: changeRoleMutation.mutate,
        isChangingRole: changeRoleMutation.isPending,
    };
}
