const RECIPES_API = 'http://localhost:3000/recipes';
const PLANNER_API = 'http://localhost:3000/planner';

let currentWeekOffset = 0;
let selectedDayKey = null;
let allRecipes = [];
let plannerData = {};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ===========================
   FETCH DATA
=========================== */

async function loadData() {
  try {
    const [recRes, planRes] = await Promise.all([
      fetch(RECIPES_API),
      fetch(PLANNER_API)
    ]);

    if (recRes.ok) {
      allRecipes = await recRes.json();
    }

    if (planRes.ok) {
      const plannerArray = await planRes.json();
      plannerData = {};
      plannerArray.forEach(entry => {
        plannerData[entry.dayKey] = entry;
      });
    }

    buildPlanner();
  } catch (err) {
    buildPlanner();
  }
}

/* ===========================
   BUILD WEEK VIEW
=========================== */

function getWeekDates(offset) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function buildPlanner() {
  const grid = document.getElementById('plannerGrid');
  const dates = getWeekDates(currentWeekOffset);
  const today = new Date().toDateString();

  document.getElementById('weekLabel').textContent =
    `${dates[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })} — ` +
    `${dates[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  grid.innerHTML = '';

  dates.forEach(date => {
    const key = date.toISOString().split('T')[0];
    const entry = plannerData[key];
    const isToday = date.toDateString() === today;

    const card = document.createElement('div');
    card.className = 'day-card' + (isToday ? ' day-today' : '');

    card.innerHTML = `
      <h4>${DAY_NAMES[date.getDay()]}</h4>
      <div class="day-date">${date.getDate()}</div>
      <div class="planned-recipe ${entry ? 'has-meal' : ''}" onclick="openMealPicker('${key}')">
        ${entry
          ? `<span>${entry.mealTitle}</span>
             <button class="remove-meal" onclick="removeMeal(event, '${key}')" aria-label="Remove meal">×</button>`
          : '+ add meal'}
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ===========================
   MEAL PICKER MODAL
=========================== */

function openMealPicker(dayKey) {
  selectedDayKey = dayKey;
  document.getElementById('mealSearch').value = '';
  document.getElementById('mealPickerModal').style.display = 'flex';
  renderMealOptions('');
}

function closeMealPicker() {
  document.getElementById('mealPickerModal').style.display = 'none';
  selectedDayKey = null;
}

function renderMealOptions(query) {
  const list = document.getElementById('mealPickerList');
  const filtered = allRecipes.filter(r =>
    !r.hidden && r.title.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    list.innerHTML = '<p class="planner-empty">No recipes found.</p>';
    return;
  }

  list.innerHTML = filtered.map(r => `
    <div class="meal-option" onclick="selectMeal('${r.id}', '${r.title.replace(/'/g, "\\'")}')">
      <span>${r.title}</span>
      <span class="meal-cal">&#128293; ${r.calories} kcal</span>
    </div>
  `).join('');
}

/* ===========================
   SELECT MEAL — POST to planner
=========================== */

async function selectMeal(recipeId, mealTitle) {
  const entry = {
    dayKey: selectedDayKey,
    recipeId: Number(recipeId),
    mealTitle: mealTitle
  };

  try {
    const existing = plannerData[selectedDayKey];

    if (existing) {
      const res = await fetch(`${PLANNER_API}/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const updated = await res.json();
        plannerData[selectedDayKey] = updated;
      }
    } else {
      const res = await fetch(PLANNER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const created = await res.json();
        plannerData[selectedDayKey] = created;
      }
    }
  } catch (err) {
    plannerData[selectedDayKey] = { dayKey: selectedDayKey, mealTitle, recipeId };
  }

  closeMealPicker();
  buildPlanner();
}

/* ===========================
   REMOVE MEAL — DELETE from planner
=========================== */

async function removeMeal(event, dayKey) {
  event.stopPropagation();
  const entry = plannerData[dayKey];
  if (!entry) return;

  try {
    if (entry.id) {
      await fetch(`${PLANNER_API}/${entry.id}`, { method: 'DELETE' });
    }
  } catch (err) {
    /* silent fail — still remove from UI */
  }

  delete plannerData[dayKey];
  buildPlanner();
}

/* ===========================
   WEEK NAVIGATION
=========================== */

document.getElementById('prevWeek').addEventListener('click', () => {
  currentWeekOffset--;
  buildPlanner();
});

document.getElementById('nextWeek').addEventListener('click', () => {
  currentWeekOffset++;
  buildPlanner();
});

document.getElementById('mealSearch').addEventListener('input', (e) => {
  renderMealOptions(e.target.value);
});

document.getElementById('mealPickerModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMealPicker();
});

/* ===========================
   INIT
=========================== */

document.addEventListener('DOMContentLoaded', loadData);
