import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { History, RotateCcw, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BlockData } from "@/components/builder/types";

interface Version {
    id: string;
    version_number: number;
    created_at: string;
    content: BlockData[];
}

interface VersionHistoryPanelProps {
    versions: Version[];
    isLoading: boolean;
    onRestore: (versionId: string) => void;
    isRestoring: boolean;
    onSaveVersion: () => void;
    isSaving: boolean;
}

export function VersionHistoryPanel({
    versions,
    isLoading,
    onRestore,
    isRestoring,
    onSaveVersion,
    isSaving,
}: VersionHistoryPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Version History</SheetTitle>
                    <SheetDescription>
                        View and restore previous versions of this page.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Save Current Version Button */}
                    <Button
                        onClick={onSaveVersion}
                        disabled={isSaving}
                        className="w-full"
                        variant="outline"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Clock className="h-4 w-4 mr-2" />
                                Save Current as Version
                            </>
                        )}
                    </Button>

                    {/* Version List */}
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No versions saved yet</p>
                                <p className="text-xs">Save versions to track changes over time</p>
                            </div>
                        ) : (
                            versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            Version {version.version_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {version.content?.length || 0} blocks
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRestore(version.id)}
                                        disabled={isRestoring}
                                        className="text-xs"
                                    >
                                        {isRestoring ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <>
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Restore
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
