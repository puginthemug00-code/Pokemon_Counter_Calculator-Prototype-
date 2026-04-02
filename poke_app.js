// poke_app.js
//This file contains all the LOGIC for the type calculator.
// It reads data from types.js and updates the HTML page.

// --- state ---
// This is the "state" of our app - the current selected attacking and defending types.

let selected = []; // allows up to two name strings for type


// --- implement buttons for each type ---
// when a button is clicked, update the state and recalculate the effectiveness
const typeGrid = document.getElementById('.type-grid');
ALL_TYPES.forEach(function(typeName) {
    const button = document.createElement('button');
    button.classname = 'type-btn';
    button.innerText = typeName;
    button.style.backgroundColor = TYPE_COLORS[typeName];

    //collors the button using the types colors from poke_type.js
    const color = TYPE_COLORS[typeName];
    button.style.backgroundColor = color + '33'; // add transparency for better text visibility (33 = 20% opacity)
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


