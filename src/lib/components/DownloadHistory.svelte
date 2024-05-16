<script lang="ts">
    import { onMount } from 'svelte';
    import { getFirestore, collection, query, where, getDocs, type DocumentData } from 'firebase/firestore';
    import { app, auth } from '../../firebase'; // Ensure this path is correct
    import type { User } from 'firebase/auth';
    import { user } from '../../stores/auth';
    import Modal from './Modal.svelte';
    
    let currentUser: User | null = null;
    $: currentUser = $user;
    
    let downloads: DocumentData[] = [];
    let isModalOpen = false;
    let modalSrc = '';
    let currentIndex = 0;
    let loading = true; // Add a loading state
  
    const fetchDownloadHistory = async (userId: string) => {
      const db = getFirestore(app);
      const q = query(
        collection(db, 'users', userId, 'downloads'),
        where('userID', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      console.log('Query Snapshot:', querySnapshot);
      downloads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loading = false; // Set loading to false after fetching data
    };
  
    onMount(() => {
      const unsubscribe = user.subscribe(async (u) => {
        if (u) {
          await fetchDownloadHistory(u.uid).catch(err => {
            console.error('Error fetching download history:', err);
          });
        }
      });
  
      return () => unsubscribe(); // Cleanup the subscription
    });
  
    const openModal = (src: string, index: number) => {
      modalSrc = src;
      currentIndex = index;
      isModalOpen = true;
    };
  
    const closeModal = () => {
      isModalOpen = false;
      modalSrc = '';
    };
  
    const nextImage = () => {
      if (currentIndex < downloads.length - 1) {
        currentIndex += 1;
        modalSrc = downloads[currentIndex].url;
      }
    };
  
    const prevImage = () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        modalSrc = downloads[currentIndex].url;
      }
    };
  </script>
  
  <main class="pt-24 lg mt-[10px]:w-1/2 lg mt-[10px]:py-24 custom-margin">
    <section id="download-history" class="mb-16 scroll-mt-16 md:mb-24 lg:mt-[10px]:mb-36 lg:scroll-mt-24">
      <h1 class="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl mb-8">Download History</h1>
      {#if currentUser}
        {#if loading}
          <p>Loading...</p>
        {:else if downloads.length > 0}
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each downloads as download, index}
              <div>
                <img
                  src={download.url}
                  alt="Downloaded image"
                  class="w-[150px] h-[150px] object-cover rounded-lg cursor-pointer"
                  on:click={() => openModal(download.url, index)}
                />
                <p class="text-xs text-gray-600">{new Date(download.timestamp.toMillis()).toLocaleString()}</p>
              </div>
            {/each}
          </div>
          <Modal
            isOpen={isModalOpen}
            src={modalSrc}
            onClose={closeModal}
            onNext={nextImage}
            onPrev={prevImage}
            isFirst={currentIndex === 0}
            isLast={currentIndex === downloads.length - 1}
          />
        {:else}
          <p>No downloads found for user: {currentUser.uid}</p>
        {/if}
      {:else}
        <p>Please log in to view your download history.</p>
      {/if}
    </section>
  </main>
  
  <style>
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
  
    .custom-margin {
      margin-top: 5rem; /* Adjust this value to move the section down */
    }
  
    img {
      border-radius: 0.5rem;
    }
  </style>
  