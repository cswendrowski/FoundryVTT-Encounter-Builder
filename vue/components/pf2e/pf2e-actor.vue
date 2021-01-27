<template>
  <li
    class="actor-listing"
    v-on:click.left="$emit('click-left')"
    v-on:click.right="$emit('click-right')"
  >
    <img :src="actor.data.img" width="100" height="100" />
    <section class="actor-info">
      <h4 class="name">
        <span class="level" v-if="actor.data.data.details?.level?.value"
          >[{{ actor.data.data.details.level.value }}]</span
        >
        {{ actor.data.name }}
      </h4>
      <ul class="traits">
        <li class="score" v-if="actor.encounterScore > 0">
          <label class="trait-label">Traits</label>
          <span class="trait-value">{{ actor.data.data.traits.traits.value.join(", ") }}</span>
        </li>
        <li class="score" v-if="actor.encounterScore > 0">
          <label class="trait-label">XP</label>
          <span class="trait-value">{{ actor.encounterScore }}</span>
        </li>
        <li class="source">
          <span class="trait-value">
              <i>{{ actor.source }}</i>
          </span>
        </li>
      </ul>
    </section>
  </li>
</template>

<script>
export default {
  name: "pf2e-actor",
  props: ["actor"]
};
</script>