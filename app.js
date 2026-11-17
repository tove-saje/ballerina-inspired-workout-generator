// Which body parts each Focus chip draws from. "Overall" round-robins across all of them.
const FOCUS_TARGETS = {
  overall: ["glutes", "core", "innerThighs", "shoulders", "outerThighs", "arms"],
  innerThighs: ["innerThighs"],
  outerThighs: ["outerThighs"],
  glutes: ["glutes"],
  core: ["core"],
  arms: ["arms"],
  shoulders: ["shoulders"],
};

// If a specific focus has too few exercises at the chosen level/equipment, the
// workout is topped up from the closest related body parts instead of coming up short.
const RELATED_TARGETS = {
  overall: [],
  innerThighs: ["glutes", "outerThighs"],
  outerThighs: ["glutes", "innerThighs"],
  glutes: ["outerThighs", "innerThighs", "core"],
  core: ["glutes", "shoulders"],
  arms: ["shoulders", "core"],
  shoulders: ["arms", "core"],
};

const TARGET_LABELS = {
  innerThighs: "inner thighs",
  outerThighs: "outer thighs",
  glutes: "glutes",
  calves: "calves & ankles",
  core: "core",
  arms: "arms",
  shoulders: "shoulders",
};

const EQUIPMENT_LABELS = {
  bodyweight: "no equipment",
  chair: "chair / barre",
  dumbbells: "light dumbbells",
  bands: "resistance band",
  ankleWeights: "ankle weights",
};

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

// What shows in the pill on each card, by exercise unit and level.
const DOSE_BY_UNIT = {
  reps: { beginner: "2 × 12", intermediate: "3 × 15", advanced: "3 × 20" },
  hold: { beginner: "2 × 20 sec", intermediate: "2 × 30 sec", advanced: "3 × 30 sec" },
  stretch: { beginner: "30 sec", intermediate: "45 sec", advanced: "60 sec" },
};

function doseFor(exercise) {
  const unit = exercise.kind === "stretch" ? "stretch" : exercise.unit || "reps";
  const base = exercise.dose || DOSE_BY_UNIT[unit][state.level];
  return exercise.perSide ? `${base} / side` : base;
}

// How many moves each workout gets, by chosen duration, plus one closing stretch.
const DURATION_PLAN = {
  10: { main: 3, stretch: 1 },
  20: { main: 5, stretch: 1 },
  30: { main: 7, stretch: 1 },
  45: { main: 9, stretch: 1 },
};

// Groups near-duplicate movements (e.g. Plié Squats / Chair Plié) so we don't stack them.
function getPattern(exercise) {
  return exercise.pattern || exercise.name.toLowerCase();
}

const state = {
  focus: null,
  duration: null,
  level: null,
  equipment: new Set(),
};

const setupScreen = document.getElementById("setup-screen");
const resultScreen = document.getElementById("result-screen");
const generateBtn = document.getElementById("generate-btn");
const setupHint = document.getElementById("setup-hint");
const regenerateBtn = document.getElementById("regenerate-btn");
const startOverBtn = document.getElementById("start-over-btn");
const exerciseList = document.getElementById("exercise-list");
const resultSummary = document.getElementById("result-summary");

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setupChipGroup(groupId, onChange) {
  const group = document.getElementById(groupId);
  const isMulti = group.dataset.multi === "true";
  group.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (isMulti) {
        chip.classList.toggle("selected");
      } else {
        group.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
      }
      onChange(group, isMulti);
    });
  });
}

// Equipment is optional, so it isn't required to enable the button.
function updateGenerateButtonState() {
  const ready = state.focus && state.duration && state.level;
  generateBtn.disabled = !ready;
  setupHint.classList.toggle("hidden", !!ready);
}

function setupSingleSelect(groupId, key) {
  setupChipGroup(groupId, (group) => {
    const selected = group.querySelector(".chip.selected");
    state[key] = selected ? selected.dataset.value : null;
    updateGenerateButtonState();
  });
}

setupSingleSelect("focus-group", "focus");
setupSingleSelect("duration-group", "duration");
setupSingleSelect("level-group", "level");

setupChipGroup("equipment-group", (group) => {
  state.equipment = new Set(
    Array.from(group.querySelectorAll(".chip.selected")).map((c) => c.dataset.value)
  );
});

// Everything the user could do at their level with the gear they have
// (no-equipment moves are always allowed). Stretches are handled separately.
function eligibleExercises() {
  const maxLevelRank = LEVEL_RANK[state.level];
  return EXERCISES.filter((exercise) => {
    if (exercise.kind === "stretch") return false;
    const equipmentOk = exercise.equipment === "bodyweight" || state.equipment.has(exercise.equipment);
    const levelOk = LEVEL_RANK[exercise.difficulty] <= maxLevelRank;
    return equipmentOk && levelOk;
  });
}

// Ranks a candidate for picking: gear the user actually selected beats a
// no-equipment version, and an unused movement pattern beats a repeat. Within the
// same tier, a move whose main target is this body part beats one that only
// touches it on the side (e.g. Plié Squats over Arm Pulses in Plié for inner thighs).
function rankCandidate(exercise, usedPatterns, group) {
  // With Bodyweight selected, gear moves get no special preference: they mix in evenly.
  const usesGear = exercise.equipment !== "bodyweight" && !state.equipment.has("bodyweight");
  const isFresh = !usedPatterns.has(getPattern(exercise));
  let tier = 3;
  if (usesGear && isFresh) tier = 0;
  else if (!usesGear && isFresh) tier = 1;
  else if (usesGear && !isFresh) tier = 2;
  const isPrimary = exercise.targets[0] === group;
  return tier * 2 + (isPrimary ? 0 : 1);
}

function pickBest(list, usedPatterns, group) {
  let best = list[0];
  let bestRank = Infinity;
  list.forEach((exercise) => {
    const rank = rankCandidate(exercise, usedPatterns, group);
    if (rank < bestRank) {
      bestRank = rank;
      best = exercise;
    }
  });
  return best;
}

// Round-robins across body parts, preferring a fresh movement pattern each time.
// An exercise can target several body parts, so a pick is removed from every list.
function pickMain(pool, groups, count, usedPatterns) {
  const byGroup = {};
  groups.forEach((group) => {
    byGroup[group] = shuffle(pool.filter((exercise) => exercise.targets.includes(group)));
  });

  const picked = [];
  while (picked.length < count) {
    let pickedThisRound = false;

    for (const group of groups) {
      if (picked.length >= count) break;
      if (byGroup[group].length === 0) continue;

      const chosen = pickBest(byGroup[group], usedPatterns, group);
      Object.values(byGroup).forEach((list) => {
        const index = list.indexOf(chosen);
        if (index !== -1) list.splice(index, 1);
      });
      picked.push(chosen);
      usedPatterns.add(getPattern(chosen));
      pickedThisRound = true;
    }

    if (!pickedThisRound) break;
  }

  return picked;
}

// Closing stretch: prefer one for the chosen focus, then a related body part, then anything.
function pickStretches(count) {
  const maxLevelRank = LEVEL_RANK[state.level];
  const eligible = EXERCISES.filter(
    (exercise) => exercise.kind === "stretch" && LEVEL_RANK[exercise.difficulty] <= maxLevelRank
  );
  const focusTargets = FOCUS_TARGETS[state.focus];
  const relatedTargets = RELATED_TARGETS[state.focus];

  // For "Overall" any stretch is a fair match (including the calf and ankle ones).
  const exact =
    state.focus === "overall"
      ? eligible
      : eligible.filter((e) => e.targets.some((t) => focusTargets.includes(t)));
  const related = eligible.filter((e) => !exact.includes(e) && e.targets.some((t) => relatedTargets.includes(t)));
  const rest = eligible.filter((e) => !exact.includes(e) && !related.includes(e));

  return [...shuffle(exact), ...shuffle(related), ...shuffle(rest)].slice(0, count);
}

function buildWorkout() {
  const plan = DURATION_PLAN[state.duration];
  const groups = FOCUS_TARGETS[state.focus];
  const eligible = eligibleExercises();
  const usedPatterns = new Set();

  const pool = eligible.filter((exercise) => exercise.targets.some((t) => groups.includes(t)));
  // Shuffle the body-part order for "Overall" so short workouts vary.
  let main = pickMain(pool, state.focus === "overall" ? shuffle(groups) : groups, plan.main, usedPatterns);

  // Top up from related body parts, closest one first (use one up before moving to the next).
  for (const relatedGroup of RELATED_TARGETS[state.focus]) {
    if (main.length >= plan.main) break;
    const taken = new Set(main.map((exercise) => exercise.name));
    const extras = eligible.filter(
      (exercise) => !taken.has(exercise.name) && exercise.targets.includes(relatedGroup)
    );
    main = main.concat(pickMain(extras, [relatedGroup], plan.main - main.length, usedPatterns));
  }

  // Last resort so a workout is never short: anything eligible, any body part.
  if (main.length < plan.main) {
    const taken = new Set(main.map((exercise) => exercise.name));
    const anything = eligible.filter((exercise) => !taken.has(exercise.name));
    main = main.concat(
      pickMain(anything, shuffle(FOCUS_TARGETS.overall), plan.main - main.length, usedPatterns)
    );
  }

  // Standing barre work first, floor work after (stable sort keeps the picked order).
  main.sort((a, b) => (a.floor ? 1 : 0) - (b.floor ? 1 : 0));

  return { main, stretch: pickStretches(plan.stretch) };
}

function renderWorkout(main, stretch) {
  exerciseList.innerHTML = "";

  const items = [
    ...main.map((exercise) => ({ exercise, isStretch: false })),
    ...stretch.map((exercise) => ({ exercise, isStretch: true })),
  ];

  items.forEach(({ exercise, isStretch }) => {
    const li = document.createElement("li");
    li.className = "exercise-card";
    li.innerHTML = `
      <div>
        <span class="exercise-name"></span>
        <span class="exercise-muscle"></span>
      </div>
      <span class="exercise-sets"></span>
    `;
    li.querySelector(".exercise-name").textContent = exercise.name;
    li.querySelector(".exercise-sets").textContent = doseFor(exercise);

    const muscleEl = li.querySelector(".exercise-muscle");
    muscleEl.textContent = exercise.targets
      .slice(0, 2)
      .map((target) => TARGET_LABELS[target])
      .join(" · ");

    if (isStretch) {
      muscleEl.appendChild(document.createTextNode(" · "));
      const stretchTag = document.createElement("span");
      stretchTag.className = "stretch-tag";
      stretchTag.textContent = "Stretch";
      muscleEl.appendChild(stretchTag);
    } else if (exercise.equipment !== "bodyweight") {
      muscleEl.appendChild(document.createTextNode(" · "));
      const equipmentTag = document.createElement("span");
      equipmentTag.className = "equipment-tag";
      equipmentTag.textContent = EQUIPMENT_LABELS[exercise.equipment];
      muscleEl.appendChild(equipmentTag);
    }

    exerciseList.appendChild(li);
  });
}

function summaryText() {
  const focusChip = document.querySelector('#focus-group .chip[data-value="' + state.focus + '"]');
  const focusLabel = focusChip ? focusChip.textContent.replace(/^\S+\s/, "") : state.focus;
  return `${state.duration} min · ${focusLabel} · ${state.level}`;
}

function generateAndShowWorkout() {
  const { main, stretch } = buildWorkout();
  renderWorkout(main, stretch);
  resultSummary.textContent = summaryText();

  setupScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

function resetToSetup() {
  state.focus = null;
  state.duration = null;
  state.level = null;
  state.equipment = new Set();

  document.querySelectorAll(".chip.selected").forEach((chip) => chip.classList.remove("selected"));
  updateGenerateButtonState();

  resultScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
}

generateBtn.addEventListener("click", generateAndShowWorkout);
regenerateBtn.addEventListener("click", generateAndShowWorkout);
startOverBtn.addEventListener("click", resetToSetup);

updateGenerateButtonState();
