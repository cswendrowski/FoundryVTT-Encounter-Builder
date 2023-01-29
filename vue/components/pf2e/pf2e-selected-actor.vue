<template>
  <div
    class="member actor-listing"
    v-if="actor.encounterScore > 0"
  >
    <div class="actor-listing-contents"
      v-on:click.left="$emit('add-actor')"
      v-on:click.right="$emit('remove-actor')">
      <div class="actor-image">
        <img :src="actor.data.img" />
      </div>
        
      <div class="member-details">
        <strong class="name">{{ group }}</strong>
        <div>
          Level {{ actor.system.details.level.value }}
        </div>
        <div>
          <strong>{{ groupSize }}</strong> x {{ actor.encounterScore }} = {{ (actor.encounterScore * groupSize) }} XP
        </div>
      </div>
    </div>
    <div class="actor-info-buttons-overlay">
      <button type="button" class="actor-info-button" v-on:click.left="$emit('actor-info')"><i class="fas fa-info"></i></button>
      <button type="button" class="actor-info-button" v-on:click.left="$emit('add-actor')"><i class="fas fa-plus"></i></button>
      <button type="button" class="actor-info-button" v-on:click.left="$emit('remove-actor')"><i class="fas fa-minus"></i></button>
    </div>
  </div>
</template>
<script>
export default {
    name: "pf2e-selected-actor",
    props: ["group", "actor", "groupSize"],
};
</script>