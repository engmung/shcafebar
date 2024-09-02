<script>
  import { goto } from '$app/navigation';

  function navigateTo(path) {
    goto(path);
  }
</script>

<svelte:head>
  <title>Home - Bar & Cafe</title>
</svelte:head>

<div class="container">
  <h1>Welcome to SH's Bar & Cafe</h1>
  <p>Set up some refreshments. Join me for food and conversation?</p>

  <div class="button-container">
    <button class="large-button reservation" on:click={() => navigateTo('/reservations')}>
      <div class="icon-placeholder">
        <img src="/time.png" alt="Time" class="icon-image" />
      </div>
      <span>Reservation</span>
    </button>
    <button class="large-button menu" on:click={() => navigateTo('/menu')}>
      <div class="icon-placeholder">
        <img src="/menu.png" alt="Menu" class="icon-image" />
      </div>
      <span>View Menu</span>
    </button>
  </div>
</div>

<style>
  .container {
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .large-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    border: none;
    border-radius: 10px;
    background-color: var(--color-secondary);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
  }

  .large-button:hover {
    background-color: var(--color-accent);
    transform: translateY(-5px);
  }

  .icon-placeholder {
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin-bottom: 1rem;
  }

  .icon-image {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Prevent image overflow */
  }

  @media (max-width: 600px) {
    .large-button {
      width: 100%;
      max-width: 300px;
      height: 150px;
    }

    .icon-placeholder {
      width: 70px;
      height: 70px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      margin-bottom: 1rem;
    }
  }
</style>