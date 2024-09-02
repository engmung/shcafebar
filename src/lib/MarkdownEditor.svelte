<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
  
    export let value = '';
    export let placeholder = 'Write your content here...';
  
    let textarea;
    let preview;
  
    $: previewHtml = marked(value);
  
    function handleInput() {
      value = textarea.value;
    }
  
    onMount(() => {
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  </script>
  
  <div class="markdown-editor">
    <textarea
      bind:this={textarea}
      {value}
      on:input={handleInput}
      {placeholder}
    ></textarea>
    <div class="preview" bind:this={preview}>
      {@html previewHtml}
    </div>
  </div>
  
  <style>
    .markdown-editor {
      display: flex;
      gap: 1rem;
    }
    textarea, .preview {
      width: 50%;
      min-height: 300px;
      padding: 1rem;
      border: 1px solid var(--color-secondary);
      border-radius: 4px;
      background-color: var(--color-surface);
      color: var(--color-text);
    }
    textarea {
      resize: vertical;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .preview {
      overflow-y: auto;
    }
    .preview :global(p) {
      white-space: pre-wrap;
    }
    .preview :global(h1),
    .preview :global(h2),
    .preview :global(h3),
    .preview :global(h4),
    .preview :global(h5),
    .preview :global(h6) {
      color: var(--color-primary);
    }
    .preview :global(a) {
      color: var(--color-secondary);
    }
    .preview :global(code) {
      background-color: #333;
      color: var(--color-text);
    }
    .preview :global(pre) {
      background-color: #333;
      color: var(--color-text);
    }
    .preview :global(blockquote) {
      border-left: 4px solid var(--color-secondary);
      color: #bbb;
    }
    @media (max-width: 768px) {
    .markdown-editor {
      flex-direction: column;
    }

    textarea, .preview {
      width: 100%;
      min-height: 200px;
    }
  }
</style>