<script lang="ts">
    import { auth, storage } from '../../firebase';
    import { ref, uploadBytes } from 'firebase/storage';
    import { onAuthStateChanged } from 'firebase/auth';
    import { writable } from 'svelte/store';
    import type { User } from 'firebase/auth';
  
    let files: File[] = [];
    let fileNames: string[] = [];
    let isAuthorized = writable(false);
  
    const checkAuthorization = (user: User | null) => {
      if (user && user.uid === 'pNKSn7tIE3PV62QlijprM546luj1') {
        isAuthorized.set(true);
      } else {
        isAuthorized.set(false);
      }
    };
  
    onAuthStateChanged(auth, (user) => {
      checkAuthorization(user);
    });
  
    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        files = Array.from(target.files);
        fileNames = files.map(file => file.name); // Update fileNames array with selected file names
      }
    };
  
    const uploadFiles = async () => {
      const uploadPromises = files.map(file => {
        const storageRef = ref(storage, 'uploads/' + file.name);
        return uploadBytes(storageRef, file);
      });
  
      try {
        await Promise.all(uploadPromises);
        alert('Files uploaded successfully!');
        fileNames = []; // Clear fileNames after upload
        files = [];     // Clear files after upload
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
    <div class="flex flex-col items-start">
      <input
        id="fileInput"
        type="file"
        multiple
        on:change={handleFileChange}
        class="hidden"
      />
      <button
        type="button"
        on:click={triggerFileInput}
        class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Choose Files
      </button>
      {#if fileNames.length > 0}
        <div class="mt-2 text-gray-700">
          <p>Selected files:</p>
          <ul>
            {#each fileNames as fileName}
              <li>{fileName}</li>
            {/each}
          </ul>
        </div>
        <button
          type="button"
          on:click={uploadFiles}
          class="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload
        </button>
      {/if}
    </div>
  {/if}
  