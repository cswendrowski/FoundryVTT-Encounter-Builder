<template>
  <li class="actor-listing">
    <div class="actor-listing-contents" v-on:click.left="$emit('add-actor')"  v-on:click.right="$emit('remove-actor')">
      <section class="actor-info">
        <h4 class="name">
          {{ actor.data.name }}
        </h4>

        <em class="trait-value">
            {{CONFIG.DND5E.actorSizes[actor.data.data.traits.size]}} {{ actor.labels.creatureType }}
        </em>

        <hr />

        <dl class="trait-list">
          <div
            is="actor-trait"
            :label="'Challenge'"
            :value="`${window.dungeonMoon.dnd5e.histogramLabelPrettify(actor.data.data.details.cr)}   (${actor.encounterScore} XP)`"></div>
        </dl>

        <ul class="tags">
          <li v-for="tag of tags"
            :key="tag">{{tag}}</li>
        </ul>

        <small class="actor-source">{{ actor.data.data.details.source }}</small>
      </section>

      <div class="actor-image" v-if="actor.data.img !== 'icons/svg/mystery-man.svg'">
        <img :src="actor.data.img" />
      </div>
    </div>

    <div class="actor-info-buttons-overlay">
      <button type="button" class="actor-info-button" v-on:click.left="$emit('actor-info')"><i class="fas fa-info"></i></button>
      <button type="button" class="actor-info-button" v-on:click.left="$emit('add-actor')"><i class="fas fa-plus"></i></button>
      <button type="button" class="actor-info-button" v-on:click.left="$emit('remove-actor')"><i class="fas fa-minus"></i></button>
    </div>
  </li>
</template>

<script>
export default {
  name: "dnd5e-actor",
  props: ["actor"],
  computed: {
    tags() {
      const {attributes, details, resources} = this.actor.data.data;
      const ret = [];


      const environments = !!details.environment && details.environment?.split(',').map(env => env.trim());
      environments && ret.push(...environments);

      const movements = Object.keys(CONFIG.DND5E.movementTypes)
        .filter(movementType => movementType !== 'walk')
        .filter(movementType => attributes.movement[movementType] > 0)
        .map(movementType => CONFIG.DND5E.movementTypes[movementType]);

      movements.length && ret.push(...movements);

      if (details.spellLevel > 0) {
        ret.push('Spellcaster');
      }
      
      if (resources?.lair?.value) {
        ret.push('Lair');
      }

      if (resources.legact?.max > 0 || resources.legres?.max > 0) {
        ret.push('Legendary');
      }

      ret.push(details.alignment);

      ret.filter(tag => !!tag.trim());

      return ret;
    }
  }
};
</script>