import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // throw new Error("Invalid date string provided to formatDate");
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Failed to format date:", dateString, error);
    return "Invalid Date";
  }
}
