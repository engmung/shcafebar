<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
  
    export let isLoading;
  
    let imageLoaded = false;
    let timerExpired = false;
  
    function checkLoading() {
      if (imageLoaded && timerExpired) {
        isLoading = false;
      }
    }
  
    onMount(() => {
      const img = new Image();
      img.src = '/bg.jpg';
      img.onload = () => {
        imageLoaded = true;
        checkLoading();
      };
  
      setTimeout(() => {
        timerExpired = true;
        checkLoading();
      }, 1000);
    });
  </script>
  
  {#if isLoading}
    <div class="loading-overlay" transition:fade={{ duration: 300 }}>
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  {/if}
  
  <style>
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000000; /* 완전 불투명한 검정색으로 변경 */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
  
    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  
    p {
      color: #fff;
      margin-top: 1rem;
      font-size: 1.2rem;
    }
  </style>