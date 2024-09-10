<script>
  import { onMount } from 'svelte';
  import MenuDetailPopup from '$lib/MenuDetailPopup.svelte';

  let menuItems = [];
  let selectedItem = null;

  onMount(async () => {
    await loadMenuItems();
  });

  async function loadMenuItems() {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        menuItems = await response.json();
        console.log('Loaded menu items:', menuItems);
      } else {
        console.error('Failed to load menu items');
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  }

  function showDetails(item) {
    selectedItem = item;
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
        {#if item.primary_image_url}
          <img src={item.primary_image_url} alt={item.name} class="menu-image" />
        {:else}
          <div class="menu-image placeholder">No image available</div>
        {/if}
        <div class="menu-content">
          <div class="title-category">
            <h3 class="name">{item.name}</h3>
            <span class="category">{item.category}</span>
          </div>
          <p class="description">{item.description}</p>
          <p class="price">${item.price.toFixed(2)}</p>
        </div>
        <button class="view-details" on:click={() => showDetails(item)}>View Details</button>
      </div>
    {/each}
  </div>
{:else}
  <p>No menu items available.</p>
{/if}

<MenuDetailPopup item={selectedItem} on:close={closePopup} />

<style>
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  .menu-item {
    background-color: var(--color-surface);
    border: 1px solid var(--color-bg-overlay);
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .menu-image, .menu-image.placeholder {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 5px 5px 0 0;
    background-color: var(--color-bg-overlay);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text);
    font-style: italic;
  }
  .menu-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    position: relative;
    padding-top: 0;
  }
  .title-category {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .name {
    color: var(--color-primary);
    font-size: 1.5em;
    margin: 0;
  }
  .category {
    font-style: italic;
    font-size: 0.9em;
  }
  .description {
    font-size: 0.9em;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: var(--color-primary);
  }
  .price {

    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    margin: 0;
    font-size: 0.9em;
  }
  .view-details {
    color: var(--color-text);
    background-color: var(--color-primary);
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    font-size: 0.9em;
  }
  .view-details:hover {
    background-color: var(--color-secondary);
  }
</style>