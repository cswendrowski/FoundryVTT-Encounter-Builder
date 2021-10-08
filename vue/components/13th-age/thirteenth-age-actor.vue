<template>
  <li class="actor-listing">
    <div class="actor-listing-contents" v-on:click.left="$emit('add-actor')"  v-on:click.right="$emit('remove-actor')">

    <div class="actor-image">
      <img :src="actor.data.img" width="100" height="100" />
    </div>
    
    <section class="actor-info">
      <h4 class="name">
        <span class="level" v-if="actor.data.data.details?.level?.value"
          >[{{ actor.data.data.details.level.value }}]</span
        >
        {{ actor.data.name }}
      </h4>

      <dl class="trait-list">
        <div
          is="actor-trait"
          :label="'Size'"
          :value="actor.data.data.details?.size?.value"></div>
          
        <div
          is="actor-trait"
          :label="'Role'"
          :value="actor.data.data.details?.role?.value"></div>
          
        <div
          is="actor-trait"
          :label="'Type'"
          :value="actor.data.data.details?.type?.value"></div>

        <div
          is="actor-trait"
          :label="'Encounter Score'"
          :value="actor.encounterScore"></div>
      </dl>


      <small class="actor-source">{{ actor.source }}</small>
    </section>
    </div>

    <div class="actor-info-buttons-overlay">
      <span class="actor-info-button" v-on:click.left="$emit('actor-info')"><i class="fas fa-info"></i></span>
      <span class="actor-info-button" v-on:click.left="$emit('add-actor')"><i class="fas fa-plus"></i></span>
      <span class="actor-info-button" v-on:click.left="$emit('remove-actor')"><i class="fas fa-minus"></i></span>
    </div>
  </li>
</template>

<script>
export default {
  name: "thirteenth-age-actor",
  props: ["actor"]
};
</script>