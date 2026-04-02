// poke_app.js
//This file contains all the LOGIC for the type calculator.
// It reads data from types.js and updates the HTML page.

// --- state ---
// This is the "state" of our app - the current selected attacking and defending types.

let selected = []; // allows up to two name strings for type


// --- implement buttons for each type ---
// when a button is clicked, update the state and recalculate the effectiveness
const typeGrid = document.getElementById('type-grid');
ALL_TYPES.forEach(function(typeName) {
    const button = document.createElement('button');
    button.className = 'type-btn';
    button.innerText = typeName;
    button.style.backgroundColor = TYPE_COLORS[typeName];

    //collors the button using the types colors from poke_type.js
    const color = TYPE_COLORS[typeName];
    button.style.backgroundColor = color + '33'; // add transparency for better text visibility (33 = 20% opacity)
    button.className = 'type-btn';
    button.dataset.type = typeName;
    button.style.borderColor = color + '77'; // add a border with the solid color for better visibility
    button.style.color = color;

    button.addEventListener('click', function() {
        // toggle the type in the selected array
        if (selected.includes(typeName)) {
            // if already selected, deselect it
            selected = selected.filter(t => t !== typeName);
            button.classList.remove('selected');
        } else if (selected.length < 2) {
            // if not selected and we have room, select it
            selected.push(typeName);
            button.classList.add('selected');
        } else {
            // if we already have 2 selected, replace the first one
            selected = [selected[1], typeName];
        }
        refreshButtons();
        renderResults();
    });
    typeGrid.appendChild(button);
});

// --- calculations for type effectiveness ---
// pure functions that dont directly touch html
function getMultiplier(attackerType, defenderType) {
  var chart = EFFECTIVENESS[attackerType] || {};
  return chart[defenderType] !== undefined ? chart[defenderType] : 1;
}

// given the attacker's types, calculate which defending types fall into each effectiveness category
function calcOffense(attackerTypes) {
  var groups = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };

  ALL_TYPES.forEach(function(defender) {
    var total = 1;
    attackerTypes.forEach(function(attacker) {
      total *= getMultiplier(attacker, defender);
    });

    if (groups[total] !== undefined) {
      groups[total].push(defender);
    } else {
      groups[1].push(defender);
    }
  });

  return groups;
}

// given the defender's types, calculate which attacking types fall into each effectiveness category
function calcDefense(defenderTypes) {
  var groups = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };
 
  ALL_TYPES.forEach(function(attacker) {
    // For dual-type defenders, multiply both values together
    // Ex: Ground hits Fire/Flying: 1x * 0x = 0x (immune due to Flying)
    var total = 1;
    defenderTypes.forEach(function(defender) {
      total *= getMultiplier(attacker, defender);
    });
 
    if (groups[total] !== undefined) {
      groups[total].push(attacker);
    } else {
      groups[1].push(attacker); // unexpected value — treat as normal
    }
  });
 
  return groups;
}



// --- Rendering the page ---
// update the page to show results 

// Adds/removes the .selected CSS class on each type button
function refreshButtons() {
  document.querySelectorAll('.type-btn').forEach(function(btn) {
    btn.classList.toggle('selected', selected.includes(btn.dataset.type));
  });
}

// Creates one colored type badge element
function makeBadge(typeName) {
  var color = TYPE_COLORS[typeName];
  var span = document.createElement('span');
  span.className = 'type-badge';
  span.textContent = typeName;
  span.style.backgroundColor = color + '33';
  span.style.color = color;
  span.style.border = '1px solid ' + color + '88';
  return span;
}

// Creates a labeled group of badges (e.g. "Weak to — 2×" + badges)
// Returns null if the type list is empty so we skip rendering it
function makeGroup(labelText, typeList) {
  if (typeList.length === 0) return null;
 
  var div = document.createElement('div');
  div.className = 'eff-group';
 
  var p = document.createElement('p');
  p.className = 'eff-group-label';
  p.textContent = labelText;
  div.appendChild(p);
 
  typeList.forEach(function(t) { div.appendChild(makeBadge(t)); });
 
  return div;
}

// Clears and rebuilds the results panel based on the current selection
function renderResults() {
  var panel = document.getElementById('results');
  panel.innerHTML = '';
 
  if (selected.length === 0) {
    panel.innerHTML = '<p class="placeholder-text">Select a type above to see matchups.</p>';
    return;
  }
 
  var groups = calcDefense(selected);
 
  var sections = [
    { mult: 0,    label: 'Immune to — 0×' },
    { mult: 0.25, label: 'Resists strongly — ¼×' },
    { mult: 0.5,  label: 'Resists — ½×' },
    { mult: 2,    label: 'Weak to — 2×' },
    { mult: 4,    label: 'Very weak to — 4×' },
  ];
 
  var hasContent = false;
  sections.forEach(function(s) {
    var el = makeGroup(s.label, groups[s.mult]);
    if (el) { panel.appendChild(el); hasContent = true; }
  });
 
  if (!hasContent) {
    panel.innerHTML = '<p class="placeholder-text">No notable matchups — all types deal normal damage (1×).</p>';
  }
}