<script>
  import { onMount } from 'svelte';

  let tables = [];
  let selectedTable = null;
  let tableData = [];

  onMount(async () => {
    const response = await fetch('/api/admin/database/tables');
    tables = await response.json();
  });

  async function loadTableData(tableName) {
    selectedTable = tableName;
    const response = await fetch(`/api/admin/database/tables/${tableName}`);
    tableData = await response.json();
  }

  async function updateRecord(record) {
    const response = await fetch(`/api/admin/database/tables/${selectedTable}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });

    const result = await response.json();

    if (response.ok) {
      if (result.changes > 0) {
        alert('Record updated successfully');
        await loadTableData(selectedTable);
      } else {
        alert('No changes were made');
      }
    } else {
      alert('Failed to update record: ' + (result.error || 'Unknown error'));
    }
  }

  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  function updateField(record, key, event) {
    const newValue = isNumber(record[key]) ? Number(event.target.value) : event.target.value;
    record[key] = newValue;
  }

  async function deleteRecord(record) {
    if (confirm('Are you sure you want to delete this record?')) {
      const response = await fetch(`/api/admin/database/tables/${selectedTable}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id })
      });

      if (response.ok) {
        alert('Record deleted successfully');
        await loadTableData(selectedTable);
      } else {
        const errorData = await response.json();
        alert('Failed to delete record: ' + (errorData.error || 'Unknown error'));
      }
    }
  }
</script>

<h1>Database Management</h1>

<div class="container">
  <div class="table-list">
    <h2>Tables</h2>
    <ul>
      {#each tables as table}
        <li>
          <button on:click={() => loadTableData(table)}>{table}</button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="table-data">
    {#if selectedTable}
      <h2>{selectedTable}</h2>
      {#if tableData.length > 0}
        <table>
          <thead>
            <tr>
              {#each Object.keys(tableData[0]) as column}
                <th>{column}</th>
              {/each}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each tableData as record}
              <tr>
                {#each Object.entries(record) as [key, value]}
                  <td>
                    {#if isNumber(value)}
                      <input 
                        type="number" 
                        value={value}
                        on:input={(event) => updateField(record, key, event)}
                      />
                    {:else}
                      <input 
                        type="text" 
                        value={value}
                        on:input={(event) => updateField(record, key, event)}
                      />
                    {/if}
                  </td>
                {/each}
                <td>
                  <button on:click={() => updateRecord(record)}>Update</button>
                  <button on:click={() => deleteRecord(record)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No data in this table.</p>
      {/if}
    {:else}
      <p>Select a table to view its data.</p>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background-color: #121212;
    color: #e0e0e0;
  }

  h1, h2 {
    color: #bb86fc;
  }

  .container {
    display: flex;
    gap: 2rem;
  }

  .table-list {
    flex: 1;
  }

  .table-data {
    flex: 3;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  button {
    background-color: #bb86fc;
    color: #000;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #3700b3;
    color: #fff;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: #1e1e1e;
  }

  th, td {
    border: 1px solid #333;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: #2c2c2c;
    color: #03dac6;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    background-color: #2c2c2c;
    border: 1px solid #333;
    color: #e0e0e0;
    padding: 0.3rem;
  }

  @media (max-width: 768px) {
    .container {
      flex-direction: column;
    }

    .table-list, .table-data {
      flex: auto;
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
      border: 1px solid #333;
    }

   
  }
</style>