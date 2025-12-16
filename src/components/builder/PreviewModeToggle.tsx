import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface PreviewModeToggleProps {
    value: PreviewMode;
    onChange: (mode: PreviewMode) => void;
}

export function PreviewModeToggle({ value, onChange }: PreviewModeToggleProps) {
    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={(v) => v && onChange(v as PreviewMode)}
            className="border rounded-md p-1 bg-muted/50"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <ToggleGroupItem value="desktop" size="sm" className="h-8 w-8 p-0">
                        <Monitor className="h-4 w-4" />
                    </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Desktop</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <ToggleGroupItem value="tablet" size="sm" className="h-8 w-8 p-0">
                        <Tablet className="h-4 w-4" />
                    </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Tablet</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <ToggleGroupItem value="mobile" size="sm" className="h-8 w-8 p-0">
                        <Smartphone className="h-4 w-4" />
                    </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Mobile</TooltipContent>
            </Tooltip>
        </ToggleGroup>
    );
}

export const previewWidths: Record<PreviewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
};
