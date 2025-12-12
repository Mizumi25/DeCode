




import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const logoRef = useRef(null);
    const cardRef = useRef(null);
    const columnsRef = useRef([]);

    useEffect(() => {
        // Animate logo and card entrance
        const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });

        tl.fromTo(logoRef.current,
            { y: -50, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1 }
        ).fromTo(cardRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1 },
            "-=0.4"
        );

        // Animate diagonal lines - alternating up and down infinitely with seamless loop
        columnsRef.current.forEach((line, index) => {
            if (line) {
                // For seamless infinite scroll, we move by 50% (half the content, since we duplicated items)
                const direction = index % 2 === 0 ? '50%' : '-50%'; 
                const startPosition = index % 2 === 0 ? '-50%' : '50%';
                const duration = 20; // Consistent speed for all lines
                
                gsap.fromTo(line, 
                    {
                        y: startPosition
                    },
                    {
                        y: direction,
                        duration: duration,
                        ease: 'none',
                        repeat: -1,
                        modifiers: {
                            y: gsap.utils.unitize(y => parseFloat(y) % 100) // Loop seamlessly
                        }
                    }
                );
            }
        });
    }, []);

    // Create placeholder items for each diagonal line
    const createDiagonalItems = (lineIndex) => {
        const items = [];
        const itemCount = 10; // Items per set
        
        // Create the item element
        const item = (i) => (
            <div
                key={i}
                className="w-32 h-32 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 border border-[var(--color-border)] flex-shrink-0"
                style={{
                    backdropFilter: 'blur(8px)',
                }}
            />
        );
        
        // Create two sets of items for seamless looping
        for (let i = 0; i < itemCount; i++) {
            items.push(item(i));
        }
        // Duplicate the items for seamless infinite scroll
        for (let i = 0; i < itemCount; i++) {
            items.push(item(i + itemCount));
        }
        
        return items;
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center bg-[var(--color-bg)] pt-6 sm:justify-center sm:pt-0 transition-all overflow-hidden">
            {/* Animated Background - Diagonal Lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'rotate(-45deg) scale(1.5)', transformOrigin: 'center' }}>
                <div className="flex gap-8 h-[200%] -translate-y-1/4">
                    {[...Array(12)].map((_, lineIndex) => (
                        <div
                            key={lineIndex}
                            ref={(el) => (columnsRef.current[lineIndex] = el)}
                            className="flex flex-col gap-8"
                            style={{
                                width: '150px',
                            }}
                        >
                            {createDiagonalItems(lineIndex)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Gradient Overlay - makes background subtle and semi-transparent */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/90 via-[var(--color-bg)]/70 to-[var(--color-bg)]/90 pointer-events-none z-[1]" />

            {/* Content - above the animated background */}
            <div className="relative z-[2] flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
                <div ref={logoRef}>
                    
                </div>

                <div
                    ref={cardRef}
                    className="mt-6 w-full overflow-hidden bg-[var(--color-surface)]/95 backdrop-blur-md px-6 py-4 shadow-lg sm:max-w-md sm:rounded-lg transition-all border border-[var(--color-border)]/50"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
