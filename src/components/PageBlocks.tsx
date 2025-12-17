import { BlockData } from "@/components/builder/types";
import { BlockRenderer } from "@/components/builder/BlockRenderer";

interface PageBlocksProps {
    blocks: BlockData[];
    position?: "top" | "bottom";
}

/**
 * Renders page builder blocks for system pages
 * Used to add customizable sections above/below core page content
 */
export function PageBlocks({ blocks, position = "top" }: PageBlocksProps) {
    if (!blocks || blocks.length === 0) {
        return null;
    }

    return (
        <div className="page-blocks" data-position={position}>
            {blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
            ))}
        </div>
    );
}
