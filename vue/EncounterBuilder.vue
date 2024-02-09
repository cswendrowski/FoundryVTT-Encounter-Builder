<template>
  <div class="encounter-builder">
    <header class="encounter-info">
      <!-- <h1><input type="text" placeholder="encounter name" value="Encounter Name"></h1> -->
      <h1>Encounter</h1>
    </header>

    <section class="encounter-details">
      <h2>Encounter Settings</h2>

      <div class="encounterSettings">
        <label>Average Party Level</label>
        <vue-numeric-input
          v-model="partyInfo.averagePartyLevel"
          :min="1"
        ></vue-numeric-input>

        <label>Number of Party Members</label>
        <vue-numeric-input
          v-model="partyInfo.numberOfPartyMembers"
          :min="1"
        ></vue-numeric-input>

        <component
          v-bind:is="encounterSettingsComponent"
          v-model="encounterSettings"
        ></component>
      </div>

      <h2>Enemies</h2>

      <div class="encounter-actors">
        <ul class="encounter-members">
          <li
            v-for="t of groupedSelectedActors"
                        :key="system.getUniqueKey(t[1][0], partyInfo, encounterSettings)"
          >
            <component
              v-bind:is="selectedActorComponent"
              v-if="t[1][0].encounterScore > 0"
              :group="t[0]"
              :actor="t[1][0]"
              :groupSize="t[1].length"
              :system="system"
              v-on:add-actor="addActor(t[1][0])"
              v-on:remove-actor="removeActor(t[1][0])"
              v-on:actor-info="openActorSheet(t[1][0])"
            ></component>
          </li>
        </ul>
      </div>

      <h2>Summary</h2>

      <div class="encounter-results">
        <component
          v-bind:is="encounterSummaryComponent"
          :system="system"
          :selectedactors="selectedActors"
          :partyinfo="partyInfo"
          :encountersettings="encounterSettings"
        >
        </component>
        <button class="btn btn-primary" v-if="warpgateEnabled" v-on:click="warpOnScene()">
          Warp on current Scene
        </button>
      </div>
    </section>

    <aside class="search-configuration">
      <h2>Filters</h2>
      <div class="filters-grid">
        
        <div>
          <label>Name</label>
          <input type="text" placeholder="Name" v-model="selectedName" />
        </div>

        <div>
          <label>Source</label>
          <v-select
            multiple
            v-model="selectedSources"
            :options="sources"
            :reduce="(x) => x.toLowerCase()"
          ></v-select>
        </div>

        <component v-bind:is="filtersComponent" v-model="filters"></component>
      </div>

      <h2>Sort</h2>
      <div class="sortings">
        <div class="sort-group">
          <h4>{{ levelName }}</h4>
          <div class="toggle-button-group">
            <button
            class="toggle-button"
              v-bind:class="{ active: sortLevelAsc }"
              v-on:click="setSortLevelAsc(true)"
            >
              <i class="fas fa-sort-numeric-down"></i>
            </button>
            <button
            class="toggle-button"
              v-bind:class="{
                active: sortLevelAsc != undefined && !sortLevelAsc,
              }"
              v-on:click="setSortLevelAsc(false)"
            >
              <i class="fas fa-sort-numeric-up"></i>
            </button>
          </div>
        </div>

        <div class="sort-group">
          <h4>Name</h4>
          <div class="toggle-button-group">
            <button
              class="toggle-button"
              v-bind:class="{ active: sortNameAsc }"
              v-on:click="setSortNameAsc(true)"
            >
              <i class="fas fa-sort-alpha-down"></i>
            </button>
            <button
              class="toggle-button"
              v-bind:class="{ active: sortNameAsc != undefined && !sortNameAsc }"
              v-on:click="setSortNameAsc(false)"
            >
              <i class="fas fa-sort-alpha-up"></i>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div v-if="loading" class="loading-container">
      <pencil></pencil>
    </div>

    <div class="level-histogram" v-if="!loading">
      <h2>{{ levelName }}</h2>
      <histogramslider
        ref="levelHistogram"
        :data="levelData"
        :min="minimumLevel"
        :max="maximumLevel"
        :step="step"
        :prettify="prettify"
        :primary-color="colors.primary"
        :holder-color="colors.holder"
        :handle-color="colors.handle"
        :label-color="colors.label"
        :grid-text-color="colors.gridText"
        :key="levelData.length"
        @finish="sliderFinished"
      >
      </histogramslider>
    </div>

    <div class="results" v-if="!loading">
      <ul class="result-list">
        <component
          v-bind:is="actorComponent"
          v-model="encounterSettings"
          v-for="t of availableActors"
                        :key="system.getUniqueKey(t, partyInfo, encounterSettings)"
          :actor="t"
          :system="system"
          v-on:add-actor="addActor(t)"
          v-on:remove-actor="removeActor(t)"
          v-on:actor-info="openActorSheet(t)"
          :disabled="t.encounterScore <= 0"
        ></component>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  data: () => ({
    systemName: "",
    system: undefined,

    colors: {
      primary: "#78110A",
      holder: "#F4F3EA",
      handle: "#B9A660",
      label: "#2B0603",
      gridText: "#2B0603"
    },

    actors: [],
    selectedActors: [],

    selectedName: "",

    sources: [],
    selectedSources: [],
    filters: {
    },

    encounterSettings: {
    },

    partyInfo: {
      averagePartyLevel: 4,
      numberOfPartyMembers: 4,
      partyCharacterInfo: [],
    },

    levelName: "Level",

    step: 1,
    minimumLevel: 100,
    maximumLevel: 0,
    minSelectedLevel: 0,
    maxSelectedLevel: 100,
    levelHasBeenSelected: false,

    loading: true,

    sortLevelAsc: true,
    sortNameAsc: undefined,

    warpgateEnabled: game.modules.get("warpgate")?.active
  }),
  methods: {
    prettify: function(level) {
      return this.system.histogramLabelPrettify(level);
    },
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
    openActorSheet: function(actor) {
      actor.sheet.render(true);
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
      //this.log(false, actor);
      try {
        return this.system.getEncounterScore(actor, this.partyInfo);
      } catch (error) {
        console.error(error);
        return -30;
      }
    },

    sliderFinished: function (values) {
      this.levelHasBeenSelected = true;
      this.minSelectedLevel = values.from;
      this.maxSelectedLevel = values.to;
    },
    warpOnScene: async function () {
      let tokensToWarp = {};
      let viewedScene = game.scenes.get(game.user.viewedScene);
      if (viewedScene == undefined) {
        ui.notifications.warn("No viewed scene to spawn into");
        return;
      }
      let total = 0;

      for (let x = 0; x < this.selectedActors.length; x++) {
        let actor = this.selectedActors[x];
        if (actor.source && !game.actors.get(actor.id)) {
          const actorData = foundry.utils.duplicate(actor);
          this.log(false, actorData);
          actor = await Actor.create(actorData, {keepId: true});
        }
        if (Object.keys(tokensToWarp).includes(actor.name)) {
          tokensToWarp[actor.name]++;
        }
        else {
          tokensToWarp[actor.name] = 1;
        }
        total++;
      }
      this.log(false, tokensToWarp);

      for (let name in tokensToWarp) {
        await warpgate.spawn(name, {}, {}, {duplicates: tokensToWarp[name]});
      }

      ui.notifications.info(
          total + " tokens spawned on " + viewedScene.name
      );
    },
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
    encounterSummaryComponent() {
      return this.systemName + "-encounter-summary";
    },

    availableActors() {
      let availableActors = this.actors;

      let filters = duplicate(this.filters);
      filters["selectedName"] = this.selectedName;
      filters["selectedSources"] = this.selectedSources;

      for (let x = 0; x < availableActors.length; x++) {
        let actor = availableActors[x];
        availableActors[x].encounterScore = this.getEncounterScore(actor);
        availableActors[x].source = this.system.getActorSource(actor);
      }

      if (this.system != undefined) {
        availableActors = this.system.filterAvailableActors(
          availableActors,
          filters
        );
      }

      // availableActors = availableActors.filter((x) => {
      //   let level = this.system.getSafeLevel(x);
      //   return level >= this.minSelectedLevel && level <= this.maxSelectedLevel;
      // });


      availableActors = availableActors.filter((x) => {
        let level = this.system.getSafeLevel(x);
        return level >= this.minSelectedLevel && level <= this.maxSelectedLevel;
      }).sort(
        (a, b) => {
          const aLevel = this.system.getSafeLevel(a);
          const bLevel = this.system.getSafeLevel(b);
          const aName = a.name;
          const bName = b.name;

          switch (true) {
            // if both levels are the same, sort by name
            case (this.sortLevelAsc != undefined && aLevel === bLevel): {
              return aName.localeCompare(bName);
            }
            case (this.sortLevelAsc != undefined && this.sortLevelAsc): {
              return aLevel - bLevel;
            }
            case (this.sortLevelAsc != undefined && !this.sortLevelAsc): {
              return bLevel - aLevel;
            }
            case (this.sortNameAsc != undefined && this.sortNameAsc): {
              return aName.localeCompare(bName);
            }
            default: {
              return bName.localeCompare(aName);
            }
          }
        }
      );


      // if (this.sortLevelAsc != undefined) {
      //   if (this.sortLevelAsc) {
      //     availableActors.sort((a, b) =>
      //       this.system.getSafeLevel(a) > this.system.getSafeLevel(b) ? 1 : -1
      //     );
      //   } else {
      //     availableActors.sort((a, b) =>
      //       this.system.getSafeLevel(a) < this.system.getSafeLevel(b) ? 1 : -1
      //     );
      //   }
      // }

      // if (this.sortNameAsc != undefined) {
      //   if (this.sortNameAsc) {
      //     availableActors.sort((a, b) => (a.name > b.name ? 1 : -1));
      //   } else {
      //     availableActors.sort((a, b) => (a.name < b.name ? 1 : -1));
      //   }
      // }

      //this.log(false, availableActors);
      return availableActors;
    },
    levelData() {
      let levels = [];
      let availableActors = this.actors;

      // We don't  use this.availableActors because that filters by level, and we always want the histogram to be all levels available
      let filters = duplicate(this.filters);
      filters["selectedName"] = this.selectedName;
      filters["selectedSources"] = this.selectedSources;
      availableActors = this.system.filterAvailableActors(
        availableActors,
        filters
      );

      for (let x = 0; x < availableActors.length; x++) {
        let actor = availableActors[x];
        let level = this.system.getSafeLevel(actor);

        levels.push(level);
      }
      this.log(false, levels);
      return levels;
    },
    groupedSelectedActors() {
      let grouped = {};
      //this.log(false, "Grouping");
      for (let x = 0; x < this.selectedActors.length; x++) {
        let selected = this.selectedActors[x];
        //this.log(false, selected);
        let name = selected.name;
        if (!(name in grouped)) {
          grouped[name] = [];
        }

        grouped[name].push(selected);
      }

      const data = Object.entries(grouped);
      this.log(false, data);
      return data;
    },
  },
  watch: {
    availableActors() {
      // If our range changes and we rerender the component, reset the handles to the previous selections
      setTimeout(() => {
        let shouldReset = !this.levelHasBeenSelected;
        if (this.$refs.levelHistogram) {
          this.$refs.levelHistogram.update({
            from: this.minSelectedLevel,
            to: this.maxSelectedLevel,
          });
        
          if (shouldReset) {
            this.levelHasBeenSelected = false;
          }
        }
      }, 100);
    }
  },
  async created() {
    this.log = window.dungeonMoon.log;

    this.log(true, "Loading system");
    if (game.system.id == "archmage") {
      this.systemName = "thirteenth-age";
      this.system = window.dungeonMoon.thirteenthAge;
      this.colors.holder = "#dfd095";
      this.log(true, "13th Age Loaded");
    }
    else if (game.system.id == "pf2e") {
      this.systemName = "pf2e";
      this.system = window.dungeonMoon.pathfinder2E;
      this.colors.primary = "#171f69";
      this.log(true, "PF2E Loaded");
    }
    else if (game.system.id == "dnd5e") {
      this.systemName = "dnd5e";
      this.system = window.dungeonMoon.dnd5e;
      this.colors.primary = "#171f69";
      this.log(true, "DnD5e Loaded");
    }
    else {
      console.error("Unknown game system - " + game.system.id);
    }
  },
  async mounted() {

    this.step = this.system.histogramStep();
    this.levelName = this.system.levelName();

    //this.log(false, "Mounted!");
    let characters = this.system.getPlayerCharacters();
    //this.log(false, characters);
    if (characters.length > 0) {
      this.partyInfo.numberOfPartyMembers = characters.length;
      let totalLevel = 0;
      for (let index = 0; index < this.partyInfo.numberOfPartyMembers; index++) {
        totalLevel += this.system.getSafeLevel(characters[index]);
      }
      this.log(false, this.partyInfo);
      this.partyInfo.averagePartyLevel = Math.round(
        totalLevel / this.partyInfo.numberOfPartyMembers
      );
    }

    let npcs = this.system.getNpcs();
    let allActors = npcs;
    this.sources.push(game.world.title);
    let actorCompendiums = Array.from(game.packs.entries()).filter(
      (x) => x[1].metadata.type == "Actor" && !x[1].metadata.name.includes("baileywiki")
    );

    for (let index = 0; index < actorCompendiums.length; index++) {
      let pack = actorCompendiums[index];
      if (!game.settings.get("vue-encounter-builder", pack[0])) continue;
      //this.log(false, pack);
      let packActors = await pack[1].getDocuments();
      //this.log(false, packActors);
      allActors = allActors.concat(this.system.filterCompendiumActors(pack, packActors));
      this.sources.push(pack[1].metadata.label);
    }

    this.system.initValuesFromAllActors(allActors);

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

    let defaultRange = this.system.getDefaultLevelRange(this.partyInfo, this.minimumLevel, this.maximumLevel);
    this.minSelectedLevel = defaultRange.minSelectedLevel;
    this.maxSelectedLevel = defaultRange.maxSelectedLevel;

    this.log(false, `Min CR: ${this.minimumLevel} Max CR: ${this.maximumLevel}`);

    this.log(false, allActors);
    this.actors = allActors;
    this.loading = false;

    Hooks.on("deleteActor", (actor, meta, id) => {
      this.log(false, "Handling delete for " + id);
      this.log(false, this.selectedActors);
      this.selectedActors = this.selectedActors.filter((x) => x.id != actor.id);
      this.actors = this.actors.filter((x) => x.id != actor.id);
    });
  },
};
</script>
