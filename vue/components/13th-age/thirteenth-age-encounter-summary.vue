<template>
    <div>
        <h4>Total Score: <span :class="totalScoreClass">{{totalEncounterScore.toFixed(2)}} of {{maxEncounterScore.toFixed(2)}}</span></h4>
    </div>
</template>
<script>
export default {
  name: "thirteenth-age-encounter-summary",
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
      let max = this.partyinfo.numberOfPartyMembers;
      if (this.encountersettings.selectedChallenge.toLowerCase() == "double strength") {
        max *= 2;
      }
      else if (this.encountersettings.selectedChallenge.toLowerCase() == "killer") {
        max *= 3;
      }
      return max;
    },
  },
}
</script>
