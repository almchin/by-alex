<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '../../firebase';
  import { getDownloadURL, ref, listAll } from 'firebase/storage';
  import Modal from './Modal.svelte';

  type Image = {
    name: string;
    url: string;
  };

  let images: Image[] = [];
  let selectedImage: string = '';
  let isModalOpen: boolean = false;
  let currentIndex: number = 0;
  let error: string | null = null;

  onMount(async () => {
    try {
      const storageRef = ref(storage, 'uploads/');
      const imageList = await listAll(storageRef);
      images = await Promise.all(
        imageList.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
    } catch (err: any) { // Explicitly define the type of err as any
      error = err.message || 'An error occurred while fetching images';
      console.error('Error fetching images:', err);
    }
  });

  const openModal = (url: string) => {
    selectedImage = url;
    currentIndex = images.findIndex((image) => image.url === url);
    isModalOpen = true;
  };

  const closeModal = () => {
    isModalOpen = false;
    selectedImage = '';
  };

  const showNextImage = () => {
    if (currentIndex < images.length - 1) {
      currentIndex += 1;
      selectedImage = images[currentIndex].url;
    }
  };

  const showPrevImage = () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      selectedImage = images[currentIndex].url;
    }
  };
</script>

<main class="pt-24 lg mt-[10px]:w-1/2 lg mt-[10px]:py-24">
  {#if error}
    <div class="text-red-500">{error}</div>
  {/if}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each images as image}
      <div class="relative p-2">
        <div class="w-[150px] h-[150px]">
          <button on:click={() => openModal(image.url)} class="w-full h-full">
            <img
              src={image.url}
              alt={image.name}
              class="w-full h-full object-cover rounded-lg cursor-pointer"
            />
          </button>
        </div>
      </div>
    {/each}
  </div>
  <Modal 
    isOpen={isModalOpen} 
    src={selectedImage} 
    onClose={closeModal} 
    onNext={showNextImage} 
    onPrev={showPrevImage} 
    isFirst={currentIndex === 0} 
    isLast={currentIndex === images.length - 1} 
  />
</main>

<style>
  /* Add any additional styling here */
</style>
