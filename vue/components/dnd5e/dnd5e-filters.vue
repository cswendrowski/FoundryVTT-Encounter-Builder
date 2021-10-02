<template>
    <div>
        <h4>Environment</h4>
        <v-select multiple v-model="selectedEnvironments" :options="environments"></v-select>
        <h4>Type</h4>
        <v-select multiple v-model="selectedTypes" :options="Object.values(CONFIG.DND5E.creatureTypes).map(x => game.i18n.localize(x))"></v-select>
<!--        <h4>Size</h4>-->
<!--        <v-select multiple v-model="selectedRarities" :options="Object.values(CONFIG.PF2E.rarityTraits)" :reduce="x => x.toLowerCase()"></v-select>-->
<!--        <h4>Speed</h4>-->
<!--        <v-select multiple v-model="selectedAlignments" :options="Object.values(CONFIG.PF2E.alignment)"></v-select>-->
    </div>
</template>
<script>
export default {
    name: 'dnd5e-filters',
    data: () => ({
        selectedEnvironments: [],
        selectedTypes: []
    }),
    props: ['value'],
    computed: {
        environments() {
          return window.dungeonMoon.dnd5e.environments;
        }
    },
    methods: {
        dataBundle: function () {
            return {
                selectedEnvironments: this.selectedEnvironments,
                selectedTypes: this.selectedTypes
            };
        }
    },
    watch: {
        selectedEnvironments() {
          this.$emit('input', this.dataBundle());
        },
        selectedTypes() {
            this.$emit('input', this.dataBundle());
        }
    }
}
</script>
