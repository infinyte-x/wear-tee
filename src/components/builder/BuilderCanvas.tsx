
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BlockData } from "./types";
import { SortableBlock } from "./SortableBlock";
import { cn } from "@/lib/utils";

interface BuilderCanvasProps {
    blocks: BlockData[];
    selectedBlockId: string | null;
    onSelectBlock: (id: string) => void;
    onDeleteBlock: (id: string) => void;
}

export function BuilderCanvas({ blocks, selectedBlockId, onSelectBlock, onDeleteBlock }: BuilderCanvasProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: "canvas-droppable",
    });

    return (
        <div className="flex-1 overflow-y-auto bg-muted/10 p-8 flex justify-center">
            <div
                ref={setNodeRef}
                className={cn(
                    "w-full max-w-4xl min-h-[500px] bg-white shadow-sm border rounded-lg p-8 transition-colors",
                    isOver && "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                )}
            >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[300px] border-2 border-dashed rounded-lg">
                            <p>Drag and drop components here</p>
                        </div>
                    ) : (
                        blocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                block={block}
                                isSelected={block.id === selectedBlockId}
                                onSelect={onSelectBlock}
                                onDelete={onDeleteBlock}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
