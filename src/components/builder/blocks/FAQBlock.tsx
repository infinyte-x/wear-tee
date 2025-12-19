import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQBlockContent {
    title?: string;
    subtitle?: string;
    items?: FAQItem[];
}

export function FAQBlock({ content }: { content: FAQBlockContent }) {
    const items = content.items || [
        { question: "What is your return policy?", answer: "We offer a 30-day return policy for all unworn items with tags attached." },
        { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery." },
        { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide. Shipping rates and times vary by location." },
    ];

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto">
                <div className="max-w-3xl mx-auto">
                    {(content.title || content.subtitle) && (
                        <div className="text-center mb-10">
                            {content.title && (
                                <h2 className="text-3xl font-serif mb-3">{content.title}</h2>
                            )}
                            {content.subtitle && (
                                <p className="text-muted-foreground">{content.subtitle}</p>
                            )}
                        </div>
                    )}

                    <Accordion type="single" collapsible className="w-full">
                        {items.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-medium">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
