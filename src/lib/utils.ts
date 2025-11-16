import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      // Fallback for non-ISO strings that JS Date constructor might handle
      const fallbackDate = new Date(dateString);
      if (!isValid(fallbackDate)) {
        return "Invalid Date";
      }
      return new Intl.DateTimeFormat('en-US', options).format(fallbackDate);
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Failed to format date:", dateString, error);
    return "Invalid Date";
  }
}
