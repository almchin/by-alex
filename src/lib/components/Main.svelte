<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '../../firebase';
  import { getDownloadURL, ref, listAll } from 'firebase/storage';
  import Modal from './Modal.svelte';
  import { user } from '../../stores/auth';
  import type { User } from 'firebase/auth';
  import 'daisyui/dist/full.css'; // Ensure DaisyUI is imported

  type Image = {
    name: string;
    url: string;
  };

  type Folder = {
    name: string;
    path: string;
    images: Image[];
    subfolders: Folder[];
  };

  let folders: Folder[] = [];
  let selectedImage: string = '';
  let isModalOpen: boolean = false;
  let currentIndex: number = 0;
  let error: string | null = null;
  let currentUser: User | null = null;
  let loading: boolean = true;

  $: currentUser = $user;

  const fetchFolderContents = async (folderPath: string): Promise<Folder> => {
    const folderRef = ref(storage, folderPath);
    const folderContents = await listAll(folderRef);

    const images: Image[] = await Promise.all(
      folderContents.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      })
    );

    const subfolders: Folder[] = await Promise.all(
      folderContents.prefixes.map(async (subfolderRef) => {
        return fetchFolderContents(subfolderRef.fullPath);
      })
    );

    return {
      name: folderRef.name,
      path: folderRef.fullPath,
      images,
      subfolders,
    };
  };

  const fetchImages = async (): Promise<void> => {
    try {
      const rootFolder = await fetchFolderContents('uploads/');
      folders = rootFolder.subfolders;
    } catch (err: any) {
      error = err.message || 'An error occurred while fetching images';
      console.error('Error fetching images:', err);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    const unsubscribe = user.subscribe(async ($user) => {
      currentUser = $user;
      if (currentUser) {
        await fetchImages();
      } else {
        loading = false;
      }
    });

    return (): void => {
      unsubscribe();
    };
  });

  const openModal = (url: string): void => {
    selectedImage = url;
    const allImages = getAllImages(folders);
    currentIndex = allImages.findIndex((image) => image.url === url);
    isModalOpen = true;
  };

  const closeModal = (): void => {
    isModalOpen = false;
    selectedImage = '';
  };

  const showNextImage = (): void => {
    const allImages = getAllImages(folders);
    if (currentIndex < allImages.length - 1) {
      currentIndex += 1;
      selectedImage = allImages[currentIndex].url;
    }
  };

  const showPrevImage = (): void => {
    const allImages = getAllImages(folders);
    if (currentIndex > 0) {
      currentIndex -= 1;
      selectedImage = allImages[currentIndex].url;
    }
  };

  const getAllImages = (folders: Folder[]): Image[] => {
    return folders.flatMap(folder => [
      ...folder.images,
      ...getAllImages(folder.subfolders)
    ]);
  };

  const renderFolder = (folder: Folder): any => {
    return `
      <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium">
          ${folder.name}
        </div>
        <div class="collapse-content">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${folder.images.map(image => `
              <div class="relative p-2">
                <div class="w-[150px] h-[150px]">
                  <button on:click="openModal('${image.url}')" class="w-full h-full">
                    <img
                      src="${image.url}"
                      alt="${image.name}"
                      class="w-full h-full object-cover rounded-lg cursor-pointer"
                    />
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          ${folder.subfolders.map(subfolder => renderFolder(subfolder)).join('')}
        </div>
      </div>
    `;
  };
</script>

<main class="pt-24 lg mt-[10px]:w-1/2 lg mt-[10px]:py-24">
  {#if loading}
    <div class="text-center text-gray-500">Loading...</div>
  {:else if error}
    <div class="text-red-500">{error}</div>
  {:else if !currentUser}
    <div class="text-center text-gray-500">Please log in to view photos</div>
  {:else}
    {#each folders as folder}
      {@html renderFolder(folder)}
    {/each}
    <Modal 
      isOpen={isModalOpen} 
      src={selectedImage} 
      onClose={closeModal} 
      onNext={showNextImage} 
      onPrev={showPrevImage} 
      isFirst={currentIndex === 0} 
      isLast={currentIndex === getAllImages(folders).length - 1} 
    />
  {/if}

  <p class="max-w-md mb-[50px] text-sm text-slate-500 sm:pb-0 mt-[50px] hidden lg:block">© 2024 Alex Chin. Design inspired by <a target="_blank" href="https://github.com/bchiang7" class="hover:underline">Brittany Chiang</a></p>
</main>

<style>
  /* Add any additional styling here */
</style>
