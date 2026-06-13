const API = 'http://localhost:3000/recipes';

let allRecipes = [];
let activeFilter = 'All';
let searchQuery = '';



async function loadRecipes() {
  showLoading();
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    allRecipes = await res.json();
    applyFilterAndRender();
  } catch (err) {
    showError('Could not load recipes. Make sure JSON Server is running on port 3000.');
  }
}

function applyFilterAndRender() {
  let filtered = allRecipes.filter(r => !r.hidden);

  if (activeFilter !== 'All') {
    filtered = filtered.filter(r => r.category && r.category.includes(activeFilter));
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }

  renderRecipes(filtered);
}

function renderRecipes(recipes) {
  const container = document.getElementById('container');

  if (recipes.length === 0) {
    container.innerHTML = '<p class="empty-state">No recipes found. Try a different filter.</p>';
    return;
  }

  container.innerHTML = '';

  recipes.forEach(recipe => {
    const box = document.createElement('div');
    box.classList.add('box');
    box.dataset.category = (recipe.category || []).join(' ');

    box.innerHTML = `
      <img src="${recipe.image || 'images/placeholder.jpg'}" alt="${recipe.title}" loading="lazy">
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
      </div>
      <div class="recipe-stats">
        <span class="rating">&#11088; ${recipe.rating}</span>
        <span class="calories">&#128293; ${recipe.calories} kcal</span>
      </div>
    `;

    box.addEventListener('click', () => openRecipeModal(recipe));
    container.appendChild(box);
  });
}



function showLoading() {
  document.getElementById('container').innerHTML =
    '<p class="loading-state">Loading recipes...</p>';
}

function showError(msg) {
  document.getElementById('container').innerHTML =
    `<p class="error-state">&#9888; ${msg}</p>`;
}



function openRecipeModal(recipe) {
  document.getElementById('modalTitle').textContent = recipe.title;
  document.getElementById('modalInstructions').textContent = recipe.instructions || 'No instructions provided.';

  const ingredientsList = document.getElementById('ingredientsList');
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    ingredientsList.innerHTML =
      '<h4>Ingredients</h4><ul>' +
      recipe.ingredients.map(ing => `<li>${ing}</li>`).join('') +
      '</ul>';
  } else {
    ingredientsList.innerHTML = '';
  }

  document.getElementById('recipeModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}



function setupFilters() {
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active-filter'));
      tag.classList.add('active-filter');
      activeFilter = tag.dataset.filter;
      applyFilterAndRender();
    });
  });
}



function setupSearch() {
  const input = document.getElementById('searchInput');
  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = input.value;
      applyFilterAndRender();
    }, 300);
  });
}



function validateAddForm() {
  let isValid = true;

  const fields = [
    { id: 'r-title',        errId: 'err-title',        msg: 'Title is required.' },
    { id: 'r-description',  errId: 'err-description',  msg: 'Description is required.' },
    { id: 'r-ingredients',  errId: 'err-ingredients',  msg: 'At least one ingredient is required.' },
    { id: 'r-instructions', errId: 'err-instructions', msg: 'Instructions are required.' },
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

  const calories = document.getElementById('r-calories');
  const errCal = document.getElementById('err-calories');
  if (!calories.value || Number(calories.value) < 1) {
    errCal.textContent = 'Enter a valid calorie count (minimum 1).';
    calories.classList.add('input-error');
    isValid = false;
  } else {
    errCal.textContent = '';
    calories.classList.remove('input-error');
  }

  const rating = document.getElementById('r-rating');
  const errRating = document.getElementById('err-rating');
  const ratingVal = parseFloat(rating.value);
  if (!rating.value || ratingVal < 1 || ratingVal > 5) {
    errRating.textContent = 'Rating must be between 1 and 5.';
    rating.classList.add('input-error');
    isValid = false;
  } else {
    errRating.textContent = '';
    rating.classList.remove('input-error');
  }

  const categorySelect = document.getElementById('r-category');
  const errCategory = document.getElementById('err-category');
  const selected = Array.from(categorySelect.selectedOptions);
  if (selected.length === 0) {
    errCategory.textContent = 'Select at least one category.';
    isValid = false;
  } else {
    errCategory.textContent = '';
  }

  return isValid;
}



function setupAddForm() {
  const form = document.getElementById('addRecipeForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('err-form').textContent = '';

    if (!validateAddForm()) return;

    const newRecipe = {
      title:        document.getElementById('r-title').value.trim(),
      description:  document.getElementById('r-description').value.trim(),
      calories:     Number(document.getElementById('r-calories').value),
      rating:       parseFloat(document.getElementById('r-rating').value),
      category:     Array.from(document.getElementById('r-category').selectedOptions).map(o => o.value),
      ingredients:  document.getElementById('r-ingredients').value.split(',').map(s => s.trim()).filter(Boolean),
      instructions: document.getElementById('r-instructions').value.trim(),
      image:        '',
      hidden:       false
    };

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
  
    document.getElementById('addRecipeContainer').style.display = 'none';
    document.getElementById('toggleFormBtn').textContent = '+ Add Recipe';

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe)
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      form.reset();
      await loadRecipes();
    } catch (err) {
      document.getElementById('err-form').textContent =
        'Could not add recipe. Make sure JSON Server is running.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Recipe';
    }
  });
}

function toggleAddForm() {
  const container = document.getElementById('addRecipeContainer');
  const btn = document.getElementById('toggleFormBtn');

  const isHidden = container.style.display === 'none';
  container.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '✕ Close' : '+ Add Recipe';

 
  if (isHidden) {
    container.scrollIntoView({ behavior: 'smooth' });
  }
}



function setupModalClose() {
  document.getElementById('recipeModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('recipeModal');
  });
}



document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  setupFilters();
  setupSearch();
  setupAddForm();
  setupModalClose();
});
