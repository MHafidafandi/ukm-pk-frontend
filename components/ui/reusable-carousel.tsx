// components/ui/reusable-carousel.tsx
"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// types/carousel.ts
interface CarouselItemData {
  id: string | number;
  content: React.ReactNode;
  className?: string;
}

interface CarouselProps {
  items: CarouselItemData[];
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  itemClassName?: string;
  orientation?: "horizontal" | "vertical";
  stopOnInteraction?: boolean;
}

export function ReusableCarousel({
  items,
  autoplay = true,
  autoplayDelay = 3000,
  loop = false,
  showControls = true,
  showIndicators = false,
  className,
  itemClassName,
  orientation = "horizontal",
  stopOnInteraction = true,
}: CarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction,
      stopOnMouseEnter: stopOnInteraction,
    }),
  );

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel
        setApi={setApi}
        plugins={autoplay ? [plugin.current] : []}
        orientation={orientation}
        opts={{
          loop,
          align: "start",
        }}
        className="w-full"
        onMouseEnter={
          autoplay && stopOnInteraction ? plugin.current.stop : undefined
        }
        onMouseLeave={
          autoplay && stopOnInteraction ? plugin.current.reset : undefined
        }
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className={cn(itemClassName)}>
              <div className={cn("p-1", item.className)}>{item.content}</div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            <CarouselPrevious
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2",
                orientation === "vertical" && "left-1/2 -translate-x-1/2 top-4",
              )}
            />
            <CarouselNext
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                orientation === "vertical" &&
                  "left-1/2 -translate-x-1/2 bottom-4",
              )}
            />
          </>
        )}
      </Carousel>

      {showIndicators && count > 1 && (
        <div
          className={cn(
            "flex justify-center gap-2 py-4",
            orientation === "vertical" &&
              "absolute right-4 top-1/2 -translate-y-1/2 flex-col",
          )}
        >
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                index === current ? "bg-primary" : "bg-muted",
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
