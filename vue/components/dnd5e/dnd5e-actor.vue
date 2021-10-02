<template>
  <li
    class="actor-listing"
    v-on:click.left="$emit('click-left')"
    v-on:click.right="$emit('click-right')"
  >
    <div class="actor-image">
      <span class="actor-info-button" v-on:click.left="$emit('actor-info')"><i class="fas fa-info-circle"></i></span>
      <img :src="actor.data.img" width="100" height="100" />
    </div>
    <section class="actor-info">
      <h4 class="name">
        <span class="level" v-if="actor.data.data.details?.cr"
          >[{{ actor.data.data.details.cr}}]</span
        >
        {{ actor.data.name }}
      </h4>
      <ul class="traits">
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
  name: "dnd5e-actor",
  props: ["actor"]
};
</script>