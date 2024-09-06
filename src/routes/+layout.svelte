<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { invalidateAll } from '$app/navigation';
  import '../app.css';
  import Loading from '$lib/Loading.svelte';

  export let data;

  let isMenuOpen = false;
  let isLoading = true;

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

  function goToLogin() {
    goto('/login');
    closeMenu();
  }
</script>

<Loading bind:isLoading />

{#if !isLoading}
  <div class="app">
    <header>
      <div class="header-title">
        <h1 class="logo" on:click={goHome} on:keydown={(e) => e.key === 'Enter' && goHome()} role="button" tabindex="0">
          SH's BAR & CAFE
        </h1>
      </div>
    </header>
    
    <div class="header-nav">
      <div class="header-content">
        <div class="header-left">
          <button class="menu-button" on:click={toggleMenu}>
            {#if isMenuOpen}
              Close
            {:else}
              ☰ Menu
            {/if}
          </button>
        </div>
        <div class="header-right">
          {#if data.user}
            <span class="user-name">{data.user.name}</span>
            <button class="logout-button" on:click={handleLogout}>Logout</button>
          {:else}
            <button class="login-button" on:click={goToLogin}>Login</button>
          {/if}
        </div>
      </div>
    </div>

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
          {#if data.user?.role === 'admin'}
            <li><a href="/admin" on:click={closeMenu}>Admin</a></li>
          {/if}
        </ul>
      </nav>
    {/if}
  </div>
{/if}

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    padding: 1rem;
  }

  .header-nav {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    position: sticky;
    top: 0;
    z-index: calc(var(--z-index-menu) + 1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.1rem .2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
  }

  .logo {
    font-size: 2rem;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    margin: 0;
  }

  .menu-button, .login-button, .logout-button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    transition: opacity 0.3s ease;
  }

  .menu-button {
    color: #fff;
  }

  .login-button, .logout-button {
    font-weight: 1000;
    color: #ff0000;
    
    

  }

  .login-button:hover, .logout-button:hover {
    opacity: 0.8;
    
  }

  .user-name {
    color: #fff;
    font-size: 1rem;
    margin-right: 1rem;
  }

  main {
    flex: 1;
    padding: 2rem;
  }

  footer {
    background-color: rgba(0, 0, 0, 0.7);
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

  nav a {
    color: var(--color-secondary);
    text-decoration: none;
    font-size: 2rem;
    transition: color 0.3s ease;
  }

  nav a:hover {
    color: var(--color-accent);
  }

  @media (max-width: 768px) {
    .logo {
      font-size: 1.5rem;
    }

    .user-name {
      font-size: 0.9rem;
      margin-right: 0.5rem;
    }

    .login-button, .logout-button {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
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

    nav a {
      font-size: 1.2rem;
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.5rem 0;
      font-weight: 1000;
    }
  }
</style>