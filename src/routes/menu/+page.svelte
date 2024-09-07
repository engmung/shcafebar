<script>
  import { onMount } from 'svelte';
  import MenuDetailPopup from '$lib/MenuDetailPopup.svelte';

  let menuItems = [];
  let selectedItem = null;

  onMount(async () => {
    const response = await fetch('/api/menu');
    if (response.ok) {
      menuItems = await response.json();
    } else {
      console.error('Failed to load menu items');
    }
  });

  async function showDetails(item) {
    const response = await fetch(`/api/menu/${item.id}`);
    if (response.ok) {
      selectedItem = await response.json();
    } else {
      console.error('Failed to load menu item details');
    }
  }

  function closePopup() {
    selectedItem = null;
  }
</script>

<h1>Our Menu</h1>

{#if menuItems.length > 0}
  <div class="menu-grid">
    {#each menuItems as item}
      <div class="menu-item">
        {#if item.image_url}
          <img src={item.image_url} alt={item.name} class="menu-image" />
        {/if}
        <div class="menu-content">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p class="price">${item.price.toFixed(2)}</p>
          <p class="category">{item.category}</p>
          <button on:click={() => showDetails(item)}>View Details</button>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p>No menu items available.</p>
{/if}

<MenuDetailPopup item={selectedItem} onClose={closePopup} />

<style>
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  .menu-item {
    background-color: rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
    padding: 1rem;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
  }
  .menu-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 5px 5px 0 0;
  }
  .menu-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .price {
    font-weight: bold;
    color: #bb86fc;
  }
  .category {
    font-style: italic;
    color: #03dac6;
  }
  button {
    background-color: #bb86fc;
    color: #000;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  button:hover {
    background-color: #3700b3;
    color: #fff;
  }
</style>