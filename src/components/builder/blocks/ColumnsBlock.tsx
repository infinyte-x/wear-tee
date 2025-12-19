import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface Column {
    title?: string;
    content?: string;
    icon?: string;
}

interface ColumnsBlockContent {
    columns?: 2 | 3 | 4 | 5 | 6;
    items?: Column[];
    gap?: 'small' | 'medium' | 'large';
    // NEW OPTIONS
    verticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
    padding?: 'none' | 'small' | 'medium' | 'large';
    backgroundColor?: string;
    columnBackground?: 'none' | 'card' | 'muted';
    showDividers?: boolean;
    showTitles?: boolean;
    showIcons?: boolean;
    textAlign?: 'left' | 'center';
    titleSize?: 'small' | 'medium' | 'large';
    sectionTitle?: string;
    sectionSubtitle?: string;
}

// Dynamic icon renderer
function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (Icons as any)[name] || Icons.Star;
    return <IconComponent className={className} />;
}

export function ColumnsBlock({ content }: { content: ColumnsBlockContent }) {
    const columnCount = content.columns || 2;
    const gap = content.gap || 'medium';
    const verticalAlign = content.verticalAlign || 'top';
    const padding = content.padding || 'small';
    const columnBackground = content.columnBackground || 'none';
    const showDividers = content.showDividers ?? false;
    const showTitles = content.showTitles !== false;
    const showIcons = content.showIcons ?? false;
    const textAlign = content.textAlign || 'left';
    const titleSize = content.titleSize || 'medium';

    // Gap classes - responsive
    const getGapClass = () => {
        switch (gap) {
            case 'small': return 'gap-3 sm:gap-4';
            case 'large': return 'gap-6 sm:gap-8';
            default: return 'gap-4 sm:gap-6';
        }
    };

    // Grid classes - mobile first with sm, md, lg breakpoints
    const getGridClass = () => {
        switch (columnCount) {
            case 2: return 'grid-cols-1 sm:grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
            case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
            case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
            default: return 'grid-cols-1 sm:grid-cols-2';
        }
    };

    // Vertical align classes
    const getAlignClass = () => {
        switch (verticalAlign) {
            case 'center': return 'items-center';
            case 'bottom': return 'items-end';
            case 'stretch': return 'items-stretch';
            default: return 'items-start';
        }
    };

    // Padding classes - responsive
    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return 'py-0';
            case 'small': return 'py-4 sm:py-6 md:py-8';
            case 'large': return 'py-12 sm:py-16 md:py-24';
            default: return 'py-8 sm:py-12 md:py-16';
        }
    };

    // Title size
    const getTitleClass = () => {
        switch (titleSize) {
            case 'small': return 'text-lg';
            case 'large': return 'text-2xl';
            default: return 'text-xl';
        }
    };

    // Column background
    const getColumnBgClass = () => {
        switch (columnBackground) {
            case 'card': return 'bg-background rounded-lg shadow-sm border p-6';
            case 'muted': return 'bg-muted/30 rounded-lg p-6';
            default: return '';
        }
    };

    const items = content.items || [
        { title: "Column 1", content: "Add your content here.", icon: "Star" },
        { title: "Column 2", content: "Each column can have its own content.", icon: "Heart" },
    ];

    // Ensure we have enough columns
    const displayItems = items.slice(0, columnCount);
    while (displayItems.length < columnCount) {
        displayItems.push({ title: `Column ${displayItems.length + 1}`, content: "Add content here..." });
    }

    return (
        <section
            className={getPaddingClass()}
            style={{ backgroundColor: content.backgroundColor || undefined }}
        >
            <div className="container mx-auto">
                {(content.sectionTitle || content.sectionSubtitle) && (
                    <div className={cn("mb-10", textAlign === 'center' && "text-center")}>
                        {content.sectionSubtitle && (
                            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                                {content.sectionSubtitle}
                            </p>
                        )}
                        {content.sectionTitle && (
                            <h2 className="text-2xl md:text-3xl font-serif">{content.sectionTitle}</h2>
                        )}
                    </div>
                )}

                <div className={cn(
                    "grid",
                    getGridClass(),
                    getGapClass(),
                    getAlignClass(),
                    showDividers && "divide-x divide-border"
                )}>
                    {displayItems.map((column, index) => (
                        <div
                            key={index}
                            className={cn(
                                "space-y-3",
                                getColumnBgClass(),
                                textAlign === 'center' && "text-center"
                            )}
                        >
                            {showIcons && column.icon && (
                                <div className={cn(
                                    "p-3 rounded-full bg-primary/10 w-fit",
                                    textAlign === 'center' && "mx-auto"
                                )}>
                                    <DynamicIcon name={column.icon} className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            {showTitles && column.title && (
                                <h3 className={cn("font-semibold", getTitleClass())}>
                                    {column.title}
                                </h3>
                            )}
                            {column.content && (
                                <div
                                    className="text-muted-foreground prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: column.content }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

