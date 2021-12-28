<template>
    <div class="system-filters">
        <div>
        <label>Size</label>
        <v-select
            multiple
            v-model="selectedSizes"
            :options="['Weakling', 'Normal', 'Elite', 'Large', 'Double-Strength', 'Triple-Strength']"
            :reduce="x => x.toLowerCase()"
        ></v-select>
        </div>
        <div>
        <label>Role</label>
        <v-select
            multiple
            v-model="selectedRoles"
            :options="['Archer', 'Blocker', 'Caster', 'Leader', 'Mook', 'Spoiler', 'Troop', 'Wrecker']"
            :reduce="x => x.toLowerCase()"
        ></v-select>
        </div>
        <div>
        <label>Type</label>
        <v-select
            multiple
            v-model="selectedTypes"
            :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Demon', 'Devil', 'Dragon', 'Elemental', 'Fey', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']"
            :reduce="x => x.toLowerCase()"
        ></v-select>
        </div>
    </div>
</template>
<script>
export default {
    name: 'thirteenth-age-filters',
    data: () => ({
        selectedSizes: [],
        selectedRoles: [],
        selectedTypes: [],
    }),
    props: ['value'],
    watch: {
        selectedSizes() {
            this.$emit('input', {
                selectedSizes: this.selectedSizes,
                selectedRoles: this.selectedRoles,
                selectedTypes: this.selectedTypes
            });
        },
        selectedRoles() {
            this.$emit('input', {
                selectedSizes: this.selectedSizes,
                selectedRoles: this.selectedRoles,
                selectedTypes: this.selectedTypes
            });
        },
        selectedTypes() {
            this.$emit('input', {
                selectedSizes: this.selectedSizes,
                selectedRoles: this.selectedRoles,
                selectedTypes: this.selectedTypes
            });
        }
    }
}
</script>
