const GROCERY_API = 'http://localhost:3000/groceryItems';

const CATEGORIES = ['Produce', 'Proteins', 'Pantry', 'Dairy'];

/* ===========================
   FETCH ALL ITEMS — GET
=========================== */

async function loadGrocery() {
  try {
    const res = await fetch(GROCERY_API);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const items = await res.json();
    renderAll(items);
  } catch (err) {
    CATEGORIES.forEach(cat => {
      const ul = document.getElementById(`list-${cat}`);
      if (ul) ul.innerHTML = '<li style="color:#aaa;font-size:12px;padding:8px 0;">Could not load items. Is JSON Server running?</li>';
    });
  }
}

/* ===========================
   RENDER ALL ITEMS
=========================== */

function renderAll(items) {
  CATEGORIES.forEach(cat => {
    const ul = document.getElementById(`list-${cat}`);
    if (!ul) return;
    const catItems = items.filter(i => i.category === cat);

    if (catItems.length === 0) {
      ul.innerHTML = '<li style="color:#ccc;font-size:12px;padding:8px 0;">No items yet.</li>';
      return;
    }

    ul.innerHTML = catItems.map(item => `
      <li class="grocery-item">
        <input type="checkbox" id="item-${item.id}" ${item.done ? 'checked' : ''}
          onchange="toggleItem(${item.id}, this.checked)">
        <label for="item-${item.id}" class="${item.done ? 'done' : ''}">${item.text}</label>
        <button class="delete-item" onclick="deleteItem(${item.id})" aria-label="Delete item">×</button>
      </li>
    `).join('');
  });
}

/* ===========================
   ADD ITEM — POST
=========================== */

async function addItem(category) {
  const input = document.getElementById(`input-${category}`);
  const text = input.value.trim();
  if (!text) return;

  const newItem = { text, category, done: false };

  try {
    const res = await fetch(GROCERY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
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
   CLEAR CHECKED ITEMS
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
   ENTER KEY SUPPORT
=========================== */

function setupEnterKey() {
  CATEGORIES.forEach(cat => {
    const input = document.getElementById(`input-${cat}`);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addItem(cat);
      });
    }
  });
}

/* ===========================
   INIT
=========================== */

document.addEventListener('DOMContentLoaded', () => {
  loadGrocery();
  setupEnterKey();
  document.getElementById('clearChecked').addEventListener('click', clearCheckedItems);
});
