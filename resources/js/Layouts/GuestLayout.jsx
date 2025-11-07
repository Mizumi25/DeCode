




import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import CustomCursor from '@/Components/CustomCursor';

export default function GuestLayout({ children }) {
    const logoRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });

        tl.fromTo(logoRef.current,
            { y: -50, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1 }
        ).fromTo(cardRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1 },
            "-=0.4"
        );
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[var(--color-bg)] pt-6 sm:justify-center sm:pt-0 transition-all">
        {/* <CustomCursor /> */}
            <div ref={logoRef}>
                
            </div>

            <div
                ref={cardRef}
                className="mt-6 w-full overflow-hidden bg-[var(--color-surface)] px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg transition-all"
            >
                {children}
            </div>
        </div>
    );
}
