// ---------- Settings ----------

// Which body parts each Focus option draws from. Moves are picked round-robin across them.
const FOCUS_TARGETS = {
  fullBody: ["glutes", "core", "innerThighs", "shoulders", "outerThighs", "arms"],
  legsGlutes: ["glutes", "innerThighs", "outerThighs"],
  armsShoulders: ["shoulders", "arms"],
  coreAbs: ["core"],
};

// If a focus has too few moves at the chosen level/equipment, the workout is topped up
// from the closest related body part first, so it never comes up short.
const RELATED_TARGETS = {
  fullBody: [],
  legsGlutes: ["core"],
  armsShoulders: ["core"],
  coreAbs: ["glutes", "shoulders"],
};

// The body-part label shown on every move.
const TARGET_LABELS = {
  innerThighs: "Inner thighs",
  outerThighs: "Outer thighs",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  arms: "Arms",
  shoulders: "Shoulders",
};

const FOCUS_COPY = {
  fullBody: {
    title: "Full body",
    blurb: "A balanced mix for your whole body: legs, glutes, core and upper body.",
  },
  legsGlutes: {
    title: "Legs & glutes",
    blurb: "Squatting, lifting and side-leg work to shape and strengthen your inner thighs, outer thighs and glutes.",
  },
  armsShoulders: {
    title: "Arms & shoulders",
    blurb: "Toning moves for the arms and shoulders for a strong, lifted upper body.",
  },
  coreAbs: {
    title: "Core & abs",
    blurb: "Steady, controlled ab work for a strong, supported centre.",
  },
};

const EQUIPMENT_ORDER = ["dumbbells", "bands", "ankleWeights", "gym", "none"];
const EQUIPMENT_SHORT = {
  dumbbells: "Dumbbells",
  bands: "Resistance bands",
  ankleWeights: "Ankle weights",
  gym: "Fully equipped gym",
  none: "No equipment",
};

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };
const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

const REPS_BY_LEVEL = {
  beginner: { sets: 2, reps: 12 },
  intermediate: { sets: 3, reps: 12 },
  advanced: { sets: 3, reps: 15 },
};
const HOLD_BY_LEVEL = {
  beginner: { sets: 2, seconds: 20 },
  intermediate: { sets: 2, seconds: 30 },
  advanced: { sets: 3, seconds: 30 },
};
const STRETCH_SECONDS = { beginner: 30, intermediate: 45, advanced: 60 };
const REST_SECONDS = { beginner: 45, intermediate: 40, advanced: 30 };

// How many moves each workout gets, by chosen duration.
const DURATION_PLAN = {
  10: { warmup: 1, main: 3, cooldown: 1 },
  20: { warmup: 2, main: 5, cooldown: 2 },
  30: { warmup: 2, main: 7, cooldown: 2 },
  45: { warmup: 2, main: 9, cooldown: 2 },
};

// Most moves are regular exercises; only a few ballet-inspired ones are mixed in.
// This is a soft limit: it is relaxed if the workout can't otherwise be filled.
const BALLET_CAP = { 10: 1, 20: 1, 30: 2, 45: 2 };

// The two-part dose shown beside each move, e.g. { main: "3 × 12", sub: "reps · each side" }.
function doseFor(exercise) {
  if (exercise.dose) return { main: exercise.dose, sub: "" };
  const side = exercise.perSide ? "each side" : "";
  const join = (...parts) => parts.filter(Boolean).join(" · ");

  if (exercise.kind === "stretch") {
    return { main: `${STRETCH_SECONDS[state.level]}s`, sub: join("hold", side) };
  }
  if (exercise.unit === "hold") {
    const hold = HOLD_BY_LEVEL[state.level];
    return { main: `${hold.sets} × ${hold.seconds}s`, sub: join("hold", side) };
  }
  const reps = REPS_BY_LEVEL[state.level];
  return { main: `${reps.sets} × ${reps.reps}`, sub: join("reps", side) };
}

// Groups near-duplicate movements (e.g. Squats / Goblet Squats) so we don't stack them.
function getPattern(exercise) {
  return exercise.pattern || exercise.name.toLowerCase();
}

// ---------- State and screens ----------

const state = {
  focus: null,
  duration: null,
  level: null,
  equipment: new Set(),
};

const STEPS = ["focus", "duration", "equipment", "level"];
let currentStep = -1;
let advanceTimer = null;

const screens = {
  landing: document.getElementById("screen-landing"),
  focus: document.getElementById("screen-focus"),
  duration: document.getElementById("screen-duration"),
  equipment: document.getElementById("screen-equipment"),
  level: document.getElementById("screen-level"),
  result: document.getElementById("screen-result"),
};

const wordmark = document.getElementById("wordmark");
const backBtn = document.getElementById("back-btn");
const stepLabel = document.getElementById("step-label");
const segments = document.getElementById("segments");
const equipmentContinue = document.getElementById("equipment-continue");
const generateBtn = document.getElementById("generate-btn");
const generateBar = document.getElementById("generate-bar");
const resultTitle = document.getElementById("result-title");

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  window.scrollTo(0, 0);
}

function focusHeading(node) {
  if (node) node.focus({ preventScroll: true });
}

// Top bar: Back + "Step n of 4" during questions; the name on the result page.
// The landing page already shows the name as its big title, so the wordmark is hidden there.
function setChrome(inSteps, showWordmark = false) {
  wordmark.classList.toggle("hidden", inSteps || !showWordmark);
  backBtn.classList.toggle("hidden", !inSteps);
  stepLabel.classList.toggle("hidden", !inSteps);
  segments.classList.toggle("hidden", !inSteps);
}

function syncOptions() {
  document.querySelectorAll(".options").forEach((group) => {
    const key = group.dataset.key;
    const isMulti = group.dataset.multi === "true";
    group.querySelectorAll(".option").forEach((option) => {
      const value = option.dataset.value;
      const pressed = isMulti ? state.equipment.has(value) : state[key] === value;
      option.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
  });
  equipmentContinue.disabled = state.equipment.size === 0;
  generateBar.classList.toggle("hidden", !state.level);
}

function showLanding() {
  clearTimeout(advanceTimer);
  currentStep = -1;
  setChrome(false);
  showScreen("landing");
}

function showStep(index) {
  clearTimeout(advanceTimer);
  currentStep = index;
  setChrome(true);
  stepLabel.textContent = `Step ${index + 1} of ${STEPS.length}`;
  segments.querySelectorAll("span").forEach((segment, i) => {
    segment.classList.toggle("done", i <= index);
  });
  syncOptions();
  showScreen(STEPS[index]);
  focusHeading(screens[STEPS[index]].querySelector(".question-title"));
}

document.querySelectorAll(".options").forEach((group) => {
  const key = group.dataset.key;
  const isMulti = group.dataset.multi === "true";

  group.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value;

      if (isMulti) {
        // "No equipment" stands alone; any real equipment replaces it.
        if (value === "none") {
          state.equipment = state.equipment.has("none") ? new Set() : new Set(["none"]);
        } else {
          state.equipment.delete("none");
          if (state.equipment.has(value)) state.equipment.delete(value);
          else state.equipment.add(value);
        }
        syncOptions();
        return;
      }

      state[key] = value;
      syncOptions();
      if (key === "level") return;

      // Single-choice questions move on by themselves after a short beat.
      const step = currentStep;
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => {
        if (currentStep === step) showStep(step + 1);
      }, 250);
    });
  });
});

document.getElementById("start-btn").addEventListener("click", () => showStep(0));
backBtn.addEventListener("click", () => {
  if (currentStep > 0) showStep(currentStep - 1);
  else showLanding();
});
equipmentContinue.addEventListener("click", () => {
  if (state.equipment.size > 0) showStep(3);
});
generateBtn.addEventListener("click", generateAndShowWorkout);
document.getElementById("regenerate-btn").addEventListener("click", generateAndShowWorkout);
// "Start over" clears every answer and goes back to the first question.
document.getElementById("change-btn").addEventListener("click", () => {
  state.focus = null;
  state.duration = null;
  state.level = null;
  state.equipment = new Set();
  showStep(0);
});

// ---------- Building a workout ----------

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Main moves the user could do at their level with the gear they have. No-equipment moves
// are always allowed, and "Fully equipped gym" unlocks every kind of gear.
// Warm-ups and stretches are handled separately.
function eligibleExercises() {
  const maxLevelRank = LEVEL_RANK[state.level];
  const hasGym = state.equipment.has("gym");
  return EXERCISES.filter((exercise) => {
    if (exercise.kind) return false;
    const equipmentOk =
      exercise.equipment === "bodyweight" || hasGym || state.equipment.has(exercise.equipment);
    const levelOk = LEVEL_RANK[exercise.difficulty] <= maxLevelRank;
    return equipmentOk && levelOk;
  });
}

// Ranks a candidate for picking: moves using the user's gear beat no-equipment versions,
// and an unused movement pattern beats a repeat. Within a tier, a move whose main target
// is this body part beats one that only touches it on the side.
function rankCandidate(exercise, usedPatterns, group) {
  const usesGear = exercise.equipment !== "bodyweight";
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
// Ballet-inspired moves are held to a small cap, relaxed only if nothing else is left.
function pickMain(pool, groups, count, usedPatterns, tracker, balletCap) {
  const byGroup = {};
  groups.forEach((group) => {
    byGroup[group] = shuffle(pool.filter((exercise) => exercise.targets.includes(group)));
  });

  const picked = [];
  let capRelaxed = false;

  while (picked.length < count) {
    let pickedThisRound = false;

    for (const group of groups) {
      if (picked.length >= count) break;

      const capped = !capRelaxed && tracker.ballet >= balletCap;
      const candidates = capped
        ? byGroup[group].filter((exercise) => !exercise.ballet)
        : byGroup[group];
      if (candidates.length === 0) continue;

      const chosen = pickBest(candidates, usedPatterns, group);
      Object.values(byGroup).forEach((list) => {
        const index = list.indexOf(chosen);
        if (index !== -1) list.splice(index, 1);
      });
      picked.push(chosen);
      usedPatterns.add(getPattern(chosen));
      if (chosen.ballet) tracker.ballet++;
      pickedThisRound = true;
    }

    if (!pickedThisRound) {
      if (capRelaxed) break;
      capRelaxed = true;
    }
  }

  return picked;
}

// Warm-ups and cooldown stretches: prefer ones for the chosen focus, then a related
// body part, then anything.
function pickSupport(kind, count) {
  const maxLevelRank = LEVEL_RANK[state.level];
  const eligible = EXERCISES.filter(
    (exercise) => exercise.kind === kind && LEVEL_RANK[exercise.difficulty] <= maxLevelRank
  );
  const focusTargets = FOCUS_TARGETS[state.focus];
  const relatedTargets = RELATED_TARGETS[state.focus];

  const exact =
    state.focus === "fullBody"
      ? eligible
      : eligible.filter((e) => e.targets.some((t) => focusTargets.includes(t)));
  const related = eligible.filter(
    (e) => !exact.includes(e) && e.targets.some((t) => relatedTargets.includes(t))
  );
  const rest = eligible.filter((e) => !exact.includes(e) && !related.includes(e));

  return [...shuffle(exact), ...shuffle(related), ...shuffle(rest)].slice(0, count);
}

function buildWorkout() {
  const plan = DURATION_PLAN[state.duration];
  const balletCap = BALLET_CAP[state.duration];
  const groups = FOCUS_TARGETS[state.focus];
  const eligible = eligibleExercises();
  const usedPatterns = new Set();
  const tracker = { ballet: 0 };

  const pool = eligible.filter((exercise) => exercise.targets.some((t) => groups.includes(t)));
  // Shuffle the body-part order so shorter workouts vary.
  let main = pickMain(pool, shuffle(groups), plan.main, usedPatterns, tracker, balletCap);

  // Top up from related body parts, closest one first.
  for (const relatedGroup of RELATED_TARGETS[state.focus]) {
    if (main.length >= plan.main) break;
    const taken = new Set(main.map((exercise) => exercise.name));
    const extras = eligible.filter(
      (exercise) => !taken.has(exercise.name) && exercise.targets.includes(relatedGroup)
    );
    main = main.concat(
      pickMain(extras, [relatedGroup], plan.main - main.length, usedPatterns, tracker, balletCap)
    );
  }

  // Last resort so a workout is never short: anything eligible, any body part.
  if (main.length < plan.main) {
    const taken = new Set(main.map((exercise) => exercise.name));
    const anything = eligible.filter((exercise) => !taken.has(exercise.name));
    main = main.concat(
      pickMain(
        anything,
        shuffle(FOCUS_TARGETS.fullBody),
        plan.main - main.length,
        usedPatterns,
        tracker,
        balletCap
      )
    );
  }

  // Standing moves first, floor work after (stable sort keeps the picked order).
  main.sort((a, b) => (a.floor ? 1 : 0) - (b.floor ? 1 : 0));

  return {
    warmup: pickSupport("warmup", plan.warmup),
    main,
    cooldown: pickSupport("stretch", plan.cooldown),
  };
}

// ---------- Showing the workout ----------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function equipmentSummary() {
  const picked = EQUIPMENT_ORDER.filter((key) => state.equipment.has(key));
  if (picked.length === 0) return EQUIPMENT_SHORT.none;
  const names = picked.map((key) => EQUIPMENT_SHORT[key]);
  if (names.length <= 2) return names.join(" + ");
  return `${names.slice(0, 2).join(" + ")} +${names.length - 2}`;
}

function countText(count, singular) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

// One row: an index on the left, then name + dose, body part, how-to, and (for main moves) rest.
function renderItems(list, items, indexPrefix, withRest) {
  list.innerHTML = "";
  items.forEach((exercise, i) => {
    const li = el("li", "item");
    li.appendChild(el("span", "item-index", `${indexPrefix}${String(i + 1).padStart(indexPrefix ? 1 : 2, "0")}`));

    const body = el("div", "item-body");

    const head = el("div", "item-head");
    head.appendChild(el("h4", "item-name", exercise.name));
    const dose = doseFor(exercise);
    const doseEl = el("p", "item-dose");
    doseEl.appendChild(el("span", "dose-main", dose.main));
    if (dose.sub) doseEl.appendChild(el("span", "dose-sub", dose.sub));
    head.appendChild(doseEl);
    body.appendChild(head);

    body.appendChild(el("p", "item-part", TARGET_LABELS[exercise.targets[0]]));
    body.appendChild(el("p", "item-how", exercise.how));
    if (withRest) body.appendChild(el("p", "item-rest", `Rest ${REST_SECONDS[state.level]} seconds`));

    li.appendChild(body);
    list.appendChild(li);
  });
}

function renderWorkout({ warmup, main, cooldown }) {
  const copy = FOCUS_COPY[state.focus];
  resultTitle.textContent = copy.title;
  document.getElementById("result-meta").textContent = [
    `${state.duration} min`,
    equipmentSummary(),
    LEVEL_LABEL[state.level],
  ].join("  ·  ");
  document.getElementById("result-blurb").textContent = copy.blurb;

  document.getElementById("warmup-count").textContent = countText(warmup.length, "move");
  document.getElementById("workout-count").textContent = countText(main.length, "exercise");
  document.getElementById("cooldown-count").textContent = countText(cooldown.length, "stretch").replace("stretchs", "stretches");

  renderItems(document.getElementById("warmup-list"), warmup, "W", false);
  renderItems(document.getElementById("workout-list"), main, "", true);
  renderItems(document.getElementById("cooldown-list"), cooldown, "C", false);
}

function generateAndShowWorkout() {
  if (!state.focus || !state.duration || !state.level || state.equipment.size === 0) return;
  clearTimeout(advanceTimer);
  renderWorkout(buildWorkout());
  currentStep = -1;
  setChrome(false, true);
  showScreen("result");
  focusHeading(resultTitle);
}

showLanding();
