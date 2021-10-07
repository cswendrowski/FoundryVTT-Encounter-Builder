<template>
  <div class="system-filters">

    <div>
      <label>Type</label>
      <v-select
        multiple
        v-model="selectedTypes"
        :options="
          Object.keys(CONFIG.DND5E.creatureTypes).map((x) => ({
            label: game.i18n.localize(CONFIG.DND5E.creatureTypes[x]),
            value: x,
          }))
        "
        :reduce="(x) => x.value"
      ></v-select>
    </div>

    <div>
      <label>Environment</label>
      <v-select
        multiple
        v-model="selectedEnvironments"
        :options="environments"
      ></v-select>
    </div>

    <div>
      <label>Size</label>
      <v-select
        multiple
        v-model="selectedSizes"
        :options="Object.values(CONFIG.DND5E.actorSizes).reverse()"
      ></v-select>
    </div>

    <div>
      <label>Movement</label>
      <v-select
        multiple
        v-model="selectedMovements"
        :options="['Burrows', 'Climbs', 'Flys', 'Swims', 'Walks']"
      ></v-select>
    </div>

    <div class="full-width-filter">
      <label>Alignment</label>
      <div class='flexrow'>
        <v-select
          multiple
          v-model="selectedAlignmentsLaw"
          placeholder="Any"
          :options="['Lawful', 'Neutral', 'Chaotic']"
          :reduce="(x) => x.toLowerCase()"
        ></v-select>
        <div class="filter-divider"></div>
        <v-select
          multiple
          v-model="selectedAlignmentsGood"
          placeholder="Any"
          :options="['Good', 'Neutral', 'Evil']"
          :reduce="(x) => x.toLowerCase()"
        ></v-select>
      </div>
    </div>

    <div>
      <label>Special Traits</label>
      <v-select
        multiple
        v-model="selectedTraits"
        :options="['Spellcaster', 'Legendary', 'Lair Actions']"
      ></v-select>
    </div>
    
    <h3>Defenses</h3>

    <div>
      <label>Resistances</label>
      <v-select
        multiple
        v-model="selectedResistances"
        :options="Object.values(CONFIG.DND5E.damageResistanceTypes)"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
    <div>
      <label>Immunities</label>
      <v-select
        multiple
        v-model="selectedImmunities"
        :options="Object.values(CONFIG.DND5E.damageResistanceTypes)"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
    <div>
      <label>Vulnerabilities</label>
      <v-select
        multiple
        v-model="selectedVulnerabilities"
        :options="Object.values(CONFIG.DND5E.damageResistanceTypes)"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
  </div>
</template>
<script>
export default {
    name: 'dnd5e-filters',
    data: () => ({
      selectedEnvironments: [],
      selectedTypes: [],
      selectedSizes: [],
      selectedAlignmentsLaw: [],
      selectedAlignmentsGood: [],
      selectedMovements: [],
      selectedTraits: [],
      selectedResistances: [],
      selectedImmunities: [],
      selectedVulnerabilities: [],
    }),
    props: ['value'],
    computed: {
      environments() {
        return window.dungeonMoon.dnd5e.environments;
      },
    },
    methods: {
      dataBundle: function () {
          return {
            selectedEnvironments: this.selectedEnvironments,
            selectedTypes: this.selectedTypes,
            selectedSizes: this.selectedSizes,
            selectedAlignmentsLaw: this.selectedAlignmentsLaw,
            selectedAlignmentsGood: this.selectedAlignmentsGood,
            selectedMovements: this.selectedMovements,
            selectedTraits: this.selectedTraits,
            selectedResistances: this.selectedResistances,
            selectedImmunities: this.selectedImmunities,
            selectedVulnerabilities: this.selectedVulnerabilities,
          };
      }
    },
    watch: {
      selectedEnvironments() {
        this.$emit('input', this.dataBundle());
      },
      selectedTypes() {
        this.$emit('input', this.dataBundle());
      },
      selectedSizes() {
        this.$emit('input', this.dataBundle());
      },
      selectedAlignmentsLaw() {
        this.$emit('input', this.dataBundle());
      },
      selectedAlignmentsGood() {
        this.$emit('input', this.dataBundle());
      },
      selectedMovements() {
        this.$emit('input', this.dataBundle());
      },
      selectedTraits() {
        this.$emit('input', this.dataBundle());
      },
      selectedResistances() {
        this.$emit('input', this.dataBundle());
      },
      selectedImmunities() {
        this.$emit('input', this.dataBundle());
      },
      selectedVulnerabilities() {
        this.$emit('input', this.dataBundle());
      },
    }
}
</script>
