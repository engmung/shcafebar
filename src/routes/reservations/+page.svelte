<script>
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import MenuDetailPopup from '$lib/MenuDetailPopup.svelte';
  import { goto } from '$app/navigation';

  let availableDates = [];
  let selectedDate = null;
  let guests = 1;
  let menuRequest = '';
  let drinkRequest = '';
  let calendarEl;
  let showPopup = false;
  let userReservations = [];
  let selectedMenuItem = null;
  let calendar;

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
      calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: handleDateClick,
        events: availableDates.map(date => ({
          title: `${date.time}\n(${date.reserved_capacity || 0}/${date.capacity + date.reserved_capacity})`,
          start: date.date,
          allDay: true,
          extendedProps: { availableDate: date }
        })),
        eventClick: handleEventClick,
        headerToolbar: {
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        titleFormat: { month: 'numeric' },
        buttonText: {
          prev: '<',
          next: '>'
        },
        dayCellContent: function(args) {
          let cell = document.createElement('div');
          cell.classList.add('custom-day-cell');
          
          let dayNumber = document.createElement('span');
          dayNumber.classList.add('day-number');
          dayNumber.innerText = args.dayNumberText;
          cell.appendChild(dayNumber);
          
          return { domNodes: [cell] };
        }
      });
      calendar.render();
    }
  }

  function handleDateClick(arg) {
    console.log('Date click:', arg.dateStr);
    const clickedDate = availableDates.find(date => date.date === arg.dateStr);
    if (clickedDate) {
      selectedDate = clickedDate;
      showPopup = true;
    } else {
      alert("This date is not available for reservations.");
    }
  }

  function handleEventClick(arg) {
    console.log('Event click:', arg.event.startStr);
    selectedDate = arg.event.extendedProps.availableDate;
    showPopup = true;
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
      if (errorData.error === "Unauthorized") {
        if (confirm("You need to be logged in to make a reservation. Would you like to log in now?")) {
          goto('/login');
        }
      } else {
        alert('Failed to make reservation: ' + (errorData.error || 'Unknown error'));
      }
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
  try {
    const response = await fetch(`/api/menu/${menuId}`);
    if (response.ok) {
      selectedMenuItem = await response.json();
      
      // 이미지 정보 가져오기
      const imagesResponse = await fetch(`/api/menu/${menuId}/images`);
      if (imagesResponse.ok) {
        selectedMenuItem.images = await imagesResponse.json();
      } else {
        console.error(`Failed to fetch images for menu item ${menuId}`);
        selectedMenuItem.images = [];
      }
    } else {
      console.error('Failed to load menu item details');
    }
  } catch (error) {
    console.error('Error loading menu item details:', error);
  }
}

  function closeMenuPopup() {
    selectedMenuItem = null;
  }

  $: availableCapacity = selectedDate ? selectedDate.capacity : 0;
</script>

<h2>Your Reservations</h2>
{#if userReservations.length > 0}
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Guests</th>
          <th>Menu</th>
          <th>Drink</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each userReservations as reservation}
          <tr>
            <td>{reservation.date}</td>
            <td>{reservation.time}</td>
            <td>{reservation.guests}</td>
            <td>{reservation.menu_name}</td>
            <td>{reservation.drink_name}</td>
            <td>
              <span class="cancel-btn" on:click={() => cancelReservation(reservation.id)} role="button" tabindex="0">
                ×
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p>You have no reservations.</p>
{/if}

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
      <p>Available: {selectedDate.capacity - (selectedDate.reserved_capacity || 0)}/{selectedDate.capacity}</p>

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

<MenuDetailPopup item={selectedMenuItem} on:close={closeMenuPopup} />

<style>
  .calendar-container {
    height: 600px;
    margin-bottom: 2rem;
    background-color: rgba(18, 18, 18, 0.8);
    width: 100%;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 25px 25px 0px 0px;
  }

  /* FullCalendar 스타일 오버라이드 */
  :global(.fc) {
    background-color: #000;
    color: #fff;
  }

  :global(.fc-toolbar-title) {
    color: #bb86fc !important;
    font-size: 1.5rem !important;
  }

  :global(.fc-col-header-cell-cushion) {
    color: var(--color-primary);
  }

  :global(.fc-daygrid-day-number) {
    color: #fff;
  }

  :global(.fc-daygrid-day-events) {
    margin-bottom: 2px;
  }

  :global(.fc-day-today) {
    background-color: rgba(187, 134, 252, 0.1) !important;
  }

  :global(.fc-event) {
    background-color: var(--color-secondary);
    border-color: var(--color-secondary);
    white-space: pre-line;
    text-align: center;
    font-size: 0.7em;
  }

  :global(.fc-button-primary) {
    background-color: transparent !important;
    border-color: transparent !important;
    color: #ff0000 !important;
    font-size: 1.2rem !important;
    padding: 0.3em 0.5em !important;
    box-shadow: none !important;
  }

  :global(.fc-button-primary:hover),
  :global(.fc-button-primary:focus),
  :global(.fc-button-primary:not(:disabled):active),
  :global(.fc-button-primary:not(:disabled).fc-button-active) {
    background-color: rgba(255, 0, 0, 0.1) !important;
    border-color: transparent !important;
    color: #ff0000 !important;
    opacity: 0.8;
  }

  :global(.custom-day-cell) {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    height: 100%;
  }

  :global(.day-number) {
    font-size: 1em;
    font-weight: bold;
    padding: 2px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    background-color: #121212;
  }

  th, td {
    border: 1px solid #444;
    padding: 0.5rem;
    text-align: left;
  }

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
    background-color: #222;
    color: #e0e0e0;
    padding: 2rem;
    border-radius: 5px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .popup-content h2 {
    color: #bb86fc;
    margin-bottom: 1rem;
  }

  .popup-content p {
    margin-bottom: 0.5rem;
  }

  .popup-content button {
    background-color: #bb86fc;
    color: #000;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .popup-content button:hover {
    background-color: #9d61f9;
  }

  .popup-content input,
  .popup-content textarea {
    background-color: #333;
    color: #e0e0e0;
    border: 1px solid #555;
    padding: 0.5rem;
    border-radius: 4px;
    width: 100%;
  }

  .popup-content label {
    display: block;
    margin-bottom: 0.3rem;
    color: #bb86fc;
  }

  :global(.available-date) {
    background-color: var(--color-secondary);
    border-color: var(--color-secondary);
    color: #fff;
    cursor: pointer;
  }

  :global(.fc-event-title) {
    white-space: pre-wrap;
    overflow: visible;
    text-overflow: unset;
  }

  .cancel-btn {
    color: var(--color-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: bold;
    display: inline-block;
    line-height: 1;
    transition: transform 0.2s, opacity 0.2s;
  }

  .cancel-btn:hover {
    transform: scale(1.2);
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .cancel-btn {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 768px) {
    .calendar-container {
      height: 400px;
    }

    :global(.fc-toolbar-title) {
      font-size: 1.2rem !important;
    }

    :global(.fc-button-primary) {
      font-size: 1rem !important;
    }

    .popup-content {
      padding: 1rem;
    }

    table {
      font-size: 0.9rem;
    }

    th, td {
      padding: 0.3rem;
      font-size: 0.8rem;
    }

    .cancel-btn {
      font-size: 1.2rem;
    }
  }
  
</style>