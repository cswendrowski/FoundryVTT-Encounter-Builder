import {log} from './module.js';

const configToOptions = ([value, localizationString]) => ({
    value,
    label: game.i18n.localize(localizationString)
});

const sortOptions = ({label: aLabel}, {label: bLabel}) => aLabel.localeCompare(bLabel);

export default class Pathfinder2E {

    constructor() {
        this.monsterTraits = Object.entries(CONFIG.PF2E.creatureTraits).map(configToOptions).sort(sortOptions);
        this.actorSizes = Object.entries(CONFIG.PF2E.actorSizes).map(configToOptions).sort(sortOptions);
        this.rarityTraits = Object.entries(CONFIG.PF2E.rarityTraits).map(configToOptions).sort(sortOptions);
    }

    initValuesFromAllActors(allActors) {}

    levelName() { return "Level" }

    histogramStep() { return 1; }

    histogramLabelPrettify(level) { return level; }

    perPage() { return 16; }

    getPlayerCharacters() {
        return game.actors.filter((x) => x.hasPlayerOwner && x.type == "character");
    }

    getNpcs() {
        return game.actors.filter((x) => x.type == "npc" || x.type == "hazard");
    }

    filterCompendiumActors(pack, packActors) {
        return packActors;
    }

    filterAvailableActors(availableActors, {
        selectedAlignments,
        selectedName,
        selectedRarities,
        selectedSizes,
        selectedSources,
        selectedTraits,
    }) {
        if (selectedSources.length) {
            availableActors = availableActors.filter(x => selectedSources.includes(this.getActorSource(x).toLowerCase()));
        }
        if (selectedName != "") {
            availableActors = availableActors.filter(x => x.name.toLowerCase().includes(selectedName.toLowerCase()));
        }

        if (selectedTraits?.length) {
            availableActors = availableActors.filter(x => {
                return !!x.system?.traits?.traits?.value.some(trait => selectedTraits.includes(trait));
            });
        }

        if (selectedRarities?.length) {
            availableActors = availableActors.filter(x => selectedRarities.includes(x.system.traits?.rarity?.value));
        }

        if (selectedSizes?.length) {
            availableActors = availableActors.filter(x => selectedSizes.includes(x.system.traits?.size?.value));
        }

        return availableActors;
    }

    getActorSource(actor, skipDetails) {
        if (actor.system.details.source?.value && !skipDetails) {
            return actor.system.details.source.value;
        }

        //log(false, actor.name);
        let nonCompendiumSourceType = game.settings.get("vue-encounter-builder", "nonCompendiumSourceType");
        let source = game.world.title;

        if (nonCompendiumSourceType == "folderName") {
            if (actor.folder != undefined) {
                source = actor.folder.name;
            }
        }

        if (actor.compendium != undefined && actor.compendium.metadata != undefined) source = actor.compendium.metadata.label;
        return source;
    };

    getUniqueKey(actor, partyInfo, encounterSettings) {
        return actor.id;
    }

    getEncounterScore(actor, partyInfo) {
        if (actor == undefined) return -30;
        //log(false, actor);
        try {
            if (actor.type == "hazard") {
                let simpleChart = [
                    2,
                    3,
                    4,
                    6,
                    8, // Same level
                    12,
                    16,
                    24,
                    30
                ];

                let complexChart = [
                    10,
                    15,
                    20,
                    30,
                    40, // Same level
                    60,
                    80,
                    120,
                    150
                ];

                let xpChart = actor.system.details.isComplex ? complexChart : simpleChart;

                let levelDifference = this.getSafeLevel(actor) - partyInfo.averagePartyLevel;
                let xpIndex = levelDifference + 4;

                return xpChart[xpIndex];
            }
            else {
                let xpChart = [
                    10,
                    15,
                    20,
                    30,
                    40, // Same level
                    60,
                    80,
                    120,
                    160
                ];

                let levelDifference = this.getSafeLevel(actor) - partyInfo.averagePartyLevel;
                let xpIndex = levelDifference + 4;

                return xpChart[xpIndex];
            }
        }
        catch (error) {
            console.error(error);
            return -30;
        }
    }

    getSafeLevel(actor) {
        if (actor?.system?.details?.level) {
            if (actor.system.details.level?.value) return actor.system.details.level.value;
            return actor.system.details.level;
        }
        return 0;
    }

    getDefaultLevelRange(partyInfo, minimumLevel, maximumLevel) {
        let minSelectedLevel = partyInfo.averagePartyLevel - 4;
        if (minSelectedLevel < minimumLevel)
            minSelectedLevel = minimumLevel;

        let maxSelectedLevel = partyInfo.averagePartyLevel + 4;
        if (maxSelectedLevel > maximumLevel)
            maxSelectedLevel = maximumLevel;

        return {
            minSelectedLevel: minSelectedLevel,
            maxSelectedLevel: maxSelectedLevel
        }
    }

}
