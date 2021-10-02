<template>
    <div>
        <h4
          v-bind:class="{'current-threat-level': t.active}"
          v-for="t of threatLevels"
           :key="t.label">
           {{t.label}} ({{t.value}} XP)
        </h4>

        <h4>Total XP: {{totalEncounterScore}}</h4>
        <h4>Adjusted XP: <span :class="totalScoreClass">{{adjustedEncounterScore}} of {{maxEncounterScore}}</span></h4>
    </div>
</template>
<script>
/**
 * Player Character XP Thresholds
 */
const xpThresholdsByLevel = {
    1: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    2: {
        easy: 50,
        medium: 100,
        hard: 150,
        deadly: 200,
    },
    3: {
        easy: 75,
        medium: 150,
        hard: 225,
        deadly: 400,
    },
    4: {
        easy: 125,
        medium: 250,
        hard: 375,
        deadly: 500,
    },
    5: {
        easy: 250,
        medium: 500,
        hard: 750,
        deadly: 1100,
    },
    6: {
        easy: 300,
        medium: 600,
        hard: 900,
        deadly: 1400,
    },
    7: {
        easy: 350,
        medium: 750,
        hard: 1100,
        deadly: 1700,
    },
    8: {
        easy: 450,
        medium: 900,
        hard: 1400,
        deadly: 2100,
    },
    9: {
        easy: 550,
        medium: 1100,
        hard: 1600,
        deadly: 2400,
    },
    10: {
        easy: 600,
        medium: 1200,
        hard: 1900,
        deadly: 2800,
    },
    11: {
        easy: 800,
        medium: 1600,
        hard: 2400,
        deadly: 3600,
    },
    12: {
        easy: 1000,
        medium: 2000,
        hard: 3000,
        deadly: 4500,
    },
    13: {
        easy: 1100,
        medium: 2200,
        hard: 3400,
        deadly: 5100,
    },
    14: {
        easy: 1250,
        medium: 2500,
        hard: 3800,
        deadly: 5700,
    },
    15: {
        easy: 1400,
        medium: 2800,
        hard: 4300,
        deadly: 6400,
    },
    16: {
        easy: 1600,
        medium: 3200,
        hard: 4800,
        deadly: 7200,
    },
    17: {
        easy: 2000,
        medium: 3900,
        hard: 5900,
        deadly: 88000,
    },
    18: {
        easy: 2100,
        medium: 4200,
        hard: 6300,
        deadly: 9500,
    },
    19: {
        easy: 2400,
        medium: 4900,
        hard: 7300,
        deadly: 10900,
    },
    20: {
        easy: 2800,
        medium: 5700,
        hard: 8500,
        deadly: 12700,
    },
}

// all the total score multipliers
const multipliers = [1, 1.5, 2, 2.5, 3, 4];

// index of `multipliers` keyed by number of enemies
const numberOfEnemiesMultiplierIndex = {
    1: 0,
    2: 1,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 3,
    10: 3,
    11: 4,
    12: 4,
    13: 4,
    14: 4,
    15: 5
}

export default {
  name: "dnd5e-encounter-summary",
  props: ["selectedactors", "partyinfo", "encountersettings", "system"],
  computed: {
    totalScoreClass() {
      let difference = Math.abs(this.adjustedEncounterScore - this.maxEncounterScore);
      if (difference == 0) return "perfect";
      if (difference < this.adjustedEncounterScore * 0.1) return "close";
      if (difference < this.adjustedEncounterScore * 0.2) return "straying";
      if (difference < this.adjustedEncounterScore * 0.3) return "faraway";
      return "distant";
    },
    adjustedEncounterScore() {
      const totalScore = this.totalEncounterScore;

      // constrain number of enemies between 1 and 15
      const numberOfEnemiesForMultiplier = Math.min(Math.max(this.selectedactors.length, 1), 15);
      const normalMultiplierIndex = numberOfEnemiesMultiplierIndex[numberOfEnemiesForMultiplier];

      // how much we adjust the multiplier index by
      const partySizeAdjuster = (this.partyinfo.numberOfPartyMembers < 3) ? -1 : (this.partyinfo.numberOfPartyMembers > 5) ? 1 : 0;
      const partySizeAdjustedMultiplier = Math.min(Math.max(normalMultiplierIndex + partySizeAdjuster, 0), multipliers.length - 1);

      // the total score multiplier
      const multiplier = multipliers[partySizeAdjustedMultiplier]

      return totalScore = totalScore * multiplier;
    },
    totalEncounterScore() {
      let totalScore = 0;
      for (let x = 0; x < this.selectedactors.length; x++) {
        let actor = this.selectedactors[x];
        let score = this.system.getEncounterScore(actor, this.partyinfo);
        if (score > 0) {
            totalScore += score;
        }
      }
      return totalScore;
    },
    maxEncounterScore() {
      const selectedThreat = this.encountersettings.selectedThreat?.toLowerCase() ?? 'medium';

      return xpThresholdsByLevel[this.partyinfo.averagePartyLevel]?.[selectedThreat] * this.partyinfo.numberOfPartyMembers;
    },
    threatLevels() {
      const { numberOfPartyMembers, averagePartyLevel } = this.partyinfo;
      const easy =
        numberOfPartyMembers * xpThresholdsByLevel[averagePartyLevel]?.easy;
      const medium =
        numberOfPartyMembers * xpThresholdsByLevel[averagePartyLevel]?.medium;
      const hard =
        numberOfPartyMembers * xpThresholdsByLevel[averagePartyLevel]?.hard;
      const deadly =
        numberOfPartyMembers * xpThresholdsByLevel[averagePartyLevel]?.deadly;

      const threatValues = {
        easy,
        medium,
        hard,
        deadly
      }

      const currentThreatValue = Object.values(threatValues).reduce(
        (prevValue, currentValue) => {
          const evaluated = this.adjustedEncounterScore - currentValue;

          // 0 means this is an exact match
          if (evaluated === 0) {
            return currentValue;
          }

          // negative sign means we went too far, use 'prev'
          if (Math.sign(evaluated) < 0) {
            return prevValue;
          }

          // positive sign means this might be closest, move on to next
          if (Math.sign(evaluated) > 0) {
            return currentValue;
          }
        }
      );

      return {
        easy: { label: "Easy", value: easy, active: currentThreatValue === easy },
        medium: { label: "Medium", value: medium, active: currentThreatValue === medium },
        hard: { label: "Hard", value: hard, active: currentThreatValue === hard },
        deadly: { label: "Deadly", value: deadly, active: currentThreatValue === deadly },
      };
    },
    // threatLevel() {
    //   return Object.values(this.threatLevels).reduce(
    //     (prevThreshold, currentThreshold) => {
    //       const evaluated = this.adjustedEncounterScore - currentThreshold.value;

    //       // 0 means this is an exact match
    //       if (evaluated === 0) {
    //         return currentThreshold;
    //       }

    //       // negative sign means we went too far, use 'prev'
    //       if (Math.sign(evaluated) < 0) {
    //         return prevThreshold;
    //       }

    //       // positive sign means this might be closest, move on to next
    //       if (Math.sign(evaluated) > 0) {
    //         return currentThreshold;
    //       }
    //     }
    //   );
    // },
  },
}
</script>