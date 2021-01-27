<template>
    <div>
        <h4>Traits</h4>
        <v-select multiple v-model="selectedTraits" :options="Object.values(CONFIG.PF2E.monsterTraits)" :reduce="x => x.toLowerCase()"></v-select>
        <h4>Size</h4>
        <v-select multiple v-model="selectedSizes" :options="Object.values(CONFIG.PF2E.actorSizes)"></v-select>
        <h4>Rarity</h4>
        <v-select multiple v-model="selectedRarities" :options="Object.values(CONFIG.PF2E.rarityTraits)" :reduce="x => x.toLowerCase()"></v-select>
        <h4>Alignment</h4>
        <v-select multiple v-model="selectedAlignments" :options="Object.values(CONFIG.PF2E.alignment)"></v-select>
    </div>
</template>
<script>
export default {
    name: 'pf2e-filters',
    data: () => ({
        selectedAlignments: [],
        selectedTraits: [],
        selectedRarities: [],
        selectedSizes: [],
    }),
    props: ['value'],
    methods: {
        dataBundle: function () {
            return {
                selectedAlignments: this.selectedAlignments,
                selectedTraits: this.selectedTraits,
                selectedRarities: this.selectedRarities,
                selectedSizes: this.selectedSizes,
            };
        }
    },
    watch: {
        selectedAlignments() {
            this.$emit('input', this.dataBundle());
        },
        selectedTraits() {
            this.$emit('input', this.dataBundle());
        },
        selectedRarities() {
            this.$emit('input', this.dataBundle());
        },
        selectedSizes() {
            this.$emit('input', this.dataBundle());
        }
    }
}
</script>
