<script>
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import MenuDetailPopup from '$lib/MenuDetailPopup.svelte';

  let availableDates = [];
  let selectedDate = null;
  let guests = 1;
  let menuRequest = '';
  let drinkRequest = '';
  let calendarEl;
  let showPopup = false;
  let userReservations = [];
  let selectedMenuItem = null;

  onMount(async () => {
    await loadAvailableDates();
    await loadUserReservations();
    initializeCalendar();
  });

  async function loadAvailableDates() {
    const response = await fetch('/api/available-dates');
    if (response.ok) {
      availableDates = await response.json();
    } else {
      console.error('Failed to load available dates');
    }
  }

  async function loadUserReservations() {
    const response = await fetch('/api/reservations/user');
    if (response.ok) {
      userReservations = await response.json();
    } else {
      console.error('Failed to load user reservations');
    }
  }

  function initializeCalendar() {
    if (calendarEl) {
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: handleDateClick,
        events: availableDates.map(date => ({
          title: `${date.time} (${date.reserved_capacity}/${date.capacity + date.reserved_capacity})`,
          date: date.date,
          extendedProps: { ...date }
        }))
      });
      calendar.render();
    }
  }

  function handleDateClick(arg) {
    const clickedDate = availableDates.find(date => date.date === arg.dateStr);
    if (clickedDate) {
      selectedDate = clickedDate;
      showPopup = true;
    }
  }

  function closePopup() {
    showPopup = false;
  }

  async function makeReservation() {
  if (!selectedDate) {
    alert('Please select a date and time');
    return;
  }

  if (guests > selectedDate.capacity) {
    alert('Not enough capacity for this reservation');
    return;
  }

  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: selectedDate.date,
      time: selectedDate.time,
      guests,
      menuRequest,
      drinkRequest
    })
  });

  if (response.ok) {
    alert('Reservation made successfully!');
    selectedDate = null;
    guests = 1;
    menuRequest = '';
    drinkRequest = '';
    showPopup = false;
    await loadAvailableDates();
    await loadUserReservations();
    initializeCalendar();
  } else {
    const errorData = await response.json();
    alert('Failed to make reservation: ' + (errorData.error || 'Unknown error'));
  }
}

  async function cancelReservation(id) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadUserReservations();
        await loadAvailableDates();
        initializeCalendar();
      } else {
        alert('Failed to cancel reservation');
      }
    }
  }

  async function showMenuDetails(menuId) {
    const response = await fetch(`/api/menu/${menuId}`);
    if (response.ok) {
      selectedMenuItem = await response.json();
    } else {
      console.error('Failed to load menu item details');
    }
  }

  function closeMenuPopup() {
    selectedMenuItem = null;
  }

  $: availableCapacity = selectedDate ? selectedDate.capacity : 0;
</script>

<h1>Make a Reservation</h1>

<div class="calendar-container" bind:this={calendarEl}></div>

{#if showPopup && selectedDate}
  <div class="popup" on:click={closePopup}>
    <div class="popup-content" on:click|stopPropagation>
      <h2>Make a Reservation for {selectedDate.date} at {selectedDate.time}</h2>
      <p>Menu: {selectedDate.menu_name} (${selectedDate.menu_price}) 
        <button on:click={() => showMenuDetails(selectedDate.menu_id)}>View Menu Details</button>
      </p>
      <p>Drink: {selectedDate.drink_name} (${selectedDate.drink_price})
        <button on:click={() => showMenuDetails(selectedDate.drink_id)}>View Drink Details</button>
      </p>
      <p>Available: {selectedDate.reserved_capacity}/{selectedDate.capacity + selectedDate.reserved_capacity}</p>

      <form on:submit|preventDefault={makeReservation}>
        <label for="guests">Number of guests:</label>
        <input id="guests" type="number" bind:value={guests} min="1" max={availableCapacity} required>

        <label for="menuRequest">Special menu requests:</label>
        <textarea id="menuRequest" bind:value={menuRequest}></textarea>

        <label for="drinkRequest">Special drink requests:</label>
        <textarea id="drinkRequest" bind:value={drinkRequest}></textarea>

        <button type="submit">Make Reservation</button>
        <button type="button" on:click={closePopup}>Cancel</button>
      </form>
    </div>
  </div>
{/if}

<h2>Your Reservations</h2>
{#if userReservations.length > 0}
  <table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Time</th>
      <th>Guests</th>
      <th>Menu</th>
      <th>Drink</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each userReservations as reservation}
      <tr>
        <td data-label="Date">{reservation.date}</td>
        <td data-label="Time">{reservation.time}</td>
        <td data-label="Guests">{reservation.guests}</td>
        <td data-label="Menu">{reservation.menu_name}</td>
        <td data-label="Drink">{reservation.drink_name}</td>
        <td data-label="Actions">
          <button on:click={() => cancelReservation(reservation.id)}>Cancel</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
{:else}
  <p>You have no reservations.</p>
{/if}

<MenuDetailPopup item={selectedMenuItem} onClose={closeMenuPopup} />

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

  @media (max-width: 768px) {
    .calendar-container {
      height: 400px;
    }
    
    form {
      flex-direction: column;
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
    }
    
    td:before {
      content: attr(data-label);
      position: absolute;
      left: 6px;
      width: 45%;
      padding-right: 10px;
      white-space: nowrap;
      font-weight: bold;
    }
  }
</style>