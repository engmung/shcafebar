<script>
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<div class="admin-layout">
  <header>
    <h1>Admin Dashboard</h1>
    <button class="menu-toggle" on:click={toggleMenu} aria-expanded={isMenuOpen}>
      {isMenuOpen ? '✕' : '☰'}
    </button>
  </header>

  <div class="content-wrapper">
    <nav class:open={isMenuOpen}>
      <ul>
        <li><a href="/admin" class:active={$page.url.pathname === '/admin'}>Dashboard</a></li>
        <li><a href="/admin/reservations" class:active={$page.url.pathname === '/admin/reservations'}>Reservations</a></li>
        <li><a href="/admin/menu" class:active={$page.url.pathname === '/admin/menu'}>Menu</a></li>
        <li><a href="/admin/database" class:active={$page.url.pathname === '/admin/database'}>Database</a></li>
        <li><a href="/admin/ingredients" class:active={$page.url.pathname === '/admin/ingredients'}>Ingredients</a></li>
      </ul>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</div>

<style>
  .admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background-color: #333;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .content-wrapper {
    display: flex;
    flex: 1;
  }

  nav {
    width: 200px;
    background-color: #f0f0f0;
    padding: 1rem;
  }

  nav ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  nav li {
    margin-bottom: 0.5rem;
  }

  nav a {
    text-decoration: none;
    color: #333;
    padding: 0.5rem;
    display: block;
    border-radius: 4px;
  }

  nav a.active {
    background-color: #333;
    color: white;
  }

  main {
    flex: 1;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }

    .content-wrapper {
      flex-direction: column;
    }

    nav {
      width: 100%;
      display: none;
    }

    nav.open {
      display: block;
    }

    main {
      padding: 0.5rem;
    }
  }
</style>