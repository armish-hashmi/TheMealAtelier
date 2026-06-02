// const API = 'http://localhost:3000/recipes';

async function loadRecipes() {
    showLoading(true);
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Server error');
        const recipes = await res.json();
        renderRecipes(recipes.filter(r => !r.hidden));
    } catch (err) {
        showError('Could not load recipes. Is JSON Server running?');
    } finally {
        showLoading(false);
    }
}

function showLoading(state) {
    document.getElementById('container').innerHTML = state
        ? '<p style="padding:2rem;color:#aaa;">Loading...</p>'
        : '';
}

function showError(msg) {
    document.getElementById('container').innerHTML =
        `<p style="padding:2rem;color:red;">${msg}</p>`;
}

document.addEventListener('DOMContentLoaded', loadRecipes);

document.getElementById('addRecipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newRecipe = {
        title:        document.getElementById('r-title').value.trim(),
        description:  document.getElementById('r-description').value.trim(),
        calories:     Number(document.getElementById('r-calories').value),
        rating:       Number(document.getElementById('r-rating').value),
        ingredients:  document.getElementById('r-ingredients').value.split(',').map(s => s.trim()),
        instructions: document.getElementById('r-instructions').value.trim(),
        category:     Array.from(document.getElementById('r-category').selectedOptions).map(o => o.value),
        hidden: false
    };

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecipe)
        });
        if (!res.ok) throw new Error('Failed to add recipe');
        document.getElementById('addRecipeForm').reset();
        loadRecipes(); // re-render list automatically
    } catch (err) {
        document.getElementById('err-form').textContent = 'Could not save. Try again.';
    }
});

function validateForm() {
    let valid = true;
    const checks = [
        { id: 'r-title',        errId: 'err-title',  msg: 'Title is required' },
        { id: 'r-description',  errId: 'err-desc',   msg: 'Description is required' },
        { id: 'r-calories',     errId: 'err-cal',    msg: 'Enter valid calories' },
        { id: 'r-rating',       errId: 'err-rating', msg: 'Rating must be 1-5' },
        { id: 'r-ingredients',  errId: 'err-ing',    msg: 'Add at least one ingredient' },
        { id: 'r-instructions', errId: 'err-inst',   msg: 'Instructions are required' },
    ];
    checks.forEach(({ id, errId, msg }) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(errId);
        if (!el.value.trim()) {
            errEl.textContent = msg;
            valid = false;
        } else {
            errEl.textContent = '';
        }
    });
    return valid;
}