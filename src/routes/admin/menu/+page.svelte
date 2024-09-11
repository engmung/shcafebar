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
    is_visible: true,
    images: []
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
      for (let item of menuItems) {
        const imagesResponse = await fetch(`/api/admin/menu/${item.id}/images`);
        if (imagesResponse.ok) {
          item.images = await imagesResponse.json();
        }
      }
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
    const menuItemData = {
      name: $newItemStore.name,
      description: $newItemStore.description,
      price: parseFloat($newItemStore.price),
      category: $newItemStore.category,
      ingredients: $newItemStore.ingredients.map(ing => ({
        ...ing,
        amount: parseFloat(ing.amount)
      })),
      detail_content: $newItemStore.detail_content,
      is_visible: $newItemStore.is_visible
    };

    console.log('Sending data:', JSON.stringify(menuItemData));

    const response = await fetch('/api/admin/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuItemData)
    });

    if (response.ok) {
      const result = await response.json();
      // 이미지 업로드 처리
      for (let image of $newItemStore.images) {
        await uploadImage(result.id, image);
      }
      await loadMenuItems();
      newItemStore.set({ 
        name: '', 
        description: '', 
        price: '', 
        category: '', 
        ingredients: [],
        detail_content: '',
        is_visible: true,
        images: []
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

async function uploadImage(menuId, file) {
  // 이미지 압축
  const compressedFile = await compressImage(file);
  
  const formData = new FormData();
  formData.append('menuId', menuId);
  formData.append('image', compressedFile, file.name);
  formData.append('isPrimary', file === $newItemStore.images[0]);

  try {
    const response = await fetch('/api/admin/menu/images', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error');
    }

    const result = await response.json();
    console.log('Image uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to upload image:', error);
    alert('Failed to upload image: ' + error.message);
    throw error;
  }
}

async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 1024;
        const maxHeight = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

  async function handleImageUpload(event) {
    const files = event.target.files;
    newItemStore.update(item => ({
      ...item,
      images: [...item.images, ...files]
    }));
  }

  function removeImage(index) {
    newItemStore.update(item => ({
      ...item,
      images: item.images.filter((_, i) => i !== index)
    }));
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

  async function updateMenuItem(item) {
  try {
    const formData = new FormData();
    for (let [key, value] of Object.entries(item)) {
      if (key !== 'images' && key !== 'ingredients') {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    }
    formData.append('ingredients', JSON.stringify(item.ingredients));
    
    // 이미지 처리
    if (item.images && item.images.length > 0) {
      const existingImages = [];
      const newImages = [];

      item.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`new_image_${index}`, image);
          newImages.push(index);
        } else if (typeof image === 'string' || (image && image.image_url)) {
          existingImages.push(typeof image === 'string' ? image : image.image_url);
        }
      });

      formData.append('existing_images', JSON.stringify(existingImages));
      formData.append('new_images', JSON.stringify(newImages));
    }
    
    const response = await fetch(`/api/admin/menu/${item.id}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      await loadMenuItems();
      closePopup();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    alert('An error occurred while updating the menu item: ' + error.message);
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

  function showDetails(item) {
    selectedItemStore.set({...item, images: [...item.images]});
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

  <h3>Images</h3>
  <input type="file" on:change={handleImageUpload} multiple accept="image/*">
  {#each $newItemStore.images as image, index (index)}
    <div>
      <img src={URL.createObjectURL(image)} alt="Menu item preview" style="max-width: 200px;">
      <button type="button" on:click={() => removeImage(index)}>Remove</button>
    </div>
  {/each}

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
            <button on:click={() => updateMenuItem({...item, is_visible: !item.is_visible})}>
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
        />
        
        <h3>Images</h3>
        <input type="file" on:change={event => {
          const files = event.target.files;
          selectedItemStore.update(item => ({
            ...item,
            images: [...item.images, ...files]
          }));
        }} multiple accept="image/*">
        {#each $selectedItemStore.images as image, index (index)}
          <div>
            {#if typeof image === 'string'}
              <img src={image} alt="Menu item" style="max-width: 200px;">
            {:else if image instanceof File}
              <img src={URL.createObjectURL(image)} alt="Menu item preview" style="max-width: 200px;">
            {:else}
              <img src={image.image_url} alt="Menu item" style="max-width: 200px;">
            {/if}
            <button type="button" on:click={() => {
              selectedItemStore.update(item => ({
                ...item,
                images: item.images.filter((_, i) => i !== index)
              }));
            }}>Remove</button>
          </div>
        {/each}

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
        <h3>Images</h3>
        {#each $selectedItemStore.images as image}
          <img src={image.image_url} alt="Menu item" style="max-width: 200px;">
        {/each}
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
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .popup-content {
    background-color: var(--color-surface);
    color: var(--color-text);
    padding: 2rem;
    border-radius: 5px;
    max-width: 80%;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
  }
  .markdown-preview {
    border: 1px solid var(--color-secondary);
    padding: 1rem;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
    background-color: var(--color-bg);
  }
  .markdown-preview :global(h1),
  .markdown-preview :global(h2),
  .markdown-preview :global(h3),
  .markdown-preview :global(h4),
  .markdown-preview :global(h5),
  .markdown-preview :global(h6) {
    color: var(--color-primary);
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
    background-color: #333;
    color: var(--color-text);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  .markdown-preview :global(pre) {
    background-color: #333;
    color: var(--color-text);
    padding: 1em;
    border-radius: 3px;
    overflow-x: auto;
  }
  .markdown-preview :global(blockquote) {
    border-left: 4px solid var(--color-secondary);
    padding-left: 1em;
    margin-left: 0;
    color: #a0a0a0;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  input, select, textarea {
    padding: 0.5rem;
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
    background-color: var(--color-surface);
    color: var(--color-text);
  }
  button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: var(--color-bg);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: var(--color-secondary);
  }
  .table-container {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    border: 1px solid var(--color-secondary);
    padding: 0.5rem;
    text-align: left;
  }
  th {
    background-color: var(--color-surface);
  }
  @media (max-width: 768px) {
    .popup-content {
      max-width: 95%;
      padding: 1rem;
    }
    .table-container {
      overflow-x: auto;
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
      border: 1px solid var(--color-secondary);
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
  }
</style>