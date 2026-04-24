"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

const trackClass =
  "relative h-2 w-full grow overflow-hidden rounded-full bg-field";
const rangeClass = "absolute h-full rounded-full bg-accent-ink/85";
const thumbClass =
  "block size-4 shrink-0 rounded-full border border-border-strong bg-surface-raised shadow-sm transition-[box-shadow,transform] duration-150 ease-smooth hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

type RangeSliderProps = Omit<
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange"
> & {
  value: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
};

const RangeSlider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(
  (
    {
      className = "",
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      ...props
    },
    ref
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      {...props}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={value}
      onValueChange={(v) => {
        if (v.length === 2) onValueChange?.([v[0], v[1]]);
      }}
      className={`relative flex w-full touch-none select-none items-center ${className}`}
    >
      <SliderPrimitive.Track className={trackClass}>
        <SliderPrimitive.Range className={rangeClass} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={thumbClass} aria-label="Budget minimum" />
      <SliderPrimitive.Thumb className={thumbClass} aria-label="Budget maximum" />
    </SliderPrimitive.Root>
  )
);
RangeSlider.displayName = "RangeSlider";

/** Curseur unique (min = max dans le tableau de valeurs). */
const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  Omit<
    ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange"
  > & {
    value?: number[];
    defaultValue?: number[];
    onValueChange?: (value: number[]) => void;
  }
>(({ className = "", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex w-full touch-none select-none items-center ${className}`}
    {...props}
  >
    <SliderPrimitive.Track className={trackClass}>
      <SliderPrimitive.Range className={rangeClass} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={thumbClass} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider, RangeSlider };
