const RECIPES_API = 'http://localhost:3000/recipes';
const PLANNER_API = 'http://localhost:3000/planner';


const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth(); 

let allRecipes  = [];
let plannerData = {};



let selectedDayKey  = null;
let selectedMealType = null;



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
        const key = `${entry.dayKey}_${entry.mealType}`;
        plannerData[key] = entry;
      });
    }

    buildCalendar();
  } catch (err) {
    buildCalendar();
  }
}



function buildCalendar() {
  const grid  = document.getElementById('calendarGrid');
  const today = new Date();


  document.getElementById('monthLabel').textContent =
    new Date(currentYear, currentMonth, 1)
      .toLocaleDateString('en', { month: 'long', year: 'numeric' });

  grid.innerHTML = '';

  const firstDay  = new Date(currentYear, currentMonth, 1).getDay(); 
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();


  for (let i = 0; i < firstDay; i++) {
    const filler = document.createElement('div');
    filler.className = 'calendar-filler';
    grid.appendChild(filler);
  }


  for (let day = 1; day <= daysInMonth; day++) {
    const date    = new Date(currentYear, currentMonth, day);
    const dayKey  = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();

    const card = document.createElement('div');
    card.className = 'day-card' + (isToday ? ' day-today' : '');

    card.innerHTML = `<div class="day-number">${day}</div>` +
      MEAL_TYPES.map(type => buildMealSlot(dayKey, type)).join('');

    grid.appendChild(card);
  }
}



function buildMealSlot(dayKey, mealType) {
  const key   = `${dayKey}_${mealType}`;
  const entry = plannerData[key];
  const typeLower = mealType.toLowerCase();

  if (entry) {
    return `
      <div class="meal-slot filled ${typeLower}"
           onclick="openMealPicker('${dayKey}', '${mealType}')">
        <span class="slot-label ${typeLower}">${mealType[0]}</span>
        <span class="slot-meal-name" title="${entry.mealTitle}">${entry.mealTitle}</span>
        <button class="slot-remove"
                onclick="removeMeal(event, '${dayKey}', '${mealType}')"
                aria-label="Remove ${mealType}">×</button>
      </div>`;
  }

  return `
    <div class="meal-slot empty"
         onclick="openMealPicker('${dayKey}', '${mealType}')">
      <span class="slot-label ${typeLower}">${mealType[0]}</span>
      <span>+ ${mealType}</span>
    </div>`;
}



function openMealPicker(dayKey, mealType) {
  selectedDayKey   = dayKey;
  selectedMealType = mealType;

  const date = new Date(dayKey + 'T00:00:00');
  const dateStr = date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  document.getElementById('pickerTitle').textContent    = `Pick ${mealType}`;
  document.getElementById('pickerSubtitle').textContent = dateStr;
  document.getElementById('mealSearch').value           = '';
  document.getElementById('mealPickerModal').style.display = 'flex';

  renderMealOptions('');
}

function closeMealPicker() {
  document.getElementById('mealPickerModal').style.display = 'none';
  selectedDayKey   = null;
  selectedMealType = null;
}

function renderMealOptions(query) {
  const list = document.getElementById('mealPickerList');

  
  const filtered = allRecipes.filter(r => {
    if (r.hidden) return false;
    const matchesType  = r.category && r.category.includes(selectedMealType);
    const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<p class="planner-empty">No ${selectedMealType} recipes found.<br>
      <small>Add recipes with the "${selectedMealType}" category in the Explore page.</small></p>`;
    return;
  }

  list.innerHTML = filtered.map(r => `
    <div class="meal-option"
         onclick="selectMeal(${r.id}, '${r.title.replace(/'/g, "\\'")}')">
      <span class="meal-option-title">${r.title}</span>
      <span class="meal-option-meta">&#128293; ${r.calories} kcal &nbsp;⭐ ${r.rating}</span>
    </div>
  `).join('');
}



async function selectMeal(recipeId, mealTitle) {
  const slotKey = `${selectedDayKey}_${selectedMealType}`;
  const entry = {
    dayKey:    selectedDayKey,
    mealType:  selectedMealType,
    recipeId:  Number(recipeId),
    mealTitle: mealTitle
  };

  try {
    const existing = plannerData[slotKey];

    if (existing && existing.id) {
     
      const res = await fetch(`${PLANNER_API}/${existing.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entry)
      });
      if (res.ok) {
        plannerData[slotKey] = await res.json();
      }
    } else {
      
      const res = await fetch(PLANNER_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entry)
      });
      if (res.ok) {
        plannerData[slotKey] = await res.json();
      }
    }
  } catch (err) {
    
    plannerData[slotKey] = { ...entry, id: null };
  }

  closeMealPicker();
  buildCalendar();
}


async function removeMeal(event, dayKey, mealType) {
  event.stopPropagation();

  const slotKey = `${dayKey}_${mealType}`;
  const entry   = plannerData[slotKey];
  if (!entry) return;

  try {
    if (entry.id) {
      const res = await fetch(`${PLANNER_API}/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
    }
  } catch (err) {
   
  }

  delete plannerData[slotKey];
  buildCalendar();
}


document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  buildCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  buildCalendar();
});

document.getElementById('mealSearch').addEventListener('input', (e) => {
  renderMealOptions(e.target.value);
});

document.getElementById('mealPickerModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMealPicker();
});



document.addEventListener('DOMContentLoaded', loadData);
