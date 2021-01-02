<template>
  <div class="encounter-builder">
    <header class="encounter-info">
      <h1><input type="text" placeholder="encounter name" value="Encounter Name"></h1>
    </header>
    <section class="encounter-details">
      <h2>Encounter Settings</h2>
      <div class="encounterSettings">
        <h4>Tier</h4>
        <v-select v-model="selectedChallenge" :options="['Normal', 'Double Strength', 'Killer']"></v-select>
        <h4>Average Party Level</h4>
        <vue-numeric-input v-model="averagePartyLevel" :min="1" ></vue-numeric-input>
        <h4>Number of Party Members</h4>
        <vue-numeric-input v-model="numberOfPartyMembers" :min="1" ></vue-numeric-input>
      </div>
      <h2>Enemies</h2>
      <div class="encounter-actors">
        <!-- <ul class="encounter-members">
          <li class="member" v-for="t of selectedActors" :key="t._id" v-on:click.right="removeActor(t)">[{{t.data.data.details.level.value}}] {{t.data.name}} - {{getEncounterScore(t)}}</li>
        </ul> -->
        <ul class="encounter-members">
          <li class="member" v-for="t of groupedSelectedActors" :key="t[0]" v-on:click="addActor(t[1][0])" v-on:click.right="removeActor(t[1][0])">
            <img :src="t[1][0].data.img" width="50" height="50" />
            <div class="member-details">
              <b>{{t[0]}}</b>
              <div>Level {{t[1][0].data.data.details.level.value}} {{t[1][0].data.data.details.role.value}}</div>
              <div><b>{{t[1].length}}</b> x {{t[1][0].encounterScore.toFixed(2)}} = {{(t[1][0].encounterScore * t[1].length).toFixed(2)}} ES</div>
            </div>
          </li>
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
            <div class="level-histogram">
              <h2>Level</h2>
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
              <li class="actor-listing" v-for="t of availableActors" :key="t._id" v-on:click="addActor(t)" v-on:click.right="removeActor(t)" :disabled="t.encounterScore <= 0">
                <img :src="t.data.img" width="100" height="100" />
                <section class="actor-info">
                  <h4 class="name"><span v-if="t.data.data.details?.level?.value">[{{t.data.data.details.level.value}}]</span> {{t.data.name}}</h4>
                  <ul class="traits">
                    <li class="size" v-if="t.data.data.details?.size?.value != undefined">
                      <label class="trait-label">Size</label>
                      <span class="trait-value">{{t.data.data.details.size.value}}</span>
                    </li>
                    <li class="role" v-if="t.data.data.details?.role?.value != undefined">
                      <label class="trait-label">Role</label>
                      <span class="trait-value">{{t.data.data.details.role.value}}</span>
                    </li>
                    <li class="type" v-if="t.data.data.details?.type?.value != undefined">
                      <label class="trait-label">Type</label>
                      <span class="trait-value">{{t.data.data.details.type.value}}</span>
                    </li>
                    <li class="score"  v-if="t.encounterScore > 0">
                      <label class="trait-label">Encounter Score</label>
                      <span class="trait-value">{{t.encounterScore}}</span>
                    </li>
                    <li class="source">
                      <span class="trait-value"><i>{{getActorSource(t)}}</i></span>
                    </li>
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
    selectedName: "",
    selectedSources: [],
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
    levelHasBeenSelected: false,
    loading: true,
    selectedChallenge: "Standard",
    sortLevelAsc: true,
    sortNameAsc: undefined,
    sources: []
  }),
  methods: {
    addActor: function (actor) {
      if (this.getEncounterScore(actor) > 0) {
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
        let role = 'troop';
        if (actor.data.data != undefined && actor.data.data.details != undefined && actor.data.data.details.role != undefined) {
          role = actor.data.data.details.role.value.toLowerCase();
        }

        let encounterTier = "adventurer";
        if (this.averagePartyLevel >= 5) {
          encounterTier = "champion";
        }
        if (this.averagePartyLevel >= 8) {
          encounterTier = "epic";
        }

        if (role == "mook") {
            return this.getMookEncounterScore(encounterTier, this.averagePartyLevel, actor);
        }
        else {
            return this.getNormalEncounterScore(encounterTier, this.averagePartyLevel, actor);
        }
      }
      catch (error) {
        console.error(error);
        return -30;
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

      let size = 'normal';
      if (enemy.data.data != undefined && enemy.data.data.details != undefined && enemy.data.data.details.size != undefined) {
        size = enemy.data.data.details.size.value.toLowerCase();
      }
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 3,
         "2x": 3,
         "double-strength": 3,
         "huge": 4,
         "3x": 4,
         "triple-strength": 4
      };

      let enemyLevel = 1;
      if (enemy.data.data != undefined && enemy.data.data.details != undefined && enemy.data.data.details.level != undefined) {
        enemyLevel = enemy.data.data.details.level.value;
      }
      let levelDifference = enemyLevel - averageLevel;
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
    getMookEncounterScore: function (tier, averageLevel, enemy) {
      let scoreChart = [
        [0.05, 0.10, 0.20, 0.30],
        [.075, 0.15, 0.30, 0.45],
        [0.10, 0.20, 0.40, 0.60], // Same level
        [0.15, 0.30, 0.60, 0.90],
        [0.20, 0.40, 0.80, 1.20],
        [0.30, 0.60, 1.20, 1.80],
        [0.40, 0.80, 1.60, 2.40]
      ];

      let size = 'normal';
      if (enemy.data.data != undefined && enemy.data.data.details != undefined && enemy.data.data.details.size != undefined) {
        size = enemy.data.data.details.size.value.toLowerCase();
      }
      let sizeToColumn = {
         "weakling": 0,
         "normal": 1,
         "elite": 2,
         "large": 2,
         "double-strength": 2,
         "huge": 3,
         "triple-strength": 3
      };

      let enemyLevel = 1;
      if (enemy.data.data != undefined && enemy.data.data.details != undefined && enemy.data.data.details.level != undefined) {
        enemyLevel = enemy.data.data.details.level.value;
      }
      let levelDifference = enemyLevel - averageLevel;
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
    sliderFinished: function (values) {
      this.levelHasBeenSelected = true;
      this.minSelectedLevel = values.from;
      this.maxSelectedLevel = values.to;
    },
    getActorSource: function (actor) {
      //console.log(actor.name);
      let nonCompendiumSourceType = game.settings.get("vue-encounter-builder", "nonCompendiumSourceType");
      let source = game.world.title;

      if (nonCompendiumSourceType == "folderName") {
        if (actor.folder != undefined) {
          source = actor.folder.name;
        }
      }

      if (actor.compendium != undefined && actor.compendium.metadata != undefined) source = actor.compendium.metadata.label;
      return source;
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
    },
    getSafeLevel: function (actor) {
      if (actor.data.data != undefined && actor.data.data.details != undefined && actor.data.data.details.level != undefined) {
        return actor.data.data.details.level.value;
      }
      return 0;
    },
    filterAvailableActors(availableActors) {
      if (this.selectedSources.length > 0) {
        availableActors = availableActors.filter(x => this.selectedSources.includes(this.getActorSource(x).toLowerCase()));
      }
      if (this.selectedName != "") {
        availableActors = availableActors.filter(x => x.data.name.toLowerCase().includes(this.selectedName.toLowerCase()));
      }
      if (this.selectedSizes.length > 0)
      {      
          availableActors = availableActors.filter(x => { 
            if (x.data.data != undefined && x.data.data.details != undefined && x.data.data.details.size != undefined) {
              return this.selectedSizes.includes(x.data.data.details.size.value);
            }
            return false;
          });
      }
      if (this.selectedRoles.length > 0)
      {
        availableActors = availableActors.filter(x => { 
            if (x.data.data != undefined && x.data.data.details != undefined && x.data.data.details.role != undefined) {
              return this.selectedRoles.includes(x.data.data.details.role.value);
            }
            return false;
          });
      }
      if (this.selectedTypes.length > 0) {
        availableActors = availableActors.filter(x => { 
            if (x.data.data != undefined && x.data.data.details != undefined && x.data.data.details.type != undefined) {
              return this.selectedTypes.includes(x.data.data.details.type.value);
            }
            return false;
          });
      }

      return availableActors;
    }
  },
  computed: {
    totalEncounterScore() {
      let totalScore = 0;
      for (let x = 0; x < this.selectedActors.length; x++) {
        let actor = this.selectedActors[x];
        totalScore += this.getEncounterScore(actor);
      }
      return totalScore;
    },
    maxEncounterScore() {
      let max = this.numberOfPartyMembers;
      if (this.selectedChallenge.toLowerCase() == "double strength") {
        max *= 2;
      }
      else if (this.selectedChallenge.toLowerCase() == "killer") {
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

      availableActors = this.filterAvailableActors(availableActors);

      availableActors = availableActors.filter(x => {     
          let level = this.getSafeLevel(x);
          return level >= this.minSelectedLevel && level <= this.maxSelectedLevel; 
      });

      if (this.sortLevelAsc != undefined) {
        if (this.sortLevelAsc) {
          availableActors.sort((a, b) => (this.getSafeLevel(a) > this.getSafeLevel(b)) ? 1 : -1);
        }
        else {
          availableActors.sort((a, b) => (this.getSafeLevel(a) < this.getSafeLevel(b)) ? 1 : -1);
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
      availableActors = this.filterAvailableActors(availableActors);

      for (let x = 0; x < availableActors.length; x++) {
        let actor = availableActors[x];
        let level = actor.data.data.details.level.value;

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
          case "adventurer": { this.minSelectedLevel = this.averagePartyLevel - 2; this.maxSelectedLevel = this.averagePartyLevel + 4; } break;
          case "champion": { this.minSelectedLevel = this.averagePartyLevel - 1; this.maxSelectedLevel = this.averagePartyLevel + 5; } break;
          case "epic": { this.minSelectedLevel = this.averagePartyLevel; this.maxSelectedLevel = this.averagePartyLevel + 6; } break;
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
        this.numberOfPartyMembers = characters.length;
        for (let index = 0; index < this.numberOfPartyMembers; index++) {
            this.averagePartyLevel += characters[index].data.data.details.level.value;
        }
        this.averagePartyLevel = Math.round(this.averagePartyLevel / this.numberOfPartyMembers);
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
      let level = this.getSafeLevel(actor);

      if (level > this.maximumLevel) this.maximumLevel = level;
      if (level < this.minimumLevel) this.minimumLevel = level;
      this.sources.push(this.getActorSource(actor));
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    this.sources = this.sources.filter(onlyUnique);

    this.minSelectedLevel = this.averagePartyLevel - 2;
    if (this.minSelectedLevel < this.minimumLevel) this.minSelectedLevel = this.minimumLevel;

    this.maxSelectedLevel = this.averagePartyLevel + 4;
    if (this.maxSelectedLevel > this.maximumLevel) this.maximumLevel = this.maximumLevel;

    //console.log(allActors);
    this.actors = allActors;
    this.loading = false;
  },
};
</script>
