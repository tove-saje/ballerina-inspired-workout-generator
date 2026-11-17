// Every exercise is ballerina inspired and kept simple.
//
// targets:   which body parts it works. The first entry is the main one (shown on the card).
//            innerThighs | outerThighs | glutes | core | arms | shoulders
//            (calves is only used by two closing stretches; there is no Calves focus)
// equipment: bodyweight | chair | dumbbells | bands | ankleWeights
// pattern:   groups near-duplicate movements (and their equipment variants) so a
//            workout never stacks e.g. Plié Squats + Band Plié Squat.
// perSide:   true for one-leg / one-arm moves; the dose pill shows "/ side".
// unit:      "hold" for isometric holds (default is reps). dose: optional text override.
// floor:     true for lying / seated / plank work, so standing moves come first.
// kind:      "stretch" for the closing stretch (never picked as a main move).
const EXERCISES = [
  // ---- Inner thighs ----
  { name: "Plié Squats", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs", "glutes"], pattern: "plie" },
  { name: "Plié Walks", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs", "glutes"], pattern: "plie-walk" },
  { name: "Plié Squat Pulses", equipment: "bodyweight", difficulty: "intermediate", targets: ["innerThighs", "glutes"], pattern: "plie-pulse" },
  { name: "Lying Leg Lifts", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"], pattern: "lying-lift", perSide: true, floor: true },
  { name: "Lying Leg Lift Pulses", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"], pattern: "lying-lift", perSide: true, floor: true },
  { name: "Lying Leg Lift Circles (Backward & Forward)", equipment: "bodyweight", difficulty: "intermediate", targets: ["innerThighs"], pattern: "lying-circle", perSide: true, floor: true },
  { name: "Lying Lower Leg Lifts", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"], pattern: "lying-lower-lift", perSide: true, floor: true },
  { name: "Lying Lower Leg Lift Circles", equipment: "bodyweight", difficulty: "intermediate", targets: ["innerThighs"], pattern: "lying-circle", perSide: true, floor: true },
  { name: "Lying Lower Leg Lift Circles (Backward & Forward)", equipment: "bodyweight", difficulty: "intermediate", targets: ["innerThighs"], pattern: "lying-circle", perSide: true, floor: true },
  { name: "Standing Side Leg Lift", equipment: "bodyweight", difficulty: "beginner", targets: ["outerThighs", "innerThighs"], pattern: "side-lift-standing", perSide: true },
  { name: "Butterfly Pulses", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"], pattern: "butterfly-pulse", floor: true },
  { name: "Band Plié Squat", equipment: "bands", difficulty: "beginner", targets: ["innerThighs", "glutes"], pattern: "plie" },
  { name: "Dumbbell Plié Squat", equipment: "dumbbells", difficulty: "beginner", targets: ["innerThighs", "glutes"], pattern: "plie" },

  // ---- Outer thighs ----
  { name: "Lying Side Leg Raises", equipment: "bodyweight", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "side-lift", perSide: true, floor: true },
  { name: "Fire Hydrant", equipment: "bodyweight", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "hydrant", perSide: true, floor: true },
  { name: "Clamshells", equipment: "bodyweight", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "clamshell", perSide: true, floor: true },
  { name: "Side-Lying Leg Circles", equipment: "bodyweight", difficulty: "intermediate", targets: ["outerThighs", "glutes"], pattern: "side-circle", perSide: true, floor: true },
  { name: "Side-Lying Leg Lift & Hold", equipment: "bodyweight", difficulty: "advanced", targets: ["outerThighs", "glutes"], pattern: "side-hold", perSide: true, unit: "hold", floor: true },
  { name: "Band Clamshell", equipment: "bands", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "clamshell", perSide: true, floor: true },
  { name: "Band Lateral Walk", equipment: "bands", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "lateral-walk" },
  { name: "Ankle Weight Side Leg Lift", equipment: "ankleWeights", difficulty: "beginner", targets: ["outerThighs", "glutes"], pattern: "side-lift", perSide: true, floor: true },
  { name: "Ankle Weight Fire Hydrant", equipment: "ankleWeights", difficulty: "intermediate", targets: ["outerThighs", "glutes"], pattern: "hydrant", perSide: true, floor: true },
  { name: "Ankle Weight Second Position Lift", equipment: "ankleWeights", difficulty: "intermediate", targets: ["outerThighs", "glutes"], pattern: "side-lift-standing", perSide: true },

  // ---- Glutes ----
  { name: "Bridge with Heel Squeeze", equipment: "bodyweight", difficulty: "beginner", targets: ["glutes", "innerThighs"], pattern: "bridge-squeeze", floor: true },
  { name: "Standing Glute Lifts", equipment: "bodyweight", difficulty: "beginner", targets: ["glutes"], pattern: "standing-lift", perSide: true },
  { name: "Frog Pumps", equipment: "bodyweight", difficulty: "intermediate", targets: ["glutes", "innerThighs"], pattern: "frog-pump", floor: true },
  { name: "Standing Kickback", equipment: "bands", difficulty: "beginner", targets: ["glutes"], pattern: "kickback", perSide: true },
  { name: "Dumbbell Glute Bridge", equipment: "dumbbells", difficulty: "beginner", targets: ["glutes"], pattern: "bridge", floor: true },

  // ---- Core ----
  { name: "Standing Ballet Knee Lift", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "knee-lift", perSide: true },
  { name: "Torso Twist", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "twist" },
  { name: "Side Bend Pulses", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "side-bend" },
  { name: "Tabletop Toe Taps", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "toe-tap", floor: true },
  { name: "Ab Crunches", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "crunch", floor: true },
  { name: "Bicycle Crunches", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "bicycle", floor: true },
  { name: "Reverse Crunches", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "reverse-crunch", floor: true },
  { name: "Dead Bug", equipment: "bodyweight", difficulty: "beginner", targets: ["core"], pattern: "dead-bug", floor: true },
  { name: "Plank Hold", equipment: "bodyweight", difficulty: "beginner", targets: ["core", "shoulders"], pattern: "plank", unit: "hold", floor: true },
  { name: "Lying Leg Scissors", equipment: "bodyweight", difficulty: "intermediate", targets: ["core"], pattern: "scissors", floor: true },
  { name: "Seated V-Hold", equipment: "bodyweight", difficulty: "intermediate", targets: ["core"], pattern: "v-hold", unit: "hold", floor: true },
  { name: "Russian Twists", equipment: "bodyweight", difficulty: "intermediate", targets: ["core"], pattern: "russian-twist", floor: true },

  // ---- Arms ----
  { name: "Ballet Arm Circles", equipment: "bodyweight", difficulty: "beginner", targets: ["arms", "shoulders"], pattern: "arm-circle" },
  { name: "Wall Push-Ups", equipment: "bodyweight", difficulty: "beginner", targets: ["arms", "shoulders"], pattern: "pushup-wall" },
  { name: "Knee Push-Ups", equipment: "bodyweight", difficulty: "beginner", targets: ["arms", "shoulders"], pattern: "pushup-knee", floor: true },
  { name: "Tricep Push-Ups (on Knees)", equipment: "bodyweight", difficulty: "intermediate", targets: ["arms"], pattern: "pushup-tricep", floor: true },
  { name: "Dumbbell Arm Pulses", equipment: "dumbbells", difficulty: "beginner", targets: ["arms"], pattern: "arm-pulse" },
  { name: "Dumbbell Bicep Curls", equipment: "dumbbells", difficulty: "beginner", targets: ["arms"], pattern: "bicep" },
  { name: "Band Bicep Curl", equipment: "bands", difficulty: "beginner", targets: ["arms"], pattern: "bicep" },
  { name: "Chair Tricep Dip", equipment: "chair", difficulty: "intermediate", targets: ["arms"], pattern: "tricep" },
  { name: "Dumbbell Tricep Kickback", equipment: "dumbbells", difficulty: "intermediate", targets: ["arms"], pattern: "tricep" },

  // ---- Shoulders ----
  { name: "Lateral Raise", equipment: "bodyweight", difficulty: "beginner", targets: ["shoulders"], pattern: "lateral" },
  { name: "Reverse Fly", equipment: "bodyweight", difficulty: "beginner", targets: ["shoulders"], pattern: "fly" },
  { name: "Front Raise", equipment: "bodyweight", difficulty: "beginner", targets: ["shoulders"], pattern: "front-raise" },
  { name: "Plank Shoulder Taps", equipment: "bodyweight", difficulty: "intermediate", targets: ["shoulders", "core"], pattern: "shoulder-tap", floor: true },
  { name: "Downward Dog Hold", equipment: "bodyweight", difficulty: "intermediate", targets: ["shoulders"], pattern: "down-dog", unit: "hold", floor: true },
  { name: "Dumbbell Shoulder Press", equipment: "dumbbells", difficulty: "beginner", targets: ["shoulders", "arms"], pattern: "press" },
  { name: "Dumbbell Lateral Raise Pulses", equipment: "dumbbells", difficulty: "beginner", targets: ["shoulders"], pattern: "lateral" },
  { name: "Dumbbell Reverse Fly", equipment: "dumbbells", difficulty: "beginner", targets: ["shoulders"], pattern: "fly" },
  { name: "Band Reverse Fly", equipment: "bands", difficulty: "beginner", targets: ["shoulders"], pattern: "fly" },
  { name: "Dumbbell Front Raise", equipment: "dumbbells", difficulty: "intermediate", targets: ["shoulders"], pattern: "front-raise" },
  { name: "Band Face Pull", equipment: "bands", difficulty: "intermediate", targets: ["shoulders"], pattern: "face-pull" },

  // ---- Closing stretches (one is added to the end of every workout) ----
  { name: "Butterfly Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"] },
  { name: "Wide-Leg Forward Fold", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["innerThighs"] },
  { name: "Frog Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "intermediate", targets: ["innerThighs"] },
  { name: "Figure-4 Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["outerThighs", "glutes"] },
  { name: "Pigeon Pose", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["glutes", "outerThighs"] },
  { name: "Seated Spinal Twist", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["outerThighs", "core"] },
  { name: "Seated Forward Fold", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["glutes", "calves"] },
  { name: "Standing Calf Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["calves"] },
  { name: "Seated Foot & Ankle Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["calves"] },
  { name: "Downward Dog Pedals", kind: "stretch", equipment: "bodyweight", difficulty: "intermediate", targets: ["calves", "shoulders"] },
  { name: "Child's Pose with Side Reach", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["core", "shoulders"] },
  { name: "Cat-Cow", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["core"] },
  { name: "Cobra Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", targets: ["core", "shoulders"] },
  { name: "Cross-Body Shoulder Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["shoulders", "arms"] },
  { name: "Overhead Tricep Stretch", kind: "stretch", equipment: "bodyweight", difficulty: "beginner", perSide: true, targets: ["arms"] },
];
