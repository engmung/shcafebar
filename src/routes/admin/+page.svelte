<script>
  import { onMount } from 'svelte';

  let stats = {
    totalReservations: 0,
    pendingReservations: 0,
    totalMenuItems: 0,
    totalUsers: 0
  };
  let lowStockIngredients = [];

  onMount(async () => {
    await loadStats();
    await loadLowStockIngredients();
  });

  async function loadStats() {
    const response = await fetch('/api/admin/stats');
    if (response.ok) {
      stats = await response.json();
    } else {
      console.error('Failed to load stats');
    }
  }

  async function loadLowStockIngredients() {
    const response = await fetch('/api/admin/ingredients/low-stock');
    if (response.ok) {
      lowStockIngredients = await response.json();
    } else {
      console.error('Failed to load low stock ingredients');
    }
  }

  async function cleanupImages() {
    if (confirm('Are you sure you want to clean up unused images?')) {
      try {
        const response = await fetch('/api/admin/cleanup-images', { method: 'POST' });
        if (response.ok) {
          const result = await response.json();
          alert(`Cleanup completed. Removed ${result.removedCount} unused images.`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error cleaning up images:', error);
        alert('An error occurred while cleaning up images: ' + error.message);
      }
    }
  }
</script>

<h1>Admin Dashboard</h1>

<div class="stats-grid">
  <div class="stat-item">
    <h3>Total Reservations</h3>
    <p>{stats.totalReservations}</p>
  </div>
  <div class="stat-item">
    <h3>Pending Reservations</h3>
    <p>{stats.pendingReservations}</p>
  </div>
  <div class="stat-item">
    <h3>Total Menu Items</h3>
    <p>{stats.totalMenuItems}</p>
  </div>
  <div class="stat-item">
    <h3>Total Users</h3>
    <p>{stats.totalUsers}</p>
  </div>
</div>

<h2>Maintenance</h2>
<button on:click={cleanupImages}>Clean Up Unused Images</button>

<h2>Low Stock Ingredients</h2>
{#if lowStockIngredients.length > 0}
  <ul class="ingredient-list">
    {#each lowStockIngredients as ingredient}
      <li>
        <span class="ingredient-name">{ingredient.name}</span>
        <span class="ingredient-stock">Current: {ingredient.volume} {ingredient.unit}</span>
        <span class="ingredient-min">Minimum: {ingredient.min_volume} {ingredient.unit}</span>
      </li>
    {/each}
  </ul>
{:else}
  <p>All ingredients are well-stocked.</p>
{/if}

<style>
  :global(body) {
    background-color: #121212;
    color: #e0e0e0;
  }

  h1, h2 {
    color: #bb86fc;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-item {
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    border: 1px solid #333;
  }

  .stat-item h3 {
    margin-top: 0;
    color: #03dac6;
  }

  .ingredient-list {
    list-style-type: none;
    padding: 0;
  }

  .ingredient-list li {
    background-color: #1e1e1e;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #333;
  }

  .ingredient-name {
    font-weight: bold;
    color: #03dac6;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .ingredient-list li {
      flex-direction: column;
      align-items: flex-start;
    }

    .ingredient-name, .ingredient-stock, .ingredient-min {
      width: 100%;
      margin-bottom: 0.25rem;
    }
  }
</style>