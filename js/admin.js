const API = 'http://localhost:3000/recipes';

async function loadAll() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error();
        const recipes = await res.json();
        renderTable(recipes);
        renderStats(recipes);
    } catch {
        document.getElementById('adminError').style.display = 'block';
    }
}

function renderStats(recipes) {
    const total    = recipes.length;
    const hidden   = recipes.filter(r => r.hidden).length;
    const avgCal   = total ? Math.round(recipes.reduce((s,r) => s + r.calories, 0) / total) : 0;
    const avgRating= total ? (recipes.reduce((s,r) => s + r.rating, 0) / total).toFixed(1) : 0;

    document.getElementById('statsRow').innerHTML = `
        <div class="stat-card"><p class="stat-label">Total Recipes</p><p class="stat-value">${total}</p></div>
        <div class="stat-card"><p class="stat-label">Hidden Recipes</p><p class="stat-value">${hidden}</p></div>
        <div class="stat-card"><p class="stat-label">Avg Calories</p><p class="stat-value">${avgCal} kcal</p></div>
        <div class="stat-card"><p class="stat-label">Avg Rating</p><p class="stat-value">⭐ ${avgRating}</p></div>
    `;
}

function renderTable(recipes) {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = recipes.map(r => `
        <tr>
            <td>${r.title}</td>
            <td>${r.calories} kcal</td>
            <td>⭐ ${r.rating}</td>
            <td>${r.hidden ? '🔴 Hidden' : '🟢 Visible'}</td>
            <td>
                <button onclick="openEdit(${r.id})">Edit</button>
                <button class="delete-btn" onclick="deleteRecipe(${r.id}, '${r.title}')">Delete</button>
            </td>
        </tr>`).join('');
}

async function openEdit(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error();
        const r = await res.json();
        document.getElementById('edit-id').value          = r.id;
        document.getElementById('edit-title').value       = r.title;
        document.getElementById('edit-description').value = r.description;
        document.getElementById('edit-calories').value    = r.calories;
        document.getElementById('edit-rating').value      = r.rating;
        document.getElementById('edit-ingredients').value = r.ingredients.join(', ');
        document.getElementById('edit-instructions').value= r.instructions;
        document.getElementById('edit-hidden').checked    = r.hidden;
        document.getElementById('editSection').style.display = 'block';
    } catch {
        alert('Could not load recipe for editing.');
    }
}

function closeEdit() {
    document.getElementById('editSection').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const updated = {
        title:        document.getElementById('edit-title').value.trim(),
        description:  document.getElementById('edit-description').value.trim(),
        calories:     Number(document.getElementById('edit-calories').value),
        rating:       Number(document.getElementById('edit-rating').value),
        ingredients:  document.getElementById('edit-ingredients').value.split(',').map(s => s.trim()),
        instructions: document.getElementById('edit-instructions').value.trim(),
        hidden:       document.getElementById('edit-hidden').checked
    };
    try {
        const res = await fetch(`${API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (!res.ok) throw new Error();
        closeEdit();
        loadAll();
    } catch {
        alert('Could not save changes.');
    }
});

async function deleteRecipe(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        loadAll();
    } catch {
        alert('Could not delete recipe.');
    }
}

document.addEventListener('DOMContentLoaded', loadAll);