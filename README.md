# The Meal Atelier
**Name:** Armish Hashmi
**Roll No:** F24BDOCS1M01008
**Course:** Web Technologies SP26 — BSCS 4th Semester

---

## Project Description
The Meal Atelier is a recipe management web application where users can browse, filter, and add recipes. An admin panel allows full management of all recipes including edit, delete, and hiding recipes from users. The app also includes a monthly meal planner and a grocery list manager.

---

## Tech Stack
- HTML5 (semantic structure)
- Custom CSS
- Plain JavaScript (no frameworks)
- JSON Server (mock REST API)

---

## Setup & Run Instructions

### 1. Install JSON Server (first time only)
```bash
npm install -g json-server
```

### 2. Start the backend
Navigate to the project folder, then run:
```bash
npx json-server --watch data/db.json --port 3000
```
Keep this terminal open while using the app.

### 3. Open the app
Open `index.html` in your browser (use Live Server in VS Code or just open the file directly).

> **Important:** JSON Server must be running on port 3000 for the app to work.

---

## Features

### User Panel (index.html)
- Browse all visible recipes fetched from JSON Server (GET)
- Filter recipes by dietary category (Vegan, Vegetarian, Gluten-Free, Dairy-Free, Low-Carb)
- Debounced search bar
- Click any recipe card to view full details in a modal
- Add new recipe form with 7 input fields and inline validation (POST)
- Loading state while fetching, error state if server is unreachable

### Admin Panel (admin.html)
- View ALL recipes including hidden ones (GET)
- 5 summary stats: total, visible, hidden, avg calories, avg rating
- Edit any recipe via inline form (PUT)
- Delete any recipe with confirmation dialog (DELETE)
- Toggle recipe visibility (hidden/visible)
- Visual distinction: dark sidebar, red admin badge

### Meal Planner (planner.html)
- Weekly calendar view with navigation (prev/next week)
- Click any day to assign a recipe from your collection
- Meals stored in JSON Server (POST/PUT/DELETE)

### Grocery List (grocery.html)
- Add items per category (POST)
- Check off items (PATCH)
- Delete individual items (DELETE)
- Clear all checked items at once

---

## API Endpoints Used
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /recipes | Load all recipes |
| GET | /recipes/:id | Load single recipe for edit |
| POST | /recipes | Add new recipe |
| PUT | /recipes/:id | Update recipe |
| DELETE | /recipes/:id | Delete recipe |
| GET | /planner | Load meal plan |
| POST | /planner | Add meal to day |
| PUT | /planner/:id | Update meal on day |
| DELETE | /planner/:id | Remove meal from day |
| GET | /groceryItems | Load grocery items |
| POST | /groceryItems | Add grocery item |
| PATCH | /groceryItems/:id | Toggle done state |
| DELETE | /groceryItems/:id | Delete grocery item |

---

## File Structure
```
TheMealAtelier/
├── .gitignore
├── index.html       User panel
├── admin.html       Admin panel
├── planner.html     Meal planner
├── grocery.html     Grocery list
├── css/
│   ├── style.css    Shared styles
│   ├── admin.css    Admin styles
│   ├── planner.css  Planner styles
│   └── grocery.css  Grocery styles
├── js/
│   ├── app.js       User panel JS
│   ├── admin.js     Admin panel JS
│   ├── planner.js   Planner JS
│   └── grocery.js   Grocery JS
├── data/
│   └── db.json      JSON Server database
├── images/          Recipe images
└── README.md
```
