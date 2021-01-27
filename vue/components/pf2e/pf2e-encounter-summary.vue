<template>
    <div>
        <h4>Total XP: <span :class="totalScoreClass">{{totalEncounterScore}} of {{maxEncounterScore}}</span></h4>
    </div>
</template>
<script>
export default {
  name: "pf2e-encounter-summary",
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

      if (this.encountersettings.selectedThreat == undefined) this.encountersettings.selectedThreat = "Moderate";

      switch (this.encountersettings.selectedThreat.toLowerCase()) {
        case "trivial": budget = 40; perCharacterAdjustment = 10; break;
        case "low": budget = 60; perCharacterAdjustment = 15; break;
        case "moderate": budget = 80; perCharacterAdjustment = 20; break;
        case "severe": budget = 120; perCharacterAdjustment = 30; break;
        case "extreme": budget = 160; perCharacterAdjustment = 40; break;
      }

      let numOfCharactersOver4 = this.partyinfo.numberOfPartyMembers - 4;
      //if (numOfCharactersOver4 < 0) numOfCharactersOver4 = 0;

      return budget + (perCharacterAdjustment * numOfCharactersOver4);
    },
  },
}
</script>
