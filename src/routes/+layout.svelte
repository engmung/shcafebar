<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { invalidateAll } from '$app/navigation';
  import '../app.css';

  export let data;

  let isMenuOpen = false;

  async function handleLogout() {
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      await invalidateAll();
      goto('/');
      isMenuOpen = false;
    }
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  function goHome() {
    goto('/');
    closeMenu();
  }
</script>

<div class="app">
  <header>
    <div
      class="logo"
      on:click={goHome}
      on:keydown={(e) => e.key === 'Enter' && goHome()}
      role="button"
      tabindex="0"
    >
      SH's BAR & CAFE
    </div>
    <button class="menu-button" on:click={toggleMenu}>
      {#if isMenuOpen}
        Close
      {:else}
        Menu ☰
      {/if}
    </button>
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <p>&copy; 2024 SH's Bar & Cafe. All rights reserved.</p>
  </footer>

  {#if isMenuOpen}
    <nav transition:fly={{ y: -200, duration: 300 }}>
      <ul>
        <li><a href="/" on:click={closeMenu}>Home</a></li>
        <li><a href="/menu" on:click={closeMenu}>Menu</a></li>
        <li><a href="/reservations" on:click={closeMenu}>Reservations</a></li>
        {#if data.user}
          <li>
            <span class="user-info">Welcome, {data.user.name}!</span>
            <button on:click={handleLogout}>Logout</button>
          </li>
        {:else}
          <li><a href="/login" on:click={closeMenu}>Login</a></li>
        {/if}
        {#if data.user?.role === 'admin'}
          <li><a href="/admin" on:click={closeMenu}>Admin</a></li>
        {/if}
      </ul>
    </nav>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #000;
    color: #fff;
    position: relative;
    z-index: calc(var(--z-index-menu) + 1);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
  }

  .menu-button {
    background: none;
    border: none;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: calc(var(--z-index-menu) + 2);
  }

  main {
    flex: 1;
    padding: 2rem;
  }

  footer {
    background-color: #000;
    color: #fff;
    text-align: center;
    padding: 1rem;
  }

  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-menu);
  }

  nav ul {
    list-style-type: none;
    padding: 0;
    text-align: center;
  }

  nav li {
    margin: 1rem 0;
  }

  nav a, nav button {
    color: var(--color-secondary);
    text-decoration: none;
    font-size: 2rem;
    transition: color 0.3s ease;
  }

  nav a:hover, nav button:hover {
    color: var(--color-accent);
  }

  nav button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 2rem;
    padding: 0;
  }

  .user-info {
    color: #fff;
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    .logo {
      font-size: 1.2rem;
    }

    nav {
      padding: 1rem;
    }

    nav ul {
      width: 100%;
    }

    nav li {
      margin: 0.5rem 0;
      text-align: center;
    }

    nav a, nav button {
      font-size: 1.2rem;
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.5rem 0;
      font-weight: 1000;
    }

    .user-info {
      font-size: 1.2rem;
    }
  }
</style>