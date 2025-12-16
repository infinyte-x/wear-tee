import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit, Shield, UserCheck } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Shop Owner', status: 'Active', lastLogin: '2024-12-14' },
    { id: '2', name: 'Staff Member', email: 'staff@example.com', role: 'Staff', status: 'Active', lastLogin: '2024-12-13' },
    { id: '3', name: 'Delivery Manager', email: 'delivery@example.com', role: 'Delivery', status: 'Active', lastLogin: '2024-12-12' },
    { id: '4', name: 'Support Agent', email: 'support@example.com', role: 'Support', status: 'Inactive', lastLogin: '2024-11-30' },
];

const roleColors: Record<string, string> = {
    'Shop Owner': 'bg-purple-500/10 text-purple-600',
    'Staff': 'bg-blue-500/10 text-blue-600',
    'Delivery': 'bg-orange-500/10 text-orange-600',
    'Support': 'bg-green-500/10 text-green-600',
};

const UsersPermissions = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Users & Permissions</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage team members and their access levels
                        </p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." className="pl-10" />
                    </div>
                    <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Roles
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center">
                                                <span className="text-sm font-medium text-accent">
                                                    {user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-muted'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                                            <span className="text-sm">{user.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <UserCheck className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UsersPermissions;
