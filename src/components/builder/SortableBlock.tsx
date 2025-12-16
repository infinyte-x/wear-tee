
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockData } from "./types";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableBlockProps {
    block: BlockData;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export function SortableBlock({ block, isSelected, onSelect, onDelete }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative mb-4 group ring-2 ring-transparent transition-all",
                isSelected && "ring-primary",
                isDragging && "opacity-50 z-50"
            )}
        >
            {/* Block Content Wrapper */}
            <div
                className="bg-white border rounded shadow-sm p-4 min-h-[50px] cursor-pointer hover:border-primary/50"
                onClick={() => onSelect(block.id)}
            >
                <div className="pointer-events-none">
                    {/* Placeholder for actual block renderer */}
                    <div className="text-center p-4 border border-dashed rounded bg-muted/20">
                        <span className="font-semibold capitalize">{block.type} Block</span>
                    </div>
                </div>
            </div>

            {/* Editor Controls (Visible on hover/select) */}
            <div className={cn(
                "absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected && "opacity-100"
            )}>
                <div {...attributes} {...listeners} className="bg-white p-2 rounded border shadow-sm cursor-grab hover:bg-muted">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
