import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Shield, Loader2, Clock, UserX } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useUsersPermissions } from '@/hooks/useUsersPermissions';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-600 border-purple-200',
    user: 'bg-blue-500/10 text-blue-600 border-blue-200',
};

const UsersPermissions = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const {
        users,
        isLoadingUsers,
        invites,
        isLoadingInvites,
        inviteAdmin,
        isInviting,
        cancelInvite,
        changeRole,
        isChangingRole,
    } = useUsersPermissions();

    // Filter users by search
    const filteredUsers = users.filter(
        (user) =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Users & Permissions</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage team members and their access levels
                        </p>
                    </div>
                    <InviteUserDialog onInvite={inviteAdmin} isInviting={isInviting} />
                </div>

                {/* Pending Invites */}
                {invites.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <h3 className="font-medium text-amber-800 dark:text-amber-200">
                                Pending Invites ({invites.length})
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center gap-2 bg-white dark:bg-background border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2"
                                >
                                    <span className="text-sm">{invite.email}</span>
                                    <span className="text-xs text-muted-foreground">
                                        expires {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                                    </span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Invite?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will cancel the admin invite for {invite.email}. They will need to be invited again.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Invite</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => cancelInvite(invite.id)}>
                                                    Cancel Invite
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <UserX className="h-12 w-12 mb-3 opacity-50" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.profile_id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-accent">
                                                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.full_name || 'No name'}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={roleColors[user.role] || ''}>
                                                {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Select
                                                value={user.role}
                                                onValueChange={(value) =>
                                                    changeRole({ userId: user.user_id, newRole: value as 'admin' | 'user' })
                                                }
                                                disabled={isChangingRole}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="user">User</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-semibold">{users.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Admins</p>
                        <p className="text-2xl font-semibold">{users.filter((u) => u.role === 'admin').length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Regular Users</p>
                        <p className="text-2xl font-semibold">{users.filter((u) => u.role === 'user').length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Pending Invites</p>
                        <p className="text-2xl font-semibold">{invites.length}</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UsersPermissions;
