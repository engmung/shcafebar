<script>
    import { marked } from 'marked';
    export let item = null;
    export let onClose = () => {};
  
    function renderMarkdown(content) {
      marked.setOptions({
        baseUrl: '/', // 기본 URL 설정
        breaks: true, // 줄바꿈 허용
      });
      return marked(content || '');
    }
  </script>
  
  {#if item}
    <div class="popup">
      <div class="popup-content">
        <h2>{item.name}</h2>
        <p>Price: ${item.price}</p>
        <p>Category: {item.category}</p>
        <p>Description: {item.description}</p>
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
        <button on:click={onClose}>Close</button>
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
      z-index: var(--z-index-menu);
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