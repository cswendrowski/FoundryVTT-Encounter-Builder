<template>
  <div
    class="member"
    v-on:click.left="$emit('click-left')"
    v-on:click.right="$emit('click-right')"
    v-if="actor.encounterScore > 0"
  >
    <img :src="actor.data.img" width="50" height="50" />
    <div class="member-details">
      <b>{{ group }}</b>
      <div>
        Level {{ actor.data.data.details.cr }}
      </div>
      <div>
        <b>{{ groupsize }}</b> x {{ actor.encounterScore }} = {{ (actor.encounterScore * groupsize) }} XP
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: "dnd5e-selected-actor",
    props: ["group", "actor", "groupsize"],
};
</script>