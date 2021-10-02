<template>
    <div>
        <h4>Total XP: {{totalEncounterScore}}</h4>
        <h4>Adjusted XP: <span :class="totalScoreClass">{{adjustedEncounterScore}} of {{maxEncounterScore}}</span></h4>
        <!-- <h4>Threat Level: {{threatLevel}}</h4> -->
    </div>
</template>
<script>
export default {
  name: "dnd5e-encounter-summary",
  props: ["selectedactors", "partyinfo", "encountersettings", "system"],
  computed: {
    totalScoreClass() {
      let difference = Math.abs(this.totalEncounterScore - this.maxEncounterScore);
      if (difference == 0) return "perfect";
      if (difference < this.totalEncounterScore * 0.1) return "close";
      if (difference < this.totalEncounterScore * 0.2) return "straying";
      if (difference < this.totalEncounterScore * 0.3) return "faraway";
      return "distant";
    },
    adjustedEncounterScore() {
      const totalScore = this.totalEncounterScore;

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
      let budget = 40;
      let perCharacterAdjustment = 10;

      if (this.encountersettings.selectedThreat == undefined) this.encountersettings.selectedThreat = "Medium";

      switch (this.encountersettings.selectedThreat.toLowerCase()) {
        case "easy": budget = 40; perCharacterAdjustment = 10; break;
        case "medium": budget = 60; perCharacterAdjustment = 15; break;
        case "hard": budget = 80; perCharacterAdjustment = 20; break;
        case "deadly": budget = 120; perCharacterAdjustment = 30; break;
      }

      let numOfCharactersOver4 = this.partyinfo.numberOfPartyMembers - 4;
      //if (numOfCharactersOver4 < 0) numOfCharactersOver4 = 0;

      return budget + (perCharacterAdjustment * numOfCharactersOver4);
    },
  },
}
</script>