<template>
  <div class="encounter-builder">
    <header class="encounter-info">
      <!-- <h1><input type="text" placeholder="encounter name" value="Encounter Name"></h1> -->
      <h1>Encounter</h1>
    </header>
    <section class="encounter-details">
      <h2>Encounter Settings</h2>
      <div class="encounterSettings">
        <h4>Average Party Level</h4>
        <vue-numeric-input v-model="partyInfo.averagePartyLevel" :min="1" ></vue-numeric-input>
        <h4>Number of Party Members</h4>
        <vue-numeric-input v-model="partyInfo.numberOfPartyMembers" :min="1" ></vue-numeric-input>
        <component v-bind:is="encounterSettingsComponent" v-model="encounterSettings"></component>
      </div>
      <h2>Enemies</h2>
      <div class="encounter-actors">
        <ul class="encounter-members">
          <component v-bind:is="selectedActorComponent" v-for="t of groupedSelectedActors" :key="t[0]" :group="t[0]" :actor="t[1][0]" :groupSize="t[1].length" v-on:click-left="addActor(t[1][0])" v-on:click-right="removeActor(t[1][0])"></component>
        </ul>
      </div>
      <h2>Summary</h2>
      <div class="encounter-results">
        <h4>Total Score: <span :class="totalScoreClass">{{totalEncounterScore.toFixed(2)}} of {{maxEncounterScore.toFixed(2)}}</span></h4>
        <button class="btn btn-primary" v-on:click="spawnOnScene()">Spawn on current Scene</button>
      </div>
    </section>
    <section class="search-area">
      <header class="search-configuration">
        <h2>Filters</h2>
        <div class="filters">
          <h4>Name</h4>
          <input type="text" placeholder="Name" v-model="selectedName" >
          <h4>Source</h4>
          <v-select multiple v-model="selectedSources" :options="sources" :reduce="x => x.toLowerCase()"></v-select>
          <component v-bind:is="filtersComponent" v-model="filters"></component>
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
        </div>
      </header>
      <section class="search-results">
        <div v-if="loading" class="loading-container">
          <pencil></pencil>
        </div>
        <div v-else>
            <div class="level-histogram">
              <h2 v-on:click.right="console.log(event)">Level</h2>
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
            </div>
            <ul class="result-list">
              <component v-bind:is="actorComponent" v-model="encounterSettings" class="actor-listing" v-for="t of availableActors" :key="t._id" :actor="t" v-on:click-left="addActor(t)" v-on:click-right="removeActor(t)" :disabled="t.encounterScore <= 0"></component>
            </ul>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
export default {
  data: () => ({
    systemName: "thirteenth-age",
    system: window.dungeonMoon.thirteenthAge,

    colors: [ "#78110A", "#AE8C13", "#B9A660" ],

    actors: [],
    selectedActors: [],

    selectedName: "",

    sources: [],
    selectedSources: [],
    filters: {
      selectedSizes: [],
      selectedRoles: [],
      selectedTypes: [],
    },

    encounterSettings: {
      selectedChallenge: "Standard",
    },

    partyInfo: {
      averagePartyLevel: 4,
      numberOfPartyMembers: 4,
    },

    minimumLevel: 100,
    maximumLevel: 0,
    minSelectedLevel: 0,
    maxSelectedLevel: 100,
    levelHasBeenSelected: false,
    
    loading: true,

    sortLevelAsc: true,
    sortNameAsc: undefined,
  }),
  methods: {
    addActor: function (actor) {
      if (actor.encounterScore > 0) {
        let toPush = duplicate(actor);
        toPush.id = randomID(16);
        this.selectedActors.push(actor);
      }
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
    getEncounterScore: function (actor) {
      if (actor == undefined) return -30;
      //console.log(actor);
      try {
        return this.system.getEncounterScore(actor, this.partyInfo);
      }
      catch (error) {
        console.error(error);
        return -30;
      }
    },
    
    sliderFinished: function (values) {
      this.levelHasBeenSelected = true;
      this.minSelectedLevel = values.from;
      this.maxSelectedLevel = values.to;
    },
    spawnOnScene: async function() {
      let tokensToSpawn = [];
      let viewedScene = game.scenes.get(game.user.viewedScene);
      if (viewedScene == undefined) {
        ui.notifications.warn("No viewed scene to spawn into");
        return;
      }
      let baseX = viewedScene.data.width * viewedScene.data.padding;
      let baseY = viewedScene.data.height * viewedScene.data.padding;
      for (let x = 0; x < this.selectedActors.length; x++) {
        let actor = this.selectedActors[x];
        let token = duplicate(actor.data.token);
        token.x = baseX + (x * viewedScene.data.grid);
        token.y = baseY;
        tokensToSpawn.push(token);
      }
      console.log(tokensToSpawn);
      await Token.create(tokensToSpawn);
      ui.notifications.info(tokensToSpawn.length + " tokens spawned on " + viewedScene.name);
    }
  },
  computed: {
    actorComponent() {
      return this.systemName + "-actor";
    },
    filtersComponent() {
      return this.systemName + "-filters";
    },
    encounterSettingsComponent() {
      return this.systemName + "-encounter-settings";
    },
    selectedActorComponent() {
      return this.systemName + "-selected-actor";
    },
    totalEncounterScore() {
      let totalScore = 0;
      for (let x = 0; x < this.selectedActors.length; x++) {
        let actor = this.selectedActors[x];
        totalScore += this.getEncounterScore(actor);
      }
      return totalScore;
    },
    maxEncounterScore() {
      let max = this.partyInfo.numberOfPartyMembers;
      if (this.encounterSettings.selectedChallenge.toLowerCase() == "double strength") {
        max *= 2;
      }
      else if (this.encounterSettings.selectedChallenge.toLowerCase() == "killer") {
        max *= 3;
      }
      return max;
    },
    totalScoreClass() {
      let difference = Math.abs(this.totalEncounterScore - this.maxEncounterScore);
      if (difference == 0) return "perfect";
      if (difference < this.totalEncounterScore * 0.1) return "close";
      if (difference < this.totalEncounterScore * 0.2) return "straying";
      if (difference < this.totalEncounterScore * 0.3) return "faraway";
      return "distant";
    },
    availableActors() {
      let availableActors = this.actors;

      let filters = duplicate(this.filters);
      filters["selectedName"] = this.selectedName;
      filters["selectedSources"] = this.selectedSources;
      availableActors = this.system.filterAvailableActors(availableActors, filters);

      availableActors = availableActors.filter(x => {     
          let level = this.system.getSafeLevel(x);
          return level >= this.minSelectedLevel && level <= this.maxSelectedLevel; 
      });

      if (this.sortLevelAsc != undefined) {
        if (this.sortLevelAsc) {
          availableActors.sort((a, b) => (this.system.getSafeLevel(a) > this.system.getSafeLevel(b)) ? 1 : -1);
        }
        else {
          availableActors.sort((a, b) => (this.system.getSafeLevel(a) < this.system.getSafeLevel(b)) ? 1 : -1);
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

      for (let x = 0; x < availableActors.length; x++) {
        availableActors[x].encounterScore = this.getEncounterScore(availableActors[x]);
      }

      //console.log(availableActors);
      return availableActors;
    },
    levelData() {
      let levels = [];
      let availableActors = this.actors;
      
      // We don't  use this.availableActors because that filters by level, and we always want the histogram to be all levels available
      let filters = duplicate(this.filters);
      filters["selectedName"] = this.selectedName;
      filters["selectedSources"] = this.selectedSources;
      availableActors = this.system.filterAvailableActors(availableActors, filters);

      for (let x = 0; x < availableActors.length; x++) {
        let actor = availableActors[x];
        let level = this.system.getSafeLevel(actor);

        levels.push(level);
      }
      //console.log(levels);
      return levels;
    },
    groupedSelectedActors() {
      let grouped = {};
      //console.log("Grouping");
      for (let x = 0; x < this.selectedActors.length; x ++) {
        let selected = this.selectedActors[x];
        //console.log(selected);
        let name = selected.data.name;
        if (!(name in grouped)) {
          grouped[name] = [];
        }

        grouped[name].push(selected);
      }

      return Object.entries(grouped);
    }
  },
  watch: {
    availableActors() {
      // If our range changes and we rerender the component, reset the handles to the previous selections
      setTimeout(() => {
        let shouldReset = !this.levelHasBeenSelected;
        this.$refs.levelHistogram.update({ from: this.minSelectedLevel, to: this.maxSelectedLevel });
        if (shouldReset) {
          this.levelHasBeenSelected = false;
        }
      }, 100)
    },
    selectedTier() {
      if (!this.levelHasBeenSelected) {
        let tier = this.selectedTier.toLowerCase();
        switch (tier) {
          case "adventurer": { this.minSelectedLevel = this.partyInfo.averagePartyLevel - 2; this.maxSelectedLevel = this.partyInfo.averagePartyLevel + 4; } break;
          case "champion": { this.minSelectedLevel = this.partyInfo.averagePartyLevel - 1; this.maxSelectedLevel = this.partyInfo.averagePartyLevel + 5; } break;
          case "epic": { this.minSelectedLevel = this.partyInfo.averagePartyLevel; this.maxSelectedLevel = this.partyInfo.averagePartyLevel + 6; } break;
        }
        this.$refs.levelHistogram.update({ from: this.minSelectedLevel, to: this.maxSelectedLevel });
        this.levelHasBeenSelected = false;
      }
    }
  },
  async mounted() {
    //console.log("Mounted!");
    let characters = game.actors.entities.filter(x => x.hasPlayerOwner && x.data.type == "character");
    //console.log(characters);
    if (characters.length > 0) {
        this.partyInfo.numberOfPartyMembers = characters.length;
        for (let index = 0; index < this.partyInfo.numberOfPartyMembers; index++) {
            this.partyInfo.averagePartyLevel += this.system.getSafeLevel(characters[index]);
        }
        this.partyInfo.averagePartyLevel = Math.round(this.partyInfo.averagePartyLevel / this.partyInfo.numberOfPartyMembers);
    }

    let npcs = game.actors.entities.filter(x => x.data.type == "npc");
    let allActors = npcs;
    this.sources.push(game.world.title);
    let actorCompendiums = game.packs.filter(x => x.metadata.entity == "Actor");

    for (let index = 0; index < actorCompendiums.length; index++) {
      let pack = actorCompendiums[index];
      //console.log(pack);
      var packActors = await pack.getContent();
      //console.log(packActors);
      allActors = allActors.concat(packActors);
      this.sources.push(pack.metadata.label);
    }

    for (let x = 0; x < allActors.length; x++) {
      let actor = allActors[x];
      let level = this.system.getSafeLevel(actor);

      if (level > this.maximumLevel) this.maximumLevel = level;
      if (level < this.minimumLevel) this.minimumLevel = level;
      this.sources.push(this.system.getActorSource(actor));
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    this.sources = this.sources.filter(onlyUnique);

    this.minSelectedLevel = this.partyInfo.averagePartyLevel - 2;
    if (this.minSelectedLevel < this.minimumLevel) this.minSelectedLevel = this.minimumLevel;

    this.maxSelectedLevel = this.partyInfo.averagePartyLevel + 4;
    if (this.maxSelectedLevel > this.maximumLevel) this.maximumLevel = this.maximumLevel;

    //console.log(allActors);
    this.actors = allActors;
    this.loading = false;

    Hooks.on("deleteActor", (actor, meta, id) => {
      console.log("Handling delete for " + id);
      console.log(this.selectedActors);
      this.selectedActors = this.selectedActors.filter(x => x.id != actor.id);
      this.actors = this.actors.filter(x => x.id != actor.id);
    });
  },
};
</script>
