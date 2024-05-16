import { writable } from 'svelte/store';

export const currentPage = writable('home');

// Function to update the current page based on the current URL
export function updateCurrentPage(url: string) {
  if (url.includes('DownloadHistory')) {
    currentPage.set('downloadHistory');
  } else {
    currentPage.set('home');
  }
}
