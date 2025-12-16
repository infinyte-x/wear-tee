import { useSearch } from '@tanstack/react-router';
import AdminLayout from '@/components/admin/AdminLayout';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

const AdminPlaceholder = () => {
    // We'll use search params to determine the title, but safely fall back if not present
    // Note: In TanStack Router, proper search param validation is strictly typed, 
    // but for this generic placeholder we might rely on the URL or just a default.
    // To keep it simple and type-safe without extensive route config, we will just parse it manually or accept it's generic.

    // For now, let's just use window.location as a quick fallback if we don't want to enforce strict search params on this route
    // OR essentially we can just show "Feature Coming Soon".

    // Let's try to get a title from search params if possible, otherwise generic.
    const searchParams = new URLSearchParams(window.location.search);
    const title = searchParams.get('title') || 'Feature Coming Soon';

    const navigate = useNavigate();

    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-muted p-6 rounded-full mb-6">
                    <Construction className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-serif text-foreground mb-2">{title}</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    This feature is currently under development. Check back soon for updates!
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate({ to: '/admin' })}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPlaceholder;
