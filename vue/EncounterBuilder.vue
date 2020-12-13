<template>
  <div>
    <h1>Dungeon Moon</h1>
    <h2>Current Encounter</h2>
    <div class="encounterSettings">
      <h4>Tier</h4>
      <v-select v-model="selectedTier" :options="['Adventurer', 'Champion', 'Epic']"></v-select>
      <h4>Average Party Level</h4>
      <vue-numeric-input v-model="averagePartyLevel" :min="1" ></vue-numeric-input>
      <h4>Number of Party Members</h4>
      <vue-numeric-input v-model="numberOfPartyMembers" :min="1" ></vue-numeric-input>
    </div>
    <div>
      <ul>
        <li v-for="t of selectedActors" :key="t" v-on:click.right="removeActor(t)">[{{t.data.data.details.level.value}}] {{t.data.name}} - {{getEncounterScore(selectedTier, averagePartyLevel, t)}}</li>
      </ul>
      <h4>Total Encounter Score: {{totalEncounterScore}} of {{numberOfPartyMembers}}</h4>
    </div>
    <hr>
    <h2>Available Options</h2>
    <h3>Filters</h3>
    <div class="filters">
      <h4>Level</h4>
      <histogramslider ref="levelHistogram" :data="levelData" :min=0 :max=15 :step=1 :bar-height="100" :key="levelData.length" @finish="sliderFinished"></histogramslider>
      <h4>Size</h4>
      <v-select multiple v-model="selectedSizes" :options="['Weakling', 'Normal', 'Elite', 'Large', 'Double-Strength', 'Triple-Strength']" :reduce="x => x.toLowerCase()"></v-select>
      <h4>Role</h4>
      <v-select multiple v-model="selectedRoles" :options="['Archer', 'Blocker', 'Caster', 'Leader', 'Mook', 'Spoiler', 'Troop', 'Wrecker']" :reduce="x => x.toLowerCase()"></v-select>
      <h4>Type</h4>
      <v-select multiple v-model="selectedTypes" :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Demon', 'Devil', 'Dragon', 'Elemental', 'Fey', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']" :reduce="x => x.toLowerCase()"></v-select>
    </div>
    <hr>
    <h3>Results</h3>
    <div v-if="loading">
      <h3>Loading. . .</h3>
    </div>
    <div v-else>
        <div v-for="t of availableActors" :key="t" v-on:click="addActor(t)">
          <img :src="t.data.img" width="100" height="100" />
          <div>
            <h4><span v-if="t.data.data.details?.level?.value">[{{t.data.data.details.level.value}}]</span> {{t.data.name}}</h4>
            <p v-if="t.data.data.details?.size?.value != undefined">Size - {{t.data.data.details.size.value}}</p>
            <p v-if="t.data.data.details?.role?.value != undefined">Role - {{t.data.data.details.role.value}}</p>
            <p v-if="t.data.data.details?.type?.value != undefined">Type - {{t.data.data.details.type.value}}</p>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    actors: [],
    selectedActors: [],
    selectedSizes: [],
    selectedRoles: [],
    selectedTypes: [],
    averagePartyLevel: 0,
    numberOfPartyMembers: 0,
    minimumLevel: 100,
    maximumLevel: 0,
    minSelectedLevel: 0,
    maxSelectedLevel: 100,
    loading: true,
    selectedTier: "Adventurer"
  }),
  methods: {
    addActor: function (actor) {
      this.selectedActors.push(actor);
    },
    removeActor: function (actor) {
      var index = this.selectedActors.indexOf(actor);
      this.selectedActors.splice(index, 1);
    },
    getEncounterScore: function (tier, averageLevel, actor) {
      console.log(actor);
      let role = actor.data.data.details.role.value;
      tier = tier.toLowerCase();
      if (role == "mook") {
        return this.getMookEncounterScore(tier, averageLevel, actor);
      }
      else {
        return this.getNormalEncounterScore(tier, averageLevel, actor);
      }
    },
    getNormalEncounterScore: function (tier, averageLevel, enemy) {
      let scoreChart = [
        [0.25, 0.50, 0.75, 1.00, 1.50],
        [0.35, 0.70, 1.00, 1.50, 2.00],
        [0.50, 1.00, 1.50, 2.00, 3.00], // Same level
        [0.75, 1.50, 2.25, 3.00, 4.00],
        [1.00, 2.00, 3.00, 4.00, 6.00],
        [1.50, 3.00, 4.50, 5.00, 8.00],
        [2.00, 4.00, 6.00, 6.00, 10.00]
      ];

      let size = enemy.data.data.details.size.value;
      if (size) size = size.toLowerCase();
      console.log("Enemy Size: " + size);
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 3,
         "double-strength": 3,
         "huge": 4,
         "triple-strength": 4
      };

      console.log("Enemy level: " + enemy.data.data.details.level.value);
      console.log("Encounter Tier: " + tier);
      let levelDifference = enemy.data.data.details.level.value - averageLevel;
      console.log("Base Level difference: " + levelDifference);
      if (tier == "champion") {
        levelDifference--;
      }
      else if (tier == "epic") {
        levelDifference -= 2;
      }
      console.log("Level difference: " + levelDifference);
      levelDifference += 2;

      console.log("Enemy relative level row: " + levelDifference);
      if (levelDifference < 0) {
        console.log("Enemy too weak!");
        return -20;
      }
      else if (levelDifference > 6) {
        console.log("Enemy too strong!");
        return -10;
      }
      console.log("Enemy size column: " + sizeToColumn[size]);
      return scoreChart[levelDifference][sizeToColumn[size]];

    },
    getMookEncounterScore: function (tier, averageLevel, mook) {
      let scoreChart = [
        [0.05, 0.10, 0.20, 0.30],
        [.075, 0.15, 0.30, 0.45],
        [0.10, 0.20, 0.40, 0.60], // Same level
        [0.15, 0.30, 0.60, 0.90],
        [0.20, 0.40, 0.80, 1.20],
        [0.30, 0.60, 1.20, 1.80],
        [0.40, 0.80, 1.60, 2.40]
      ];

      let size = enemy.data.data.details.size.value;
      if (size) size = size.toLowerCase();
      console.log("Enemy Size: " + size);
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 2,
         "double-strength": 2,
         "huge": 3,
         "triple-strength": 3
      };

      console.log("Enemy level: " + enemy.data.data.details.level.value);
      console.log("Encounter Tier: " + tier);
      let levelDifference = enemy.data.data.details.level.value - averageLevel;
      console.log("Base Level difference: " + levelDifference);
      if (tier == "champion") {
        levelDifference--;
      }
      else if (tier == "epic") {
        levelDifference -= 2;
      }
      console.log("Level difference: " + levelDifference);
      levelDifference += 2;

      console.log("Enemy relative level row: " + levelDifference);
      if (levelDifference < 0) {
        console.log("Enemy too weak!");
        return -20;
      }
      else if (levelDifference > 6) {
        console.log("Enemy too strong!");
        return -10;
      }
      console.log("Enemy size column: " + sizeToColumn[size]);
      return scoreChart[levelDifference][sizeToColumn[size]];
    },
    sliderChanged: function (values) {
      console.log(values);
      this.minSelectedLevel = values.from;
      this.maxSelectedLevel = values.to;
    },
    sliderFinished: function (values) {
      this.minSelectedLevel = values.from;
      this.maxSelectedLevel = values.to;
    }
  },
  computed: {
    totalEncounterScore() {
      let totalScore = 0;
      for (let x = 0; x < this.selectedActors.length; x++) {
        let actor = this.selectedActors[x];
        totalScore += this.getEncounterScore(this.selectedTier, this.averagePartyLevel, actor);
      }
      return totalScore;
    },
    availableActors() {
      let availableActors = this.actors;

      availableActors = availableActors.filter(x => {
        let level = x.data.data.details.level.value;
        return level >= this.minSelectedLevel && level <= this.maxSelectedLevel;
      });
      
      if (this.selectedSizes.length > 0) {
        availableActors = availableActors.filter(x => this.selectedSizes.includes(x.data.data.details.size.value));
      }
      if (this.selectedRoles.length > 0) {
        availableActors = availableActors.filter(x => this.selectedRoles.includes(x.data.data.details.role.value));
      }
      if (this.selectedTypes.length > 0) {
        availableActors = availableActors.filter(x => this.selectedTypes.includes(x.data.data.details.type.value));
      }

      return availableActors;
    },
    levelData() {
      let levels = [];
      let availableActors = this.actors;
      
      // We don't  use this.availableActors because that filters by level, and we always want the histogram to be all levels available

      if (this.selectedSizes.length > 0) {
        availableActors = availableActors.filter(x => this.selectedSizes.includes(x.data.data.details.size.value));
      }
      if (this.selectedRoles.length > 0) {
        availableActors = availableActors.filter(x => this.selectedRoles.includes(x.data.data.details.role.value));
      }
      if (this.selectedTypes.length > 0) {
        availableActors = availableActors.filter(x => this.selectedTypes.includes(x.data.data.details.type.value));
      }

      for (let x = 0; x < availableActors.length; x++) {
        let actor = availableActors[x];
        let level = actor.data.data.details.level.value;

        levels.push(level);
      }
      //console.log(levels);
      return levels;
    }
  },
  watch: {
    availableActors() {
      // If our range changes and we rerender the component, reset the handles to the previous selections
      setTimeout(() => {
        this.$refs.levelHistogram.update({ from: this.minSelectedLevel, to: this.maxSelectedLevel });
      }, 100)
    }
  },
  async mounted() {
    //console.log("Mounted!");
    let characters = game.actors.entities.filter(x => x.hasPlayerOwner);
    console.log(characters);
    this.numberOfPartyMembers = characters.length;
    for (let index = 0; index < this.numberOfPartyMembers; index++) {
      this.averagePartyLevel += characters[index].data.data.details.level.value;
    }
    this.averagePartyLevel = Math.round(this.averagePartyLevel / this.numberOfPartyMembers);


    let npcs = game.actors.entities.filter(x => x.data.type == "npc");
    let allActors = npcs;
    let actorCompendiums = game.packs.filter(x => x.metadata.entity == "Actor");

    for (let index = 0; index < actorCompendiums.length; index++) {
      let pack = actorCompendiums[index];
      //console.log(pack);
      var packActors = await pack.getContent();
      //console.log(packActors);
      allActors = allActors.concat(packActors);
    }

    for (let x = 0; x < allActors.length; x++) {
      let actor = allActors[x];
      let level = actor.data.data.details.level.value;

      if (level > this.maximumLevel) this.maximumLevel = level;
      if (level < this.minimumLevel) this.minimumLevel = level;
    }

    this.levelRange = [ this.minimumLevel, this.maximumLevel ];
    this.minSelectedLevel = this.averagePartyLevel - 2;
    if (this.minSelectedLevel < this.minimumLevel) this.minSelectedLevel = this.minimumLevel;

    this.maxSelectedLevel = this.averagePartyLevel + 6;
    if (this.maxSelectedLevel > this.maximumLevel) this.maximumLevel = this.maximumLevel;

    //console.log(allActors);
    this.actors = allActors;
    this.loading = false;
    this.$forceUpdate();
  },
};
</script>
