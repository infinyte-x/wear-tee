import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role?: string;
    avatar?: string;
    quote: string;
}

interface TestimonialsBlockContent {
    title?: string;
    subtitle?: string;
    items?: Testimonial[];
}

export function TestimonialsBlock({ content }: { content: TestimonialsBlockContent }) {
    const testimonials = content.items || [
        {
            name: "Sarah Johnson",
            role: "Fashion Blogger",
            quote: "The quality of their products is exceptional. I've been a loyal customer for years!"
        },
        {
            name: "Michael Chen",
            role: "Photographer",
            quote: "Fast shipping and the clothes fit perfectly. Highly recommend to everyone."
        },
        {
            name: "Emily Davis",
            role: "Designer",
            quote: "Love the unique designs and sustainable practices. My go-to brand for everyday wear."
        },
    ];

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto">
                {(content.title || content.subtitle) && (
                    <div className="text-center mb-12">
                        {content.title && (
                            <h2 className="text-3xl font-serif mb-3">{content.title}</h2>
                        )}
                        {content.subtitle && (
                            <p className="text-muted-foreground">{content.subtitle}</p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-background rounded-xl p-6 shadow-sm border relative"
                        >
                            <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />

                            <p className="text-muted-foreground mb-6 italic">
                                "{testimonial.quote}"
                            </p>

                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{testimonial.name}</p>
                                    {testimonial.role && (
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
