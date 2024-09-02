<script>
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';

  let availableDates = [];
  let menuItems = [];
  let reservations = [];
  let newDate = { date: '', time: '', capacity: 1, menu_id: null, drink_id: null };
  let calendarEl;
  let editingDate = null;

  onMount(async () => {
    await loadAvailableDates();
    await loadMenuItems();
    await loadReservations();
    initializeCalendar();
  });

  function initializeCalendar() {
    if (calendarEl) {
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: handleDateClick,
        events: availableDates.map(date => ({
          title: `${date.time} (${date.reserved_capacity || 0}/${date.capacity + date.reserved_capacity})`,
          date: date.date
        }))
      });
      calendar.render();
    }
  }

  async function loadAvailableDates() {
    const response = await fetch('/api/admin/available-dates');
    if (response.ok) {
      availableDates = await response.json();
    } else {
      console.error('Failed to load available dates');
    }
  }

  async function loadMenuItems() {
    const response = await fetch('/api/menu');
    if (response.ok) {
      menuItems = await response.json();
    } else {
      console.error('Failed to load menu items');
    }
  }

  async function loadReservations() {
    const response = await fetch('/api/admin/reservations');
    if (response.ok) {
      reservations = await response.json();
    } else {
      console.error('Failed to load reservations');
    }
  }

  async function addAvailableDate() {
    const response = await fetch('/api/admin/available-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDate)
    });

    if (response.ok) {
      await loadAvailableDates();
      newDate = { date: '', time: '', capacity: 1, menu_id: null, drink_id: null };
      initializeCalendar();
    } else {
      const errorData = await response.json();
      alert('Failed to add available date: ' + (errorData.error || 'Unknown error'));
    }
  }

  async function deleteAvailableDate(id) {
    const response = await fetch(`/api/admin/available-dates/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadAvailableDates();
      await loadReservations();
      initializeCalendar();
    } else {
      alert('Failed to delete available date');
    }
  }

  async function deleteReservation(id) {
    if (confirm('Are you sure you want to delete this reservation?')) {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadReservations();
        await loadAvailableDates();
        initializeCalendar();
      } else {
        alert('Failed to delete reservation');
      }
    }
  }

  function handleDateClick(arg) {
    newDate.date = arg.dateStr;
  }

  function editAvailableDate(date) {
    editingDate = { ...date };
  }

  async function updateAvailableDate() {
    const response = await fetch(`/api/admin/available-dates/${editingDate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: editingDate.date,
        time: editingDate.time,
        capacity: parseInt(editingDate.capacity),
        menu_id: editingDate.menu_id,
        drink_id: editingDate.drink_id
      })
    });
    if (response.ok) {
      await loadAvailableDates();
      initializeCalendar();
      editingDate = null;
    } else {
      const errorData = await response.json();
      alert('Failed to update available date: ' + (errorData.error || 'Unknown error'));
    }
  }

  $: if (availableDates.length > 0 && calendarEl) {
    initializeCalendar();
  }
</script>

<h1>Manage Available Dates and Reservations</h1>

<div class="calendar-container" bind:this={calendarEl}></div>

<form on:submit|preventDefault={addAvailableDate}>
  <input type="date" bind:value={newDate.date} required>
  <input type="time" bind:value={newDate.time} required>
  <input type="number" bind:value={newDate.capacity} min="1" required>
  <select bind:value={newDate.menu_id}>
    <option value={null}>-- Select Menu --</option>
    {#each menuItems.filter(item => item.category === 'food') as item}
      <option value={item.id}>{item.name}</option>
    {/each}
  </select>
  <select bind:value={newDate.drink_id}>
    <option value={null}>-- Select Drink --</option>
    {#each menuItems.filter(item => item.category === 'drink') as item}
      <option value={item.id}>{item.name}</option>
    {/each}
  </select>
  <button type="submit">Add Date</button>
</form>

<h2>Available Dates</h2>
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Time</th>
      <th>Capacity</th>
      <th>Reserved</th>
      <th>Menu</th>
      <th>Drink</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each availableDates as date}
      <tr>
        <td>{date.date}</td>
        <td>{date.time}</td>
        <td>{date.capacity}</td>
        <td>{date.reserved_capacity || 0}</td>
        <td>{date.menu_name || 'Not set'}</td>
        <td>{date.drink_name || 'Not set'}</td>
        <td>
          <button on:click={() => editAvailableDate(date)}>Edit</button>
          <button on:click={() => deleteAvailableDate(date.id)}>Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<h2>Reservations</h2>
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Time</th>
      <th>User</th>
      <th>Guests</th>
      <th>Menu</th>
      <th>Drink</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each reservations as reservation}
      <tr>
        <td>{reservation.date}</td>
        <td>{reservation.time}</td>
        <td>{reservation.user_name}</td>
        <td>{reservation.guests}</td>
        <td>{reservation.menu_name}</td>
        <td>{reservation.drink_name}</td>
        <td>
          <button on:click={() => deleteReservation(reservation.id)}>Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#if editingDate}
  <div class="edit-form">
    <h3>Edit Available Date</h3>
    <label>
      Date:
      <input type="date" bind:value={editingDate.date}>
    </label>
    <label>
      Time:
      <input type="time" bind:value={editingDate.time}>
    </label>
    <label>
      Capacity:
      <input type="number" bind:value={editingDate.capacity} min="1">
    </label>
    <label>
      Menu:
      <select bind:value={editingDate.menu_id}>
        <option value="">-- Select Menu --</option>
        {#each menuItems.filter(item => item.category === 'food') as item}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
    </label>
    <label>
      Drink:
      <select bind:value={editingDate.drink_id}>
        <option value="">-- Select Drink --</option>
        {#each menuItems.filter(item => item.category === 'drink') as item}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
    </label>
    <button on:click={updateAvailableDate}>Save Changes</button>
    <button on:click={() => editingDate = null}>Cancel</button>
  </div>
{/if}

<style>
  .calendar-container {
    height: 600px;
    margin-bottom: 2rem;
  }
  form {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  .edit-form {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .edit-form label {
    display: block;
    margin-bottom: 0.5rem;
  }
  .edit-form input, .edit-form select {
    width: 100%;
    padding: 0.3rem;
  }
</style>