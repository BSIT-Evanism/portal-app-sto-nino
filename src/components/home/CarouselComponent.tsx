import { useEffect, useRef, useState } from 'react';
import { Image } from 'astro:assets';
import useSWR from 'swr';
import type { HighlightsType } from '@/db/schema';
import { fetcher } from '@/lib/utils';

interface CarouselItem {
    image: string;
    alt: string;
}

interface CarouselProps {
    data: CarouselItem[];
}

export default function CarouselComponent() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
    const { data: highlights, isLoading } = useSWR<HighlightsType[]>("/api/highlights", fetcher)

    const updateCarousel = () => {
        if (containerRef.current && highlights?.length) {
            containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    };

    const goToNext = () => {
        if (!highlights?.length) return;
        setCurrentIndex(current =>
            current < highlights.length - 1 ? current + 1 : 0
        );
    };

    const goToPrev = () => {
        if (!highlights?.length) return;
        setCurrentIndex(current =>
            current > 0 ? current - 1 : highlights.length - 1
        );
    };

    const startAutoRotate = () => {
        stopAutoRotate();
        autoRotateRef.current = setInterval(goToNext, 5000);
    };

    const stopAutoRotate = () => {
        if (autoRotateRef.current) {
            clearInterval(autoRotateRef.current);
        }
    };

    useEffect(() => {
        updateCarousel();
    }, [currentIndex]);

    useEffect(() => {
        startAutoRotate();
        return () => stopAutoRotate();
    }, []);

    return (
        <div className="min-h-fit w-full flex items-center justify-center bg-bg p-4">
            <div className="relative w-full max-w-[95vw] h-[40vh] flex items-center justify-center bg-[#0b790b] rounded-none overflow-hidden" style={{ boxShadow: 'none' }}>
                {/* Announcements label (optional, can be removed if not needed) */}
                {/* <div className='absolute z-10 top-5 left-5 bg-white text-black p-2 rounded-lg'>
                    Announcements {highlights?.length ? `(${highlights.length})` : ''}
                </div> */}

                {isLoading ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400">Loading Announcements...</div>
                    </div>
                ) : (
                    <>
                        <div
                            ref={containerRef}
                            className="flex transition-transform duration-300 w-full h-full"
                            style={{ willChange: 'transform' }}
                        >
                            {highlights?.length ?? 0 > 0 ? highlights?.map((item, index) => (
                                <div key={index} className="w-full flex-shrink-0 min-w-full h-full flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                        <a href={item.link || ""} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                                            <img
                                                src={item.image}
                                                alt={item.caption || ""}
                                                loading="eager"
                                                className="w-full h-full object-cover"
                                                style={{ display: 'block' }}
                                            />
                                        </a>
                                    ) : (
                                        <div className="w-full h-full bg-[#0b790b] flex items-center justify-center"></div>
                                    )}
                                </div>
                            )) : (
                                <div className="w-full h-full bg-[#0b790b] flex items-center justify-center">
                                    <div className="text-white">No highlights available</div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Arrows */}
                        {highlights && highlights.length > 1 && (
                            <>
                                <button
                                    className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-[3rem] font-bold bg-transparent border-none outline-none cursor-pointer z-20 select-none"
                                    onClick={() => {
                                        goToPrev();
                                        stopAutoRotate();
                                    }}
                                    aria-label="Previous slide"
                                    style={{ background: 'none', boxShadow: 'none' }}
                                >
                                    &#8592;
                                </button>
                                <button
                                    className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-[3rem] font-bold bg-transparent border-none outline-none cursor-pointer z-20 select-none"
                                    onClick={() => {
                                        goToNext();
                                        stopAutoRotate();
                                    }}
                                    aria-label="Next slide"
                                    style={{ background: 'none', boxShadow: 'none' }}
                                >
                                    &#8594;
                                </button>
                            </>
                        )}

                        {/* Indicator Dots */}
                        {highlights && highlights.length > 1 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                                {highlights.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${currentIndex === idx ? '' : 'opacity-50'}`}
                                        style={{ display: 'inline-block' }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 