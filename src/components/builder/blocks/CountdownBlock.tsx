import { useState, useEffect } from "react";

interface CountdownBlockContent {
    title?: string;
    targetDate?: string;
    showDays?: boolean;
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
    variant?: 'default' | 'compact' | 'large';
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownBlock({ content }: { content: CountdownBlockContent }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    const targetDate = content.targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const showDays = content.showDays !== false;
    const showHours = content.showHours !== false;
    const showMinutes = content.showMinutes !== false;
    const showSeconds = content.showSeconds !== false;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - Date.now();

            if (difference <= 0) {
                setIsExpired(true);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const variant = content.variant || 'default';

    const sizeClasses = {
        default: 'text-3xl md:text-4xl',
        compact: 'text-xl md:text-2xl',
        large: 'text-4xl md:text-6xl',
    };

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className={`font-bold tabular-nums ${sizeClasses[variant]}`}>
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {label}
            </div>
        </div>
    );

    return (
        <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="container mx-auto">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    {content.title && (
                        <h2 className="text-xl md:text-2xl font-serif">{content.title}</h2>
                    )}

                    {isExpired ? (
                        <p className="text-lg text-muted-foreground">This offer has ended</p>
                    ) : (
                        <div className="flex justify-center items-center gap-4 md:gap-8">
                            {showDays && <TimeUnit value={timeLeft.days} label="Days" />}
                            {showDays && showHours && <span className={`${sizeClasses[variant]} text-muted-foreground`}>:</span>}
                            {showHours && <TimeUnit value={timeLeft.hours} label="Hours" />}
                            {showHours && showMinutes && <span className={`${sizeClasses[variant]} text-muted-foreground`}>:</span>}
                            {showMinutes && <TimeUnit value={timeLeft.minutes} label="Mins" />}
                            {showMinutes && showSeconds && <span className={`${sizeClasses[variant]} text-muted-foreground`}>:</span>}
                            {showSeconds && <TimeUnit value={timeLeft.seconds} label="Secs" />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
