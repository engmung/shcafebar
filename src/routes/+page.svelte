<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  function navigateTo(path) {
    goto(path);
  }

  let imagesLoaded = false;
  
  onMount(() => {
    const images = document.querySelectorAll('.button-image');
    let loadedCount = 0;
    
    function imageLoaded() {
      loadedCount++;
      if (loadedCount === images.length) {
        imagesLoaded = true;
      }
    }
    
    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
      }
    });
  });
</script>

<svelte:head>
  <title>Home - Bar & Cafe</title>
</svelte:head>

<div class="container">
  <h1>Welcome to SH's Bar & Cafe</h1>
  <p>Set up some refreshments. Join me for food and conversation?</p>

  <div class="button-container">
    <button class="large-button" on:click={() => navigateTo('/reservations')}>
      <img src="/time.png" alt="Time" class="button-image" loading="eager" />
      <span class="button-text">Reservation</span>
    </button>
    <button class="large-button" on:click={() => navigateTo('/menu')}>
      <img src="/menu.png" alt="Menu" class="button-image" loading="eager" />
      <span class="button-text">View Menu</span>
    </button>
  </div>
</div>

<style>
  .container {
    text-align: center;
    padding: 1rem;
    padding-top: 0;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  p {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .large-button {
    width: 250px;
    height: 250px;
    border: 2px solid var(--color-secondary);
    border-radius: 15px;
    background-color: rgba(18, 18, 18, 0.6);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .large-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(187, 134, 252, 0.3);
  }

  .button-image {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-bottom: 1rem;
  }

  .button-text {
    color: var(--color-secondary);
    font-size: 1.5rem;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .large-button {
      width: 200px;
      height: 200px;
    }

    .button-image {
      width: 80px;
      height: 80px;
    }

    .button-text {
      font-size: 1.2rem;
    }
  }
</style>