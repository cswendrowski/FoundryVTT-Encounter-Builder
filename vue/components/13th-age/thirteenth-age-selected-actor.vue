<template>
  <li
    class="member"
    v-on:click.left="$emit('click-left')"
    v-on:click.right="$emit('click-right')"
  >
    <img :src="actor.data.img" width="50" height="50" />
    <div class="member-details">
      <b>{{ group }}</b>
      <div>
        Level {{ actor.data.data.details.level.value }}
        {{ actor.data.data.details.role.value }}
      </div>
      <div>
        <b>{{ groupsize }}</b> x {{ actor.encounterScore.toFixed(2) }} =
        {{ (actor.encounterScore * groupsize).toFixed(2) }} ES
      </div>
    </div>
  </li>
</template>
<script>
export default {
    name: "thirteenth-age-selected-actor",
    props: ["group", "actor", "groupsize"],
};
</script>