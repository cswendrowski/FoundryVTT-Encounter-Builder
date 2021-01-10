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
        <li
          class="size"
        >
          <label class="trait-label">Size</label>
          <span class="trait-value" v-if="actor.data.data.details?.size?.value != undefined && actor.data.data.details.size.value != ''">{{
            actor.data.data.details.size.value
          }}</span>
          <span class="trait-value missing" v-else>
            <i>Missing</i>
          </span>
        </li>
        <li
          class="role"
        >
          <label class="trait-label">Role</label>
          <span class="trait-value" v-if="actor.data.data.details?.role?.value != undefined && actor.data.data.details.role.value != ''">{{
            actor.data.data.details.role.value
          }}</span>
          <span class="trait-value missing" v-else>
            <i>Missing</i>
          </span>
        </li>
        <li
          class="type"
        >
          <label class="trait-label">Type</label>
          <span class="trait-value" v-if="actor.data.data.details?.type?.value != undefined && actor.data.data.details.type.value != ''">{{
            actor.data.data.details.type.value
          }}</span>
          <span class="trait-value missing" v-else>
            <i>Missing</i>
          </span>
        </li>
        <li class="score" v-if="actor.encounterScore > 0">
          <label class="trait-label">Encounter Score</label>
          <span class="trait-value">{{ actor.encounterScore }}</span>
        </li>
        <li class="source">
          <span class="trait-value">
              <i>{{ getActorSource(actor) }}</i>
          </span>
        </li>
      </ul>
    </section>
  </li>
</template>

<script>
export default {
  name: "thirteenth-age-actor",
  props: ["actor"],
  methods: {
    getActorSource: function (actor) {
      //console.log(actor.name);
      let nonCompendiumSourceType = game.settings.get(
        "vue-encounter-builder",
        "nonCompendiumSourceType"
      );
      let source = game.world.title;

      if (nonCompendiumSourceType == "folderName") {
        if (actor.folder != undefined) {
          source = actor.folder.name;
        }
      }

      if (
        actor.compendium != undefined &&
        actor.compendium.metadata != undefined
      )
        source = actor.compendium.metadata.label;
      return source;
    },
  },
};
</script>