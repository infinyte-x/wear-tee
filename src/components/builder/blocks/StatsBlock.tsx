import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StatItem {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    icon?: string;
}

interface StatsBlockContent {
    title?: string;
    items?: StatItem[];
    variant?: 'default' | 'cards' | 'inline';
    animateNumbers?: boolean;
}

function useCountUp(end: number, duration: number = 2000, enabled: boolean = true) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) {
            setCount(end);
            return;
        }

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            countRef.current = Math.floor(progress * end);
            setCount(countRef.current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, enabled]);

    return count;
}

function StatItemDisplay({ item, animate }: { item: StatItem; animate: boolean }) {
    const displayValue = useCountUp(item.value, 2000, animate);

    return (
        <div className="text-center p-6">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {item.prefix}{displayValue.toLocaleString()}{item.suffix}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {item.label}
            </div>
        </div>
    );
}

export function StatsBlock({ content }: { content: StatsBlockContent }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const items = content.items || [
        { value: 10000, suffix: '+', label: 'Happy Customers' },
        { value: 500, suffix: '+', label: 'Products' },
        { value: 50, suffix: '+', label: 'Countries' },
        { value: 99, suffix: '%', label: 'Satisfaction' },
    ];

    const variant = content.variant || 'default';
    const animate = content.animateNumbers !== false;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const gridClasses = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <section ref={ref} className="py-16 bg-muted/30">
            <div className="container mx-auto px-6">
                {content.title && (
                    <h2 className="text-2xl md:text-3xl font-serif text-center mb-10">{content.title}</h2>
                )}

                <div className={cn(
                    "grid gap-6",
                    gridClasses[items.length as keyof typeof gridClasses] || 'grid-cols-2 md:grid-cols-4'
                )}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                variant === 'cards' && 'bg-background rounded-lg shadow-sm border'
                            )}
                        >
                            <StatItemDisplay item={item} animate={isVisible && animate} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
