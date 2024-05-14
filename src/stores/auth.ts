import { writable } from 'svelte/store';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // Import type only

// Ensure the store can handle both User and null
export const user = writable<User | null>(null);

onAuthStateChanged(auth, (currentUser) => {
  user.set(currentUser);
});
