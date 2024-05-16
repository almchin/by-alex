<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getStorage, ref, getDownloadURL } from 'firebase/storage';
  import { app } from "../../firebase";
  import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { user } from '../../stores/auth';
  import type { User } from 'firebase/auth';

  let currentUser: User | null = null;
  $: currentUser = $user;

  export let isOpen: boolean = false;
  export let src: string = '';
  export let onClose: () => void = () => {};
  export let onNext: () => void = () => {};
  export let onPrev: () => void = () => {};
  export let isFirst: boolean = false;
  export let isLast: boolean = false;

  const closeModal = () => {
    onClose();
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop()?.split('?')[0] || 'download'; // Remove query parameters from filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Record download history
      if (currentUser) {
        const db = getFirestore(app);
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'downloads'), {
          url: url,
          timestamp: serverTimestamp(),
          userID: currentUser.uid
        });
        console.log('Document written with ID: ', docRef.id);
      }

      console.log('Download triggered for:', url);
    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (isOpen) {
      if (event.key === 'ArrowRight' && !isLast) {
        onNext();
      } else if (event.key === 'ArrowLeft' && !isFirst) {
        onPrev();
      } else if (event.key === 'Escape') {
        closeModal();
      }
    }
  };

  const handleBackgroundKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      closeModal();
    }
  };

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    on:click={closeModal}
    role="button"
    tabindex="0"
    on:keydown={handleBackgroundKeydown}
    aria-label="Close modal"
  >
    <div class="absolute top-4 right-4 flex space-x-2 z-10">
      <button
        on:click={() => downloadImage(src)}
        class="bg-[#e6e6e6] hover:bg-[#b8b8b8] text-black font-bold py-2 px-5 rounded mr-[10px]"
      >
      <i class="fa-solid fa-download"></i>
      </button>
      <button on:click={closeModal} class="text-white bg-black bg-opacity-50 rounded-full p-2">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    {#if !isFirst}
      <button on:click={onPrev} class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
    {/if}
    <img src={src} alt="Full view" class="max-w-[70vw] max-h-[70vh] object-contain shadow-lg" on:click|stopPropagation />
    {#if !isLast}
      <button on:click={onNext} class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    {/if}
  </div>
{/if}

<style>
  button {
    z-index: 1000;
  }
</style>
