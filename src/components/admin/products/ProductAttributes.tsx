import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

interface ProductAttributesProps {
    attributes: Record<string, string>;
    onChange: (attributes: Record<string, string>) => void;
}

const ProductAttributes = ({ attributes, onChange }: ProductAttributesProps) => {
    const pairs = Object.entries(attributes);

    const handleAdd = () => {
        // Add a temporary key if one doesn't exist, or just use empty strings if valid
        // For cleaner UX, we might want to convert the object to an array of objects locally
        // providing a smoother editing experience.
        const newAttributes = { ...attributes, "": "" };
        onChange(newAttributes);
    };

    const handleChange = (oldKey: string, newKey: string, newValue: string) => {
        const newAttributes = { ...attributes };
        if (oldKey !== newKey) {
            delete newAttributes[oldKey];
        }
        newAttributes[newKey] = newValue;
        onChange(newAttributes);
    };

    const handleRemove = (key: string) => {
        const newAttributes = { ...attributes };
        delete newAttributes[key];
        onChange(newAttributes);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Product Attributes</h3>
            </div>
            <div className="space-y-2">
                {pairs.map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            placeholder="Name (e.g. Material)"
                            value={key}
                            onChange={(e) => handleChange(key, e.target.value, value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Value (e.g. Cotton)"
                            value={value}
                            onChange={(e) => handleChange(key, key, e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(key)}
                            type="button"
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
                {pairs.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                        No attributes added yet.
                    </p>
                )}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="w-full mt-2"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
            </Button>
        </div>
    );
};

export default ProductAttributes;
