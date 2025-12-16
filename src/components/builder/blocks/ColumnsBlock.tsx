interface Column {
    title?: string;
    content?: string;
}

interface ColumnsBlockContent {
    columns?: 2 | 3 | 4;
    items?: Column[];
    gap?: 'small' | 'medium' | 'large';
}

export function ColumnsBlock({ content }: { content: ColumnsBlockContent }) {
    const columnCount = content.columns || 2;
    const gap = content.gap || 'medium';

    const gapClasses = {
        small: 'gap-4',
        medium: 'gap-6',
        large: 'gap-8',
    };

    const gridClasses = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const items = content.items || [
        { title: "Column 1", content: "Add your content here. You can include text, descriptions, or any information you want to display." },
        { title: "Column 2", content: "Each column can have its own title and content. Great for comparing features or displaying multiple items." },
    ];

    // Ensure we have enough columns
    const displayItems = items.slice(0, columnCount);
    while (displayItems.length < columnCount) {
        displayItems.push({ title: `Column ${displayItems.length + 1}`, content: "Add content here..." });
    }

    return (
        <section className="py-8">
            <div className="container mx-auto px-6">
                <div className={`grid ${gridClasses[columnCount]} ${gapClasses[gap]}`}>
                    {displayItems.map((column, index) => (
                        <div key={index} className="space-y-3">
                            {column.title && (
                                <h3 className="text-xl font-semibold">{column.title}</h3>
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
