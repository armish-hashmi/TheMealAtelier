const GROCERY_API = 'http://localhost:3000/grocery';

/* ===========================
   FETCH ALL ITEMS — GET
=========================== */

async function loadGrocery() {
  try {
    const res = await fetch(GROCERY_API);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const items = await res.json();
    renderList(items);
  } catch (err) {
    document.getElementById('grocery-list').innerHTML =
      '<li class="grocery-empty">Could not load items. Is JSON Server running?</li>';
  }
}

/* ===========================
   RENDER LIST
=========================== */

function renderList(items) {
  const ul = document.getElementById('grocery-list');

  if (items.length === 0) {
    ul.innerHTML = '<li class="grocery-empty">Your list is empty. Add some items!</li>';
    return;
  }

  ul.innerHTML = items.map(item => `
    <li class="grocery-item">
      <input type="checkbox" id="item-${item.id}" ${item.done ? 'checked' : ''}
        onchange="toggleItem(${item.id}, this.checked)">
      <label for="item-${item.id}" class="${item.done ? 'done' : ''}">${item.text}</label>
      <button class="delete-item" onclick="deleteItem(${item.id})" aria-label="Delete item">×</button>
    </li>
  `).join('');
}

/* ===========================
   ADD ITEM — POST
=========================== */

async function addItem() {
  const input = document.getElementById('grocery-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(GROCERY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, done: false })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    input.value = '';
    await loadGrocery();
  } catch (err) {
    alert('Could not add item. Make sure JSON Server is running.');
  }
}

/* ===========================
   TOGGLE DONE — PATCH
=========================== */

async function toggleItem(id, done) {
  try {
    const res = await fetch(`${GROCERY_API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    await loadGrocery();
  } catch (err) {
    await loadGrocery();
  }
}

/* ===========================
   DELETE ITEM — DELETE
=========================== */

async function deleteItem(id) {
  try {
    const res = await fetch(`${GROCERY_API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    await loadGrocery();
  } catch (err) {
    alert('Could not delete item.');
  }
}

/* ===========================
   CLEAR CHECKED — DELETE all done
=========================== */

async function clearCheckedItems() {
  try {
    const res = await fetch(GROCERY_API);
    if (!res.ok) throw new Error();
    const items = await res.json();
    const doneItems = items.filter(i => i.done);

    await Promise.all(
      doneItems.map(item =>
        fetch(`${GROCERY_API}/${item.id}`, { method: 'DELETE' })
      )
    );

    await loadGrocery();
  } catch (err) {
    alert('Could not clear items.');
  }
}

/* ===========================
   INIT
=========================== */

document.addEventListener('DOMContentLoaded', () => {
  loadGrocery();

  document.getElementById('grocery-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addItem();
  });

  document.getElementById('clearChecked').addEventListener('click', clearCheckedItems);
});