<script>
  import { onMount } from 'svelte';

  let ingredients = [];
  let newIngredient = { name: '', cost: null, characteristics: '', volume: null, unit: '', min_volume: null };

  onMount(async () => {
    await loadIngredients();
  });

  async function loadIngredients() {
    const response = await fetch('/api/admin/ingredients');
    if (response.ok) {
      ingredients = await response.json();
    } else {
      console.error('Failed to load ingredients');
    }
  }

  async function addIngredient() {
    const response = await fetch('/api/admin/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIngredient)
    });

    if (response.ok) {
      await loadIngredients();
      newIngredient = { name: '', cost: null, characteristics: '', volume: null, unit: '', min_volume: null };
    } else {
      alert('Failed to add ingredient');
    }
  }

  async function updateIngredient(ingredient) {
    const response = await fetch(`/api/admin/ingredients/${ingredient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredient)
    });

    if (response.ok) {
      await loadIngredients();
    } else {
      alert('Failed to update ingredient');
    }
  }

  async function deleteIngredient(id) {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      const response = await fetch(`/api/admin/ingredients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadIngredients();
      } else {
        alert('Failed to delete ingredient');
      }
    }
  }
</script>

<h1>Manage Ingredients</h1>

<form on:submit|preventDefault={addIngredient}>
  <div class="form-group">
    <label for="name">Name</label>
    <input id="name" bind:value={newIngredient.name} placeholder="Name" required>
  </div>
  <div class="form-group">
    <label for="cost">Cost</label>
    <input id="cost" type="number" bind:value={newIngredient.cost} placeholder="Cost" step="0.01" required>
  </div>
  <div class="form-group">
    <label for="characteristics">Characteristics</label>
    <input id="characteristics" bind:value={newIngredient.characteristics} placeholder="Characteristics">
  </div>
  <div class="form-group">
    <label for="volume">Volume</label>
    <input id="volume" type="number" bind:value={newIngredient.volume} placeholder="Volume" step="0.01" required>
  </div>
  <div class="form-group">
    <label for="unit">Unit</label>
    <input id="unit" bind:value={newIngredient.unit} placeholder="Unit" required>
  </div>
  <div class="form-group">
    <label for="min_volume">Minimum Volume</label>
    <input id="min_volume" type="number" bind:value={newIngredient.min_volume} placeholder="Minimum Volume" step="0.01" required>
  </div>
  <button type="submit">Add Ingredient</button>
</form>

<h2>Ingredients</h2>
<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Cost</th>
        <th>Characteristics</th>
        <th>Volume</th>
        <th>Unit</th>
        <th>Minimum Volume</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each ingredients as ingredient (ingredient.id)}
        <tr>
          <td data-label="Name"><input bind:value={ingredient.name}></td>
          <td data-label="Cost"><input type="number" bind:value={ingredient.cost} step="0.01"></td>
          <td data-label="Characteristics"><input bind:value={ingredient.characteristics}></td>
          <td data-label="Volume"><input type="number" bind:value={ingredient.volume} step="0.01"></td>
          <td data-label="Unit"><input bind:value={ingredient.unit}></td>
          <td data-label="Minimum Volume"><input type="number" bind:value={ingredient.min_volume} step="0.01"></td>
          <td data-label="Actions">
            <button on:click={() => updateIngredient(ingredient)}>Update</button>
            <button on:click={() => deleteIngredient(ingredient.id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  :global(body) {
    background-color: #121212;
    color: #e0e0e0;
  }

  h1, h2 {
    color: #bb86fc;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 4px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    color: #03dac6;
  }

  input{
    background-color: #2c2c2c;
    border: 1px solid #333;
    color: #e0e0e0;
    padding: 0.5rem;
    border-radius: 4px;
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

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    background-color: #1e1e1e;
  }

  th, td {
    border: 1px solid #333;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: #2c2c2c;
    color: #03dac6;
  }

  td {
    color: #ffffff;
  }

  @media (max-width: 1024px) {
    table {
      font-size: 0.9rem;
    }

    th, td {
      padding: 0.3rem;
    }
  }

  @media (max-width: 768px) {
    table, thead, tbody, th, td, tr {
      display: block;
    }

    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    tr {
      margin-bottom: 1rem;
      border: 1px solid #333;
    }

    td {
      border: none;
      position: relative;
      padding-left: 50%;
      display: flex;
      align-items: center;
    }

    td:before {
      content: attr(data-label);
      position: absolute;
      left: 6px;
      width: 45%;
      padding-right: 10px;
      white-space: nowrap;
      font-weight: bold;
      color: #03dac6;
    }

    td input {
      width: 100%;
    }
  }
</style>