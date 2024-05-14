<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getStorage, ref, getDownloadURL } from "firebase/storage";
  import { app } from "../../firebase"; // Ensure this path is correct

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
      const storage = getStorage(app);
      const imageRef = ref(storage, url);
      const downloadURL = await getDownloadURL(imageRef);

      const response = await fetch(downloadURL, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      console.log('Download triggered for:', downloadURL); // Log for debugging
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
    <button on:click={closeModal} class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
      Close
    </button>
    {#if !isFirst}
      <button on:click={onPrev} class="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
        &lt;
      </button>
    {/if}
    <div class="relative bg-white p-4 rounded-lg w-[50vw] h-[50vh] max-w-[50vw] max-h-[50vh]" on:click|stopPropagation>
      <img src={src} alt="Full view" class="w-full h-full object-contain" />
      <button
        class="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        on:click={() => downloadImage(src)}
      >
        Download
      </button>
    </div>
    {#if !isLast}
      <button on:click={onNext} class="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
        &gt;
      </button>
    {/if}
  </div>
{/if}

<style>
  /* Adjust the button style as needed */
  button {
    z-index: 1000;
  }
</style>
