import { HttpErrorResponse } from '@angular/common/http';

export const extractErrorMessage = (response: HttpErrorResponse, fallback: string): string => {
  if (response?.error?.errors) {
    const errors = response.error.errors as Record<string, string[]>;
    return Object.values(errors).flat().join(' ');
  }
  return response?.error?.message ?? fallback;
};
