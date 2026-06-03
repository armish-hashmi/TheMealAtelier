const API = 'http://localhost:3000/recipes';

let allRecipes = [];

/* ===========================
   FETCH ALL RECIPES — GET
=========================== */

async function loadAll() {
  setStatus('Loading...', '');
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    allRecipes = await res.json();
    renderTable(allRecipes);
    renderStats(allRecipes);
  } catch (err) {
    setStatus('Could not load recipes. Is JSON Server running on port 3000?', 'error');
    document.getElementById('adminTableBody').innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ccc;">No data available.</td></tr>';
  }
}

/* ===========================
   STATS
=========================== */

function renderStats(recipes) {
  const total     = recipes.length;
  const visible   = recipes.filter(r => !r.hidden).length;
  const hidden    = recipes.filter(r => r.hidden).length;
  const avgCal    = total ? Math.round(recipes.reduce((sum, r) => sum + r.calories, 0) / total) : 0;
  const avgRating = total ? (recipes.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '0.0';

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-visible').textContent  = visible;
  document.getElementById('stat-hidden').textContent   = hidden;
  document.getElementById('stat-avgcal').textContent   = avgCal + ' kcal';
  document.getElementById('stat-avgrating').textContent = '⭐ ' + avgRating;
}

/* ===========================
   RENDER TABLE
=========================== */

function renderTable(recipes) {
  const tbody = document.getElementById('adminTableBody');

  if (recipes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ccc;">No recipes found.</td></tr>';
    return;
  }

  tbody.innerHTML = recipes.map(r => `
    <tr>
      <td>${r.id}</td>
      <td><strong>${r.title}</strong></td>
      <td>${r.calories} kcal</td>
      <td>⭐ ${r.rating}</td>
      <td>
        <div class="category-tags">
          ${(r.category || []).map(c => `<span class="cat-tag">${c}</span>`).join('')}
        </div>
      </td>
      <td>
        <span class="visibility-pill ${r.hidden ? 'pill-hidden' : 'pill-visible'}">
          ${r.hidden ? 'Hidden' : 'Visible'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openEdit(${r.id})">Edit</button>
          <button class="btn-delete" onclick="deleteRecipe(${r.id}, '${r.title.replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ===========================
   OPEN EDIT FORM — GET by ID
=========================== */

async function openEdit(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`Could not fetch recipe ${id}`);
    const r = await res.json();

    document.getElementById('edit-id').value           = r.id;
    document.getElementById('edit-title').value        = r.title;
    document.getElementById('edit-description').value  = r.description;
    document.getElementById('edit-calories').value     = r.calories;
    document.getElementById('edit-rating').value       = r.rating;
    document.getElementById('edit-ingredients').value  = (r.ingredients || []).join(', ');
    document.getElementById('edit-instructions').value = r.instructions || '';
    document.getElementById('edit-hidden').checked     = r.hidden;

    const categorySelect = document.getElementById('edit-category');
    Array.from(categorySelect.options).forEach(opt => {
      opt.selected = (r.category || []).includes(opt.value);
    });

    document.getElementById('editSection').style.display = 'block';
    document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
    clearEditErrors();
  } catch (err) {
    setStatus('Could not load recipe for editing.', 'error');
  }
}

function closeEdit() {
  document.getElementById('editSection').style.display = 'none';
  document.getElementById('editForm').reset();
  clearEditErrors();
}

function clearEditErrors() {
  document.querySelectorAll('#editForm .error-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('#editForm .input-error').forEach(el => el.classList.remove('input-error'));
}

/* ===========================
   EDIT FORM VALIDATION
=========================== */

function validateEditForm() {
  let isValid = true;

  const fields = [
    { id: 'edit-title',    errId: 'edit-err-title',    msg: 'Title is required.' },
  ];

  fields.forEach(({ id, errId, msg }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!el.value.trim()) {
      errEl.textContent = msg;
      el.classList.add('input-error');
      isValid = false;
    } else {
      errEl.textContent = '';
      el.classList.remove('input-error');
    }
  });

  const calories = document.getElementById('edit-calories');
  const errCal = document.getElementById('edit-err-calories');
  if (!calories.value || Number(calories.value) < 1) {
    errCal.textContent = 'Enter a valid calorie count.';
    calories.classList.add('input-error');
    isValid = false;
  } else {
    errCal.textContent = '';
    calories.classList.remove('input-error');
  }

  const rating = document.getElementById('edit-rating');
  const errRating = document.getElementById('edit-err-rating');
  const ratingVal = parseFloat(rating.value);
  if (!rating.value || ratingVal < 1 || ratingVal > 5) {
    errRating.textContent = 'Rating must be between 1 and 5.';
    rating.classList.add('input-error');
    isValid = false;
  } else {
    errRating.textContent = '';
    rating.classList.remove('input-error');
  }

  return isValid;
}

/* ===========================
   SAVE EDIT — PUT
=========================== */

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateEditForm()) return;

  const id = document.getElementById('edit-id').value;

  const updated = {
    title:        document.getElementById('edit-title').value.trim(),
    description:  document.getElementById('edit-description').value.trim(),
    calories:     Number(document.getElementById('edit-calories').value),
    rating:       parseFloat(document.getElementById('edit-rating').value),
    category:     Array.from(document.getElementById('edit-category').selectedOptions).map(o => o.value),
    ingredients:  document.getElementById('edit-ingredients').value.split(',').map(s => s.trim()).filter(Boolean),
    instructions: document.getElementById('edit-instructions').value.trim(),
    hidden:       document.getElementById('edit-hidden').checked
  };

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    closeEdit();
    setStatus('Recipe updated successfully.', 'success');
    await loadAll();

    setTimeout(() => setStatus('', ''), 3000);
  } catch (err) {
    setStatus('Could not save changes. Make sure JSON Server is running.', 'error');
  }
});

/* ===========================
   DELETE — DELETE
=========================== */

async function deleteRecipe(id, title) {
  const confirmed = confirm(`Delete "${title}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    setStatus(`"${title}" deleted successfully.`, 'success');
    await loadAll();
    setTimeout(() => setStatus('', ''), 3000);
  } catch (err) {
    setStatus('Could not delete recipe. Make sure JSON Server is running.', 'error');
  }
}

/* ===========================
   STATUS MESSAGE
=========================== */

function setStatus(msg, type) {
  const el = document.getElementById('adminStatus');
  el.textContent = msg;
  el.className = 'status-msg' + (type ? ' ' + type : '');
}

/* ===========================
   INIT
=========================== */

document.addEventListener('DOMContentLoaded', loadAll);
