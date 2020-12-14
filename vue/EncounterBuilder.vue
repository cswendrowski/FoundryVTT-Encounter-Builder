<template>
  <div class="encounter-builder">
    <header class="encounter-info">
      <h1>Encounter Name</h1>
    </header>
    <section class="encounter-details">
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
        <ul class="encounter-members">
          <li class="member" v-for="t of selectedActors" :key="t._id" v-on:click.right="removeActor(t)">[{{t.data.data.details.level.value}}] {{t.data.name}} - {{getEncounterScore(selectedTier, averagePartyLevel, t)}}</li>
        </ul>
        <h4>Total Encounter Score: {{totalEncounterScore}} of {{numberOfPartyMembers}}</h4>
      </div>
    </section>
    <section class="search-area">
      <header class="search-configuration">
        <h2>Filters</h2>
        <div class="filters">
          <h4>Size</h4>
          <v-select multiple v-model="selectedSizes" :options="['Weakling', 'Normal', 'Elite', 'Large', 'Double-Strength', 'Triple-Strength']" :reduce="x => x.toLowerCase()"></v-select>
          <h4>Role</h4>
          <v-select multiple v-model="selectedRoles" :options="['Archer', 'Blocker', 'Caster', 'Leader', 'Mook', 'Spoiler', 'Troop', 'Wrecker']" :reduce="x => x.toLowerCase()"></v-select>
          <h4>Type</h4>
          <v-select multiple v-model="selectedTypes" :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Demon', 'Devil', 'Dragon', 'Elemental', 'Fey', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']" :reduce="x => x.toLowerCase()"></v-select>
        </div>
        <h2>Sortings</h2>
        <div class="sortings">
            <h4>Level</h4>
            <button v-bind:class="{ active: sortLevelAsc }" v-on:click="setSortLevelAsc(true)">
                <i class="btn btn-primary fas fa-sort-up"></i>
            </button>
            <button v-bind:class="{ active: sortLevelAsc != undefined && !sortLevelAsc }" v-on:click="setSortLevelAsc(false)">
                <i class="btn btn-primary fas fa-sort-down"></i>
            </button>
            <h4>Name</h4>
            <button v-bind:class="{ active: sortNameAsc }" v-on:click="setSortNameAsc(true)">
                <i class="btn btn-primary fas fa-sort-up"></i>
            </button>
            <button v-bind:class="{ active: sortNameAsc != undefined && !sortNameAsc }" v-on:click="setSortNameAsc(false)">
                <i class="btn btn-primary fas fa-sort-down"></i>
            </button>
      </header>
      <section class="search-results">
        <div v-if="loading" class="loading-container">
          <pencil></pencil>
        </div>
        <div v-else>
            <h3>Level</h3>
            <histogramslider ref="levelHistogram" 
                :data="levelData" 
                :min="0" :max="15"
                primary-color="#78110A"
                holder-color="#F4F3EA"
                handle-color="#B9A660"
                label-color="#2B0603"
                grid-text-color="#2B0603"
                :key="levelData.length" 
                @finish="sliderFinished">
            </histogramslider>
            <ul class="result-list">
              <li class="actor-listing" v-for="t of availableActors" :key="t._id" v-on:click="addActor(t)">
                <img :src="t.data.img" width="100" height="100" />
                <section class="actor-info">
                  <h4 class="name"><span v-if="t.data.data.details?.level?.value">[{{t.data.data.details.level.value}}]</span> {{t.data.name}}</h4>
                  <ul class="traits">
                    <li class="size" v-if="t.data.data.details?.size?.value != undefined">Size - {{t.data.data.details.size.value}}</li>
                    <li class="role" v-if="t.data.data.details?.role?.value != undefined">Role - {{t.data.data.details.role.value}}</li>
                    <li class="type" v-if="t.data.data.details?.type?.value != undefined">Type - {{t.data.data.details.type.value}}</li>
                  </ul>
                </section>
              </li>
            </ul>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
export default {
  data: () => ({
    colors: [ "#78110A", "#AE8C13", "#B9A660" ],
    actors: [],
    selectedActors: [],
    selectedSizes: [],
    selectedRoles: [],
    selectedTypes: [],
    averagePartyLevel: 4,
    numberOfPartyMembers: 4,
    minimumLevel: 100,
    maximumLevel: 0,
    minSelectedLevel: 0,
    maxSelectedLevel: 100,
    loading: true,
    selectedTier: "Adventurer",
    sortLevelAsc: true,
    sortNameAsc: undefined
  }),
  methods: {
    addActor: function (actor) {
      this.selectedActors.push(actor);
    },
    removeActor: function (actor) {
      var index = this.selectedActors.indexOf(actor);
      this.selectedActors.splice(index, 1);
    },
    setSortLevelAsc: function (value) {
        this.sortLevelAsc = value;
        this.sortNameAsc = undefined;
    },
    setSortNameAsc: function (value) {
        this.sortLevelAsc = undefined;
        this.sortNameAsc = value;
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
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 3,
         "double-strength": 3,
         "huge": 4,
         "triple-strength": 4
      };

      let levelDifference = enemy.data.data.details.level.value - averageLevel;
      if (tier == "champion") {
        levelDifference--;
      }
      else if (tier == "epic") {
        levelDifference -= 2;
      }
      levelDifference += 2;

      if (levelDifference < 0) {
        console.log("Enemy too weak!");
        return -20;
      }
      else if (levelDifference > 6) {
        console.log("Enemy too strong!");
        return -10;
      }
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
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 2,
         "double-strength": 2,
         "huge": 3,
         "triple-strength": 3
      };

      let levelDifference = enemy.data.data.details.level.value - averageLevel;
      if (tier == "champion") {
        levelDifference--;
      }
      else if (tier == "epic") {
        levelDifference -= 2;
      }
      levelDifference += 2;

      if (levelDifference < 0) {
        console.log("Enemy too weak!");
        return -20;
      }
      else if (levelDifference > 6) {
        console.log("Enemy too strong!");
        return -10;
      }
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

      if (this.sortLevelAsc != undefined) {
          if (this.sortLevelAsc) {
            availableActors.sort((a, b) => (a.data.data.details.level.value > b.data.data.details.level.value) ? 1 : -1);
          }
          else {
            availableActors.sort((a, b) => (a.data.data.details.level.value < b.data.data.details.level.value) ? 1 : -1);
          }
      }

      if (this.sortNameAsc != undefined) {
          if (this.sortNameAsc) {
            availableActors.sort((a, b) => (a.data.name > b.data.name) ? 1 : -1);
          }
          else {
            availableActors.sort((a, b) => (a.data.name < b.data.name) ? 1 : -1);
          }
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
    if (characters.length > 0) {
        this.numberOfPartyMembers = characters.length;
        for (let index = 0; index < this.numberOfPartyMembers; index++) {
            this.averagePartyLevel += characters[index].data.data.details.level.value;
        }
        this.averagePartyLevel = Math.round(this.averagePartyLevel / this.numberOfPartyMembers);
    }

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

    this.minSelectedLevel = this.averagePartyLevel - 2;
    if (this.minSelectedLevel < this.minimumLevel) this.minSelectedLevel = this.minimumLevel;

    this.maxSelectedLevel = this.averagePartyLevel + 6;
    if (this.maxSelectedLevel > this.maximumLevel) this.maximumLevel = this.maximumLevel;

    //console.log(allActors);
    this.actors = allActors;
    this.loading = false;
  },
};
</script>
