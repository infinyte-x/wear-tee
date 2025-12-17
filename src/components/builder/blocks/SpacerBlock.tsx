import { cn } from "@/lib/utils";

interface SpacerBlockContent {
    height?: 'small' | 'medium' | 'large' | 'custom';
    customHeight?: number;
    showDivider?: boolean;
    dividerStyle?: 'solid' | 'dashed' | 'dotted';
    dividerColor?: string;
}

export function SpacerBlock({ content }: { content: SpacerBlockContent }) {
    const heightMap = {
        small: 'h-8',
        medium: 'h-16',
        large: 'h-24',
        custom: '',
    };

    const height = content.height || 'medium';
    const customStyle = height === 'custom' && content.customHeight
        ? { height: `${content.customHeight}px` }
        : {};

    return (
        <div
            className={cn(
                "relative w-full flex items-center justify-center",
                heightMap[height]
            )}
            style={customStyle}
        >
            {content.showDivider && (
                <div
                    className="w-full max-w-md border-t"
                    style={{
                        borderStyle: content.dividerStyle || 'solid',
                        borderColor: content.dividerColor || 'currentColor',
                        opacity: 0.2,
                    }}
                />
            )}
        </div>
    );
}
