<script>
  import { goto } from '$app/navigation';
  import { invalidateAll } from '$app/navigation';

  let name = '';
  let error = '';

  async function handleSubmit() {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      await invalidateAll();
      goto('/');
    } else {
      const data = await response.json();
      error = data.message;
    }
  }
</script>

<h1>Login</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label for="name">Name:</label>
  <input id="name" bind:value={name} required>
  <button type="submit">Login</button>
</form>

{#if error}
  <p class="error">{error}</p>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
  }
  .error {
    color: red;
  }
</style>