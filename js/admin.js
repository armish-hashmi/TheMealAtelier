const API = 'http://localhost:3000/recipes';

let allRecipes = [];

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


function renderTable(recipes) {
  const tbody = document.getElementById('adminTableBody');

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
          <button class="btn-edit"   data-id="${r.id}">Edit</button>
          <button class="btn-delete" data-id="${r.id}" data-title="${r.title.replace(/"/g, '&quot;')}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}


document.getElementById('adminTableBody').addEventListener('click', (e) => {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');

  if (editBtn)   openEdit(editBtn.getAttribute('data-id'));
  if (deleteBtn) deleteRecipe(
    deleteBtn.getAttribute('data-id'),
    deleteBtn.getAttribute('data-title')
  );
});




async function saveEdit(e) {
  e.preventDefault();
  if (!validateEditForm()) return;

  const id = document.getElementById('edit-id').value;

  try {
    
    const getRes = await fetch(`${API}/${id}`);
    if (!getRes.ok) throw new Error('Could not fetch recipe');
    const recipe = await getRes.json();


    
    recipe.title        = document.getElementById('edit-title').value.trim();
    recipe.description  = document.getElementById('edit-description').value.trim();
    recipe.calories     = Number(document.getElementById('edit-calories').value);
    recipe.rating       = parseFloat(document.getElementById('edit-rating').value);
    recipe.ingredients  = document.getElementById('edit-ingredients').value.split(',').map(s => s.trim()).filter(Boolean);
    recipe.instructions = document.getElementById('edit-instructions').value.trim();
    recipe.category     = Array.from(document.getElementById('edit-category').selectedOptions).map(o => o.value);
    recipe.hidden       = document.getElementById('edit-hidden').checked;   = r.hidden;

   
    const putRes = await fetch(`${API}/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(recipe)
    });
    if (!putRes.ok) throw new Error('PUT failed');

   
    closeEdit();
    setStatus('Recipe updated successfully.', 'success');
    await loadAll();
    setTimeout(() => setStatus('', ''), 3000);

  } catch (err) {
    setStatus('Could not save changes. Check the console.', 'error');
    console.error(err);
  }
}


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


document.getElementById('editForm').addEventListener('submit', saveEdit); {
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


async function deleteRecipe(id, title) {
  // Step 1 — confirm dialog, exit if cancelled
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

  try {
    // Step 2 — send DELETE, no headers, no body
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('DELETE failed');

    // Step 3 — reload the list
    await loadAll();
    setStatus(`"${title}" deleted successfully.`, 'success');
    setTimeout(() => setStatus('', ''), 3000);

  } catch (err) {
    setStatus('Could not delete. Check the console.', 'error');
    console.error(err);
  }
}



function setStatus(msg, type) {
  const el = document.getElementById('adminStatus');
  el.textContent = msg;
  el.className = 'status-msg' + (type ? ' ' + type : '');
}


document.addEventListener('DOMContentLoaded', loadAll);
