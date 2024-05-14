<script>
    import Header from "../../lib/components/Header.svelte";
    import "../../app.css";
  </script>
  
  <div class="mx-auto min-h-screen max-w-screen-2xl px-6 py-12 font-sans md:px-12 md:py-20 lg:px-24 lg:py-0 lg:flex lg:justify-between lg:gap-4">
    <div class="w-5/12">
      <Header />
    </div>
    <div class="w-7/12">
      <slot />
    </div>
  </div>