


<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { marked } from 'marked';
  import MarkdownEditor from '$lib/MarkdownEditor.svelte';

  let menuItems = [];
  let ingredients = [];
  let newItemStore = writable({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    ingredients: [],
    detail_content: '',
    is_visible: true  // 새로운 필드 추가
  });
  let selectedItemStore = writable(null);
  let showPopup = false;
  let editMode = false;

  onMount(async () => {
    await loadMenuItems();
    await loadIngredients();
  });

  async function loadMenuItems() {
    const response = await fetch('/api/admin/menu');
    if (response.ok) {
      menuItems = await response.json();
    } else {
      console.error('Failed to load menu items');
    }
  }

  async function loadIngredients() {
    const response = await fetch('/api/admin/ingredients');
    if (response.ok) {
      ingredients = await response.json();
    } else {
      console.error('Failed to load ingredients');
    }
  }

  async function addMenuItem() {
    try {
      console.log("Adding new item:", $newItemStore);
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify($newItemStore)
      });

      if (response.ok) {
        await loadMenuItems();
        newItemStore.set({ 
          name: '', 
          description: '', 
          price: '', 
          category: '', 
          ingredients: [],
          detail_content: '',
          is_visible: true
        });
      } else {
        const errorData = await response.json();
        alert('Failed to add menu item: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('An error occurred while adding the menu item');
    }
  }

  async function updateMenuItem(item) {
    try {
      console.log("Updating item:", item);
      const response = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        await loadMenuItems();
        closePopup();
      } else {
        const errorData = await response.json();
        alert('Failed to update menu item: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('An error occurred while updating the menu item');
    }
  }

  async function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        const response = await fetch(`/api/admin/menu/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadMenuItems();
        } else {
          const errorData = await response.json();
          alert('Failed to delete menu item: ' + (errorData.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('An error occurred while deleting the menu item');
      }
    }
  }

  async function toggleVisibility(item) {
    const updatedItem = { ...item, is_visible: !item.is_visible };
    await updateMenuItem(updatedItem);
  }

  function addIngredientToItem(itemStore) {
    itemStore.update(item => ({
      ...item,
      ingredients: [...item.ingredients, { id: '', amount: 0, unit: '' }]
    }));
  }

  function removeIngredientFromItem(itemStore, index) {
    itemStore.update(item => ({
      ...item,
      ingredients: item.ingredients.filter((_, i) => i !== index)
    }));
  }

  function showDetails(item) {
    selectedItemStore.set({...item, detail_content: item.detail_content || ''});
    showPopup = true;
    editMode = false;
  }

  function closePopup() {
    showPopup = false;
    selectedItemStore.set(null);
    editMode = false;
  }

  function toggleEditMode() {
    editMode = !editMode;
  }

  function updateDetailContent(event) {
    $selectedItemStore.detail_content = event.detail.value;
  }

  function renderMarkdown(content) {
    return marked(content || '');
  }
</script>

<h1>Manage Menu</h1>

<form on:submit|preventDefault={addMenuItem}>
  <input bind:value={$newItemStore.name} placeholder="Name" required>
  <input bind:value={$newItemStore.description} placeholder="Description">
  <input type="number" bind:value={$newItemStore.price} placeholder="Price" step="0.01" required>
  <select bind:value={$newItemStore.category} required>
    <option value="">-- Select Category --</option>
    <option value="food">Food</option>
    <option value="drink">Drink</option>
  </select>
  
  <h3>Ingredients</h3>
  {#each $newItemStore.ingredients as ingredient, index (index)}
    <div>
      <select bind:value={ingredient.id} required>
        <option value="">-- Select Ingredient --</option>
        {#each ingredients as ing}
          <option value={ing.id}>{ing.name}</option>
        {/each}
      </select>
      <input type="number" bind:value={ingredient.amount} placeholder="Amount" step="0.01" required>
      <input bind:value={ingredient.unit} placeholder="Unit" required>
      <button type="button" on:click={() => removeIngredientFromItem(newItemStore, index)}>Remove</button>
    </div>
  {/each}
  <button type="button" on:click={() => addIngredientToItem(newItemStore)}>Add Ingredient</button>

  <h3>Detail Content (Markdown)</h3>
  <MarkdownEditor bind:value={$newItemStore.detail_content} />

  <label>
    <input type="checkbox" bind:checked={$newItemStore.is_visible}>
    Visible to users
  </label>

  <button type="submit">Add Item</button>
</form>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Price</th>
        <th>Category</th>
        <th>Visibility</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each menuItems as item (item.id)}
        <tr>
          <td data-label="Name">{item.name}</td>
          <td data-label="Description">{item.description}</td>
          <td data-label="Price">{item.price}</td>
          <td data-label="Category">{item.category}</td>
          <td data-label="Visibility">
            <button on:click={() => toggleVisibility(item)}>
              {item.is_visible ? 'Hide' : 'Show'}
            </button>
          </td>
          <td data-label="Actions">
            <button on:click={() => showDetails(item)}>View Details</button>
            <button on:click={() => deleteMenuItem(item.id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if showPopup && $selectedItemStore}
  <div class="popup">
    <div class="popup-content">
      {#if editMode}
        <h2>Edit Menu Item</h2>
        <input bind:value={$selectedItemStore.name} placeholder="Name">
        <input bind:value={$selectedItemStore.description} placeholder="Description">
        <input type="number" bind:value={$selectedItemStore.price} placeholder="Price" step="0.01">
        <select bind:value={$selectedItemStore.category}>
          <option value="food">Food</option>
          <option value="drink">Drink</option>
        </select>
        
        <h3>Ingredients</h3>
        {#each $selectedItemStore.ingredients as ingredient, index (index)}
          <div>
            <select bind:value={ingredient.id}>
              <option value="">-- Select Ingredient --</option>
              {#each ingredients as ing}
                <option value={ing.id}>{ing.name}</option>
              {/each}
            </select>
            <input type="number" bind:value={ingredient.amount} placeholder="Amount" step="0.01">
            <input bind:value={ingredient.unit} placeholder="Unit">
            <button on:click={() => removeIngredientFromItem(selectedItemStore, index)}>Remove</button>
          </div>
        {/each}
        <button on:click={() => addIngredientToItem(selectedItemStore)}>Add Ingredient</button>

        <h3>Detail Content (Markdown)</h3>
        <MarkdownEditor 
          bind:value={$selectedItemStore.detail_content} 
          on:input={updateDetailContent}
        />
        
        <label>
          <input type="checkbox" bind:checked={$selectedItemStore.is_visible}>
          Visible to users
        </label>

        <button on:click={() => updateMenuItem($selectedItemStore)}>Save Changes</button>
      {:else}
        <h2>{$selectedItemStore.name}</h2>
        <p>Price: ${$selectedItemStore.price}</p>
        <p>Category: {$selectedItemStore.category}</p>
        <p>Description: {$selectedItemStore.description}</p>
        <p>Visibility: {$selectedItemStore.is_visible ? 'Visible' : 'Hidden'}</p>
        <h3>Ingredients</h3>
        <ul>
          {#each $selectedItemStore.ingredients || [] as ingredient}
            <li>{ingredient.amount} {ingredient.unit} of {ingredient.name}</li>
          {/each}
        </ul>
        <h3>Detail Content Preview</h3>
        <div class="markdown-preview">
          {@html renderMarkdown($selectedItemStore.detail_content)}
        </div>
      {/if}
      <button on:click={toggleEditMode}>{editMode ? 'Cancel' : 'Edit'}</button>
      <button on:click={closePopup}>Close</button>
    </div>
  </div>
{/if}

<style>
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .popup-content {
    background-color: white;
    padding: 2rem;
    border-radius: 5px;
    max-width: 80%;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }
  .markdown-preview {
    border: 1px solid #333;
    padding: 1rem;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
    background-color: #2c2c2c;
  }

  .markdown-preview :global(h1),
  .markdown-preview :global(h2),
  .markdown-preview :global(h3),
  .markdown-preview :global(h4),
  .markdown-preview :global(h5),
  .markdown-preview :global(h6) {
    color: #bb86fc;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  .markdown-preview :global(p) {
    margin-bottom: 1em;
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    padding-left: 2em;
    margin-bottom: 1em;
  }

  .markdown-preview :global(code) {
    background-color: #3c3c3c;
    color: #e0e0e0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  .markdown-preview :global(pre) {
    background-color: #3c3c3c;
    color: #e0e0e0;
    padding: 1em;
    border-radius: 3px;
    overflow-x: auto;
  }

  .markdown-preview :global(blockquote) {
    border-left: 4px solid #bb86fc;
    padding-left: 1em;
    margin-left: 0;
    color: #a0a0a0;
  }

  @media (max-width: 768px) {
    .table-container {
      overflow-x: initial;
    }

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
      border: 1px solid #ddd;
    }

    td {
      border: none;
      position: relative;
      padding-left: 50%;
      text-align: right;
    }

    td:before {
      content: attr(data-label);
      position: absolute;
      left: 6px;
      width: 45%;
      padding-right: 10px;
      white-space: nowrap;
      text-align: left;
      font-weight: bold;
    }

    td:last-child {
      text-align: center;
      padding-left: 6px;
    }

    td:last-child:before {
      content: none;
    }
  }
</style>