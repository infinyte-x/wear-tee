
import { BlockData } from "../types";
import { Check, Truck, Shield, Star, Heart } from "lucide-react";

const IconMap: Record<string, any> = {
    Check, Truck, Shield, Star, Heart
};

export function FeaturesBlock({ content }: { content: any }) {
    const features = content.items || [
        { title: "Quality", description: "Best materials", icon: "Star" },
        { title: "Shipping", description: "Fast delivery", icon: "Truck" },
        { title: "Secure", description: "Safe payments", icon: "Shield" },
    ];

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((item: any, i: number) => {
                        const Icon = IconMap[item.icon] || Star;
                        return (
                            <div key={i} className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
                                <div className="p-3 bg-primary/10 rounded-full mb-4">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
