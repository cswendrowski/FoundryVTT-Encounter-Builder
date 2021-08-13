<template>
    <div>
        <h4>Threat Level</h4>
        <v-select v-model="selectedThreat" :options="['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme']"></v-select>
    </div>
</template>

<script>
export default {
    name: "dnd5e-encounter-settings",
    props: ["value"],
    data: () => ({
        selectedThreat: "Moderate"
    }),
    watch: {
        selectedThreat() {
            this.$emit('input', {
                selectedThreat: this.selectedThreat,
            });
        },
    }
}
</script>
