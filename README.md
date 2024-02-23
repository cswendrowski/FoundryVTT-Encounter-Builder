![](https://raw.githubusercontent.com/cswendrowski/FoundryVTT-Encounter-Builder/master/dungeonmoon_cover.png)

A Vue-powered Foundry-Native Encounter Builder

Dungeon Moon allows GMs to quickly and easily build fair encounters in their systems, using all available Actors in the world and compendiums as well as the loaded Party information to make the process a breeze to use. Encounters can be spawned into the world with just a quick button click.

## Current Supported Systems: Toolkit13 (13th Age compatible), PF2E, DnD 5e
### Want to be on this list? Reach out to me on Discord: cswendrowski#9701

![](https://c10.patreonusercontent.com/3/eyJ3Ijo2MjB9/patreon-media/p/post/46097702/9789d4da1d7f4fe7a831dac72758ecf8/1.gif)

# How to add a system

## Implement the following JS
* histogramStep - what step the histogram should show results in
* histogramLabelPrettify(level) - a pretty label for the level, if needed
* getPlayerCharacters - return list of PC actors
* getNpcs - return list of enemy Actors
* filterCompendiumActors(pack, packActors) - given a compendium pack being loaded, filter out any desired actors
* filterAvailableActors(availableActors, filters) - given a list of actors, return a reduced list based on system-specific filters
* getActorSource(actor) - defaults to returning source compendium / folder, overridable to whatever you prefer for your system
* getUniqueKey(actor, partyInfo, encounterSettings) - a unique identifier for this actor + party info, used for vue cache breaking
*getEncounterScore(actor, partyInfo) - return how expensive this unit is towards a fair fight
* getSafeLevel(actor) - return the level of the 

Example: https://github.com/cswendrowski/FoundryVTT-Encounter-Builder/blob/master/scripts/thirteenth-age.mjs

## Implement the following Vue components
* actor - a display of the actor in the results
* encounterSettings - any additional settings that impact the encounter calculation, such as double-strength
* encounterSummary - Display total of the selected encounter, such as "total exp" or "total Encounter score"
* filters - Any additional filters for searching
* selectedActor - A display for a selected actor in the encounter

Examples: https://github.com/cswendrowski/FoundryVTT-Encounter-Builder/tree/master/vue/components/13th-age
