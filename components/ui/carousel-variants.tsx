// components/ui/carousel-variants.tsx
import { Card, CardContent } from "@/components/ui/card";
import { ReusableCarousel } from "./reusable-carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

// 1. Carousel dengan Card
export function CardCarousel({
  items,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ReusableCarousel>, "items"> & {
  items: Array<{ id: string | number; title: string; description?: string }>;
}) {
  return (
    <ReusableCarousel
      items={items.map((item) => ({
        id: item.id,
        content: (
          <Card className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {item.description}
                </p>
              )}
            </CardContent>
          </Card>
        ),
        className: "md:basis-1/2 lg:basis-1/3",
      }))}
      className={className}
      {...props}
    />
  );
}

// 2. Carousel dengan Gambar
export function ImageCarousel({
  images,
  className,
  aspectRatio = "aspect-video",
  ...props
}: Omit<React.ComponentProps<typeof ReusableCarousel>, "items"> & {
  images: Array<{
    id: string | number;
    src: string;
    alt: string;
    caption?: string;
  }>;
  aspectRatio?: string;
}) {
  return (
    <ReusableCarousel
      items={images.map((image) => ({
        id: image.id,
        content: (
          <div className="relative overflow-hidden rounded-lg">
            <div className={cn("relative w-full", aspectRatio)}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {image.caption && (
              <p className="mt-2 text-sm text-center text-muted-foreground">
                {image.caption}
              </p>
            )}
          </div>
        ),
      }))}
      className={className}
      {...props}
    />
  );
}

// 3. Carousel dengan Konten Custom
export function CustomCarousel({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ReusableCarousel>, "items"> & {
  children: React.ReactNode[];
}) {
  return (
    <ReusableCarousel
      items={React.Children.toArray(children).map((child, index) => ({
        id: index,
        content: child,
      }))}
      className={className}
      {...props}
    />
  );
}

// 4. Carousel untuk Testimonial
export function TestimonialCarousel({
  testimonials,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ReusableCarousel>, "items"> & {
  testimonials: Array<{
    id: string | number;
    name: string;
    role: string;
    content: string;
    avatar?: string;
  }>;
}) {
  return (
    <ReusableCarousel
      items={testimonials.map((testimonial) => ({
        id: testimonial.id,
        content: (
          <div className="text-center p-6">
            <p className="text-lg italic mb-4">{testimonial.content}</p>
            <div className="flex items-center justify-center gap-3">
              {testimonial.avatar && (
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        ),
        className: "md:basis-1/2 lg:basis-1/3",
      }))}
      className={cn("max-w-3xl mx-auto", className)}
      {...props}
    />
  );
}
