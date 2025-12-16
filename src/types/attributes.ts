export type AttributeValue = {
    id: string;
    label: string;
    value: string;
    color?: string;
    image?: string;
    isDefault?: boolean;
};

export type Attribute = {
    id: string;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'image' | 'button'; // Display Layout
    values: AttributeValue[];
    sort_order: number;
    is_active: boolean;
    created_at: string;
};
