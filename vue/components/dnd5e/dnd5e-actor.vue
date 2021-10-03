<template>
  <li class="actor-listing">
    <section class="actor-info">
      <h4 class="name">
        {{ actor.data.name }}
      </h4>
      <span class="trait-value">
          <i>{{CONFIG.DND5E.actorSizes[actor.data.data.traits.size]}} {{ actor.labels.creatureType }}</i>
      </span>

      <hr />


      <ul class="traits">
        <li><label class="trait-label">Challenge</label> <span class="trait-value">{{ window.dungeonMoon.dnd5e.histogramLabelPrettify(actor.data.data.details.cr) }} ({{ actor.encounterScore }} XP)</span>
        </li>
      </ul>

      <small class="actor-source">{{ actor.data.data.details.source }}</small>
    </section>

    <div class="actor-image">
      <img :src="actor.data.img" />
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
  name: "dnd5e-actor",
  props: ["actor"]
};
</script>