<template>
    <div>
        <dt>{{label}}</dt>
        <dd v-if="!!value">{{value}}</dd>
        <dd class="missing" v-else>Missing</dd>
    </div>
</template>

<script>
export default {
    name: "actor-trait",
    props: ["label", "value"],
}
</script>
