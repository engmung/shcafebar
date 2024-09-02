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
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <p class="price">${item.price.toFixed(2)}</p>
        <p class="category">{item.category}</p>
        <button on:click={() => showDetails(item)}>View Details</button>
      </div>
    {/each}
  </div>
{:else}
  <p>No menu items available.</p>
{/if}

<MenuDetailPopup item={selectedItem} onClose={closePopup} /><style>
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  .menu-item {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 5px;
  }
  .price {
    font-weight: bold;
    color: #4a4a4a;
  }
  .category {
    font-style: italic;
    color: #6a6a6a;
  }
</style>