<script lang="ts">
  import { auth, storage } from '../../firebase';
  import { ref, uploadBytesResumable, listAll } from 'firebase/storage';
  import { onAuthStateChanged } from 'firebase/auth';
  import { writable } from 'svelte/store';
  import type { User } from 'firebase/auth';

  let files: File[] = [];
  let fileNames: string[] = [];
  let isAuthorized = writable(false);
  let currentUser: User | null = null;
  let totalProgress = writable<number>(0);
  let eventFolders = writable<string[]>([]);
  let selectedEvent = writable<string | null>(null);

  const checkAuthorization = (user: User | null) => {
    if (user && user.uid === 'pNKSn7tIE3PV62QlijprM546luj1') {
      isAuthorized.set(true);
      currentUser = user;
      fetchEventFolders();
    } else {
      isAuthorized.set(false);
    }
  };

  const fetchEventFolders = async (folderPath: string = 'uploads/') => {
    try {
      const storageRef = ref(storage, folderPath);
      const result = await listAll(storageRef);

      const folders = result.prefixes.map(folder => folder.fullPath.replace('uploads/', ''));
      eventFolders.update(current => [...current, ...folders]);

      for (const folder of result.prefixes) {
        await fetchEventFolders(folder.fullPath);
      }
    } catch (error) {
      console.error('Error fetching event folders:', error);
    }
  };

  onAuthStateChanged(auth, (user) => {
    checkAuthorization(user);
  });

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      files = Array.from(target.files);
      fileNames = files.map(file => file.name);
      totalProgress.set(0);
    }
  };

  const uploadFiles = async () => {
    if (!currentUser) {
      alert('User not authorized to upload files.');
      return;
    }

    if (!$selectedEvent) {
      alert('Please select an event folder.');
      return;
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let bytesTransferred = 0;

    const uploadPromises = files.map((file) => {
      const storageRef = ref(storage, `uploads/${$selectedEvent}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            bytesTransferred += snapshot.bytesTransferred - (bytesTransferred / files.length);
            const progress = (bytesTransferred / totalBytes) * 100;
            totalProgress.set(progress);
          },
          (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          },
          () => {
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      alert('Files uploaded successfully!');
      fileNames = [];
      files = [];
      totalProgress.set(0);
      location.reload(); // Refresh the page to show the newly uploaded files
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files.');
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput')?.click();
  };
</script>

{#if $isAuthorized}
  <div class="flex flex-col items-start w-full">
    <select bind:value={$selectedEvent} class="select select-bordered mt-2 w-full mb-[15px]">
      <option value="" disabled selected>Select an event</option>
      {#each $eventFolders as folder}
        <option value={folder}>{folder}</option>
      {/each}
    </select>
    <input
      id="fileInput"
      type="file"
      multiple
      on:change={handleFileChange}
      class="hidden"
    />
    <div class="flex space-x-4 mt-2 w-full">
      <button
        type="button"
        on:click={triggerFileInput}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Choose Files
      </button>
      {#if fileNames.length > 0}
        <button
          type="button"
          on:click={uploadFiles}
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload
        </button>
      {/if}
    </div>
    {#if fileNames.length > 0}
      <div class="mt-2 text-gray-700 w-full">
        <p>Selected files:</p>
        <ul>
          {#each fileNames as fileName}
            <li>{fileName}</li>
          {/each}
        </ul>
        <div class="w-full bg-gray-200 rounded mt-2 h-4">
          <div 
            class="bg-blue-500 text-xs leading-none h-full rounded progress-bar"
            style="width: {$totalProgress}%">
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .progress-bar {
    background-color: #3b82f6; /* Tailwind blue-500 */
  }
</style>
