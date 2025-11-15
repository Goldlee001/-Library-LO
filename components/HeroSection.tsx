"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_DATA = [
  {
    id: 1,
    src: "/images/hero.jpg",
    alt: "Landscape painting.",
    caption:
      "Image 1 of 5: Detailed credit line or source for hero.jpg goes here.",
  },
  {
    id: 2,
    src: "/images/hero2.jpg",
    alt: "Elizabeth Catlett, Roots (detail), 1981.",
    caption:
      "Image 2 of 5: Elizabeth Catlett, Roots (detail), 1981. Art © Estate of Elizabeth Catlett / Licensed by VAGA, New York, NY.",
  },
  {
    id: 3,
    src: "/images/hero3.jpg",
    alt: "Historic document.",
    caption:
      "Image 3 of 5: Detailed credit line or source for hero3.jpg goes here.",
  },
  {
    id: 4,
    src: "/images/hero2.jpg",
    alt: "Elizabeth Catlett, Roots (detail), 1981.",
    caption:
      "Image 4 of 5: Elizabeth Catlett, Roots (detail), 1981. Art © Estate of Elizabeth Catlett / Licensed by VAGA, New York, NY.",
  },
  {
    id: 5,
    src: "/images/hero3.jpg",
    alt: "Historic document.",
    caption:
      "Image 5 of 5: Detailed credit line or source for hero3.jpg goes here.",
  },
];

const HeroSection: React.FC = () => {
  const totalImages = SLIDE_DATA.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  // ▶️ Handle next and previous navigation
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));

  // ⏱️ Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [totalImages]);

  const currentSlide = SLIDE_DATA[currentIndex];
  const leftShiftValue = `-${currentIndex * 100}%`;

  return (
    <section className="bg-white pb-0 relative overflow-hidden mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full z-10 relative">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-light leading-snug max-w-4xl text-black pt-8 sm:pt-10">
          Explore the world’s knowledge, cultures, and ideas
        </h1>
      </div>

      {/* 🖼️ Image Carousel */}
      <div className="relative w-full overflow-hidden mt-6">
        <div className="relative h-[220px] sm:h-[300px] md:h-[400px] bg-gray-200">
          <div
            className="absolute top-0 left-0 flex h-full transition-all duration-700 ease-in-out"
            style={{
              width: `${totalImages * 100}%`,
              left: leftShiftValue,
            }}
          >
            {SLIDE_DATA.map((slide) => (
              <div
                key={slide.id}
                className="flex-shrink-0 w-full relative"
                style={{ width: `${100 / totalImages}%` }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 📜 Caption + Controls */}
        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-2 sm:p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm">
          <p className="max-w-[90%] sm:max-w-[75%] font-light leading-snug mb-2 sm:mb-0">
            {currentSlide.caption}
          </p>
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            <span className="font-semibold">
              Image {currentIndex + 1} of {totalImages}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={handlePrev}
                className="p-1 hover:bg-white hover:text-black rounded transition"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-1 hover:bg-white hover:text-black rounded transition"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
