<template>
    <div>
        <h4>Challenge Level</h4>
        <v-select v-model="selectedChallenge" :options="['Normal', 'Double Strength', 'Killer']"></v-select>
    </div>
</template>

<script>
export default {
    name: "thirteenth-age-encounter-settings",
    props: ["value"],
    data: () => ({
        selectedChallenge: "Standard"
    }),
    watch: {
        selectedChallenge() {
            this.$emit('input', {
                selectedChallenge: this.selectedChallenge,
            });
        },
    }
}
</script>
