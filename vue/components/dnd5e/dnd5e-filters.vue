<template>
  <div class="system-filters">

    <div>
      <label>Type</label>
      <v-select
        multiple
        v-model="selectedTypes"
        :options="creatureTypes"
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
        :options="actorSizes"
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
        :options="damageResistanceTypes"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
    <div>
      <label>Immunities</label>
      <v-select
        multiple
        v-model="selectedImmunities"
        :options="damageResistanceTypes"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
    <div>
      <label>Vulnerabilities</label>
      <v-select
        multiple
        v-model="selectedVulnerabilities"
        :options="damageResistanceTypes"
        :reduce="(x) => x.toLowerCase()"
      ></v-select>
    </div>
  </div>
</template>
<script>
export default {
    name: 'dnd5e-filters',
    data: () => ({
      environments: [],
      selectedEnvironments: [],
      creatureTypes: [],
      selectedTypes: [],
      actorSizes: [],
      selectedSizes: [],
      selectedAlignmentsLaw: [],
      selectedAlignmentsGood: [],
      selectedMovements: [],
      selectedTraits: [],
      damageResistanceTypes: [],
      selectedResistances: [],
      selectedImmunities: [],
      selectedVulnerabilities: [],
    }),
    props: ['value'],
    created() {
      this.environments = window.dungeonMoon.dnd5e.environments;
      this.creatureTypes = window.dungeonMoon.dnd5e.creatureTypes;
      this.actorSizes = window.dungeonMoon.dnd5e.actorSizes;
      this.damageResistanceTypes = window.dungeonMoon.dnd5e.damageResistanceTypes;
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
