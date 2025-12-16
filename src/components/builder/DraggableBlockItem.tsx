
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BlockType } from "./types";
import { GripVertical } from "lucide-react";

interface DraggableBlockItemProps {
    type: BlockType;
    label: string;
    icon: React.ElementType;
}

export function DraggableBlockItem({ type, label, icon: Icon }: DraggableBlockItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `sidebar-block-${type}`,
        data: {
            type,
            isSidebar: true, // Marker to distinguish from canvas blocks
        },
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 border rounded bg-white shadow-sm cursor-grab hover:border-primary transition-colors text-sm mb-2"
        >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{label}</span>
            <GripVertical className="h-4 w-4 text-muted-foreground ml-auto" />
        </div>
    );
}
