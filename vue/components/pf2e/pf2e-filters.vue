<template>
    <div class="system-filters">

        <div>
        <label>Traits</label>
        <v-select
            multiple
            v-model="selectedTraits"
            :options="monsterTraits"
            :reduce="(x) => x.value"

        ></v-select>
        </div>

        <div>
        <label>Size</label>
        <v-select
            multiple
            v-model="selectedSizes"
            :options="actorSizes"
            :reduce="(x) => x.value"

        ></v-select>
        </div>

        <div>
        <label>Rarity</label>
        <v-select
            multiple
            v-model="selectedRarities"
            :options="rarityTraits"
            :reduce="(x) => x.value"

        ></v-select>
        </div>
    </div>
</template>
<script>
export default {
    name: 'pf2e-filters',
    data: () => ({
        selectedTraits: [],
        selectedRarities: [],
        selectedSizes: [],
        monsterTraits: [],
        actorSizes: [],
        rarityTraits: [],
        alignment: []
    }),
    props: ['value'],
    created() {
      this.monsterTraits = window.dungeonMoon.pathfinder2E.monsterTraits;
      this.actorSizes = window.dungeonMoon.pathfinder2E.actorSizes;
      this.rarityTraits = window.dungeonMoon.pathfinder2E.rarityTraits;
    },
    methods: {
        dataBundle: function () {
            return {
                selectedTraits: this.selectedTraits,
                selectedRarities: this.selectedRarities,
                selectedSizes: this.selectedSizes,
            };
        }
    },
    watch: {
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
