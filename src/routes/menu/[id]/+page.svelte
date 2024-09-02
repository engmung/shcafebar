<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { marked } from 'marked';

  let menuItem = null;

  onMount(async () => {
    const id = $page.params.id;
    const response = await fetch(`/api/menu/${id}`);
    if (response.ok) {
      menuItem = await response.json();
    } else {
      console.error('Failed to load menu item');
    }
  });
</script>

{#if menuItem}
  <div class="menu-item-detail">
    <h1>{menuItem.name}</h1>
    <p class="price">Price: ${menuItem.price}</p>
    <p class="category">Category: {menuItem.category}</p>
    <p class="description">Description: {menuItem.description}</p>

    <h2>Details</h2>
    <div class="detail-content">
      {@html marked(menuItem.detail_content || '')}
    </div>

    <h2>Ingredients</h2>
    <ul class="ingredients-list">
      {#each menuItem.ingredients as ingredient}
        <li>{ingredient.amount} {ingredient.unit} of {ingredient.name}</li>
      {/each}
    </ul>
  </div>
{:else}
  <p>Loading...</p>
{/if}

<style>
  .menu-item-detail {
    color: var(--color-text);
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1, h2 {
    color: var(--color-primary);
  }

  .price, .category, .description {
    margin-bottom: 1rem;
  }

  .detail-content {
    background-color: var(--color-surface);
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 2rem;
  }

  .detail-content :global(img) {
    max-width: 100%;
    height: auto;
  }

  .detail-content :global(p) {
    margin-bottom: 1rem;
  }

  .detail-content :global(h1),
  .detail-content :global(h2),
  .detail-content :global(h3),
  .detail-content :global(h4),
  .detail-content :global(h5),
  .detail-content :global(h6) {
    color: var(--color-primary);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .detail-content :global(a) {
    color: var(--color-secondary);
  }

  .detail-content :global(code) {
    background-color: #333;
    color: var(--color-text);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  .detail-content :global(pre) {
    background-color: #333;
    color: var(--color-text);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }

  .detail-content :global(blockquote) {
    border-left: 4px solid var(--color-secondary);
    color: #bbb;
    padding-left: 1rem;
    margin-left: 0;
  }

  .ingredients-list {
    list-style-type: none;
    padding: 0;
  }

  .ingredients-list li {
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .menu-item-detail {
      padding: 1rem;
    }

    .detail-content {
      padding: 0.5rem;
    }
  }
</style>