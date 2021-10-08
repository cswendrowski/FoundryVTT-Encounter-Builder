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

        <div>
        <label>Alignment</label>
        <v-select
            multiple
            v-model="selectedAlignments"
            :options="alignment"
            :reduce="(x) => x.value"

        ></v-select>
        </div>

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
      this.alignment = window.dungeonMoon.pathfinder2E.alignment;
    },
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
