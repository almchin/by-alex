<script lang="ts">
    import { user } from '../../stores/auth';
    import { auth } from '../../firebase';
    import { signOut } from 'firebase/auth';
    import { goto } from '$app/navigation';
    import type { User } from 'firebase/auth';
    import UploadButton from './UploadButton.svelte';
    import { currentPage, updateCurrentPage } from '../../stores/page';
    import { onMount } from 'svelte';
  
    let currentUser: User | null = null;
  
    // Auto-subscribe to the user store
    $: currentUser = $user;
  
    onMount(() => {
      updateCurrentPage(window.location.pathname); // Update the currentPage store based on the current URL
    });
  
    async function handleLogout() {
      await signOut(auth);
      goto('/');
    }
  
    function navigate() {
      if ($currentPage === 'home') {
        currentPage.set('downloadHistory');
        goto('/DownloadHistory');
      } else {
        currentPage.set('home');
        goto('/Home');
      }
    }
  </script>
  
  <header class="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
    <div>
      <h1 class="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">Alex Chin</h1>
      <h2 class="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">Photography Gallery</h2>
      <p class="mt-4 max-w-xs leading-normal text-slate-400">Amateur Developer and Photographer<br/><br/>Last seen working with: <a href="https://instagram.com/ehsmensvball" class="text-slate-300 hover:underline" target="_blank">@ehsmensvball</a> on Instagram</p>
      <nav class="nav hidden lg:block" aria-label="In-page jump links">
        <ul class="mt-[20px] w-max">
          <li><a class="group flex items-center py-2" href="#mvb23"><span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">EHS Men's Volleyball 2023</span></a></li>
          <li><a class="group flex items-center py-2" href="#portugal"><span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Portugal 2023</span></a></li>
          <li><a class="group flex items-center py-2" href="#wvbsnr23"><span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">EHS Women's Volleyball 2023 Senior Night</span></a></li>
          <li><a class="group flex items-center py-2" href="#mvb24"><span class="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">EHS Men's Volleyball 2024</span></a></li>
        </ul>
      </nav>
    </div>
    <ul class="ml-1 mt-8 flex items-center" aria-label="Social media">
      <a href="https://instagram.com/by.a1ex" target="_blank"><li class="fa-brands fa-instagram fa-2x mr-5 text-neutral-50 hover:text-neutral-300"></li></a>
      <a href="https://twitter.com/alex_ch1n" target="_blank"><li class="fa-brands fa-x-twitter fa-2x mr-5 text-neutral-50 hover:text-neutral-300"></li></a>
      <a href="https://linkedin.com/in/alex-m-chin" target="_blank"><li class="fa-brands fa-linkedin fa-2x mr-5 text-neutral-50 hover:text-neutral-300"></li></a>
      <a href="https://github.com/almchin" target="_blank"><li class="fa-brands fa-github fa-2x mr-5 text-neutral-50 hover:text-neutral-300"></li></a>
    </ul>
  
    <div>
      {#if currentUser}
        <button on:click={handleLogout} class="mt-[30px] btn bg-[#1c1c1c] hover:bg-[#141414] text-white rounded-lg w-[100px] text-[16px]">
          Log Out
        </button>
        <p class="text-[#525252] mt-4 text-sm">Now logged in as: {currentUser.email}</p>
        <UploadButton />
        <button on:click={navigate} class="mt-[30px] btn bg-[#1c1c1c] hover:bg-[#141414] text-white rounded-lg w-[200px] text-[16px]">
          {#if $currentPage === 'home'}
            View Download History
          {:else}
            Back
          {/if}
        </button>
      {:else}
        <a href="/LogIn">
          <div class="mt-[30px] btn bg-[#e6e6e6] hover:bg-[#b8b8b8] text-black rounded-lg w-[100px] text-[16px]">
            Log In
          </div>
        </a>
      {/if}
    </div>
  </header>
  
  <style>
  </style>
  