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
          :label="'XP'"
          :value="actor.encounterScore"></div>
      </dl>

        <ul class="tags">
          <li v-for="tag of primaryTags"
            :key="tag">{{tag}}</li>
        </ul>

        <ul class="tags">
          <li v-for="tag of tags"
            :key="tag">{{tag}}</li>
        </ul>

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
  name: "pf2e-actor",
  props: ["actor"],
  computed: {
    primaryTags() {
      const {traits, details} = this.actor.data.data;
      const ret = [];

      if (!!traits?.rarity?.value) {
        ret.push(game.i18n.localize(CONFIG.PF2E.rarityTraits[traits.rarity?.value]))
      }

      if (!!details?.alignment?.value) {
        ret.push(game.i18n.localize(CONFIG.PF2E.alignments[details.alignment.value]))
      }

      if (!!traits?.size?.value) {
        ret.push(game.i18n.localize(CONFIG.PF2E.actorSizes[traits?.size?.value]))
      }

      return ret;
    },
    tags() {
      return this.actor.data.data?.traits?.traits?.value
        .map((tag) => game.i18n.localize(CONFIG.PF2E.monsterTraits[tag]))
        .filter((tag) => !!tag)
    },
  }
};
</script>
