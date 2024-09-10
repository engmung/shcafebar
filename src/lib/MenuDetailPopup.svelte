<script>
  import { createEventDispatcher } from 'svelte';
  import { marked } from 'marked';

  export let item = null;
  
  const dispatch = createEventDispatcher();
  
  let currentImageIndex = 0;

  function renderMarkdown(content) {
    return marked(content || '');
  }

  function nextImage() {
    if (item.images && item.images.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % item.images.length;
    }
  }

  function prevImage() {
    if (item.images && item.images.length > 0) {
      currentImageIndex = (currentImageIndex - 1 + item.images.length) % item.images.length;
    }
  }

  function closePopup() {
    dispatch('close');
  }
</script>

{#if item}
  <div class="popup">
    <div class="popup-content">
      <h2>{item.name}</h2>
      
      {#if item.images && item.images.length > 0}
        <div class="image-carousel">
          <img src={item.images[currentImageIndex].image_url} alt={item.name} />
          {#if item.images.length > 1}
            <button on:click={prevImage} class="carousel-button prev">&lt;</button>
            <button on:click={nextImage} class="carousel-button next">&gt;</button>
          {/if}
        </div>
      {/if}

      <p>Description: {item.description}</p>
      <p>Category: {item.category}</p>
      
      <p>Price: ${item.price}</p>
      <h3>Ingredients</h3>
      <ul>
        {#each item.ingredients || [] as ingredient}
          <li>{ingredient.amount} {ingredient.unit} of {ingredient.name}</li>
        {/each}
      </ul>
      
      <h3>Detail Content</h3>
      <div class="markdown-preview">
        {@html renderMarkdown(item.detail_content)}
      </div>
      
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
    z-index: 1005;
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
  .image-carousel {
    position: relative;
    margin-bottom: 1rem;
  }
  .image-carousel img {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: cover;
  }
  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  .carousel-button.prev {
    left: 0;
  }
  .carousel-button.next {
    right: 0;
  }
  .markdown-preview {
    border: 1px solid var(--color-secondary);
    padding: 1rem;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
    background-color: var(--color-bg);
    margin-bottom: 1rem;
  }
    .markdown-preview :global(h1),
    .markdown-preview :global(h2),
    .markdown-preview :global(h3),
    .markdown-preview :global(h4),
    .markdown-preview :global(h5),
    .markdown-preview :global(h6) {
      color: var(--color-primary);
    }
    .markdown-preview :global(a) {
      color: var(--color-secondary);
    }
    .markdown-preview :global(code) {
      background-color: #333;
      color: var(--color-text);
    }
    .markdown-preview :global(pre) {
      background-color: #333;
      color: var(--color-text);
    }
    .markdown-preview :global(blockquote) {
      border-left: 4px solid var(--color-secondary);
      color: #bbb;
    }
    @media (max-width: 768px) {
    .popup-content {
      padding: 1rem;
      max-width: 95%;
    }

    .markdown-preview {
      max-height: 300px;
    }
  }
</style>