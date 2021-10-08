import {log} from './module.js';

const configToOptions = ([value, localizationString]) => ({ 
    value, 
    label: game.i18n.localize(localizationString)
});

const sortOptions = ({label: aLabel}, {label: bLabel}) => aLabel.localeCompare(bLabel);

export default class Pathfinder2E {

    constructor() {
        this.monsterTraits = Object.entries(CONFIG.PF2E.monsterTraits).map(configToOptions).sort(sortOptions);
        this.actorSizes = Object.entries(CONFIG.PF2E.actorSizes).map(configToOptions).sort(sortOptions);
        this.rarityTraits = Object.entries(CONFIG.PF2E.rarityTraits).map(configToOptions).sort(sortOptions);
        this.alignment = Object.entries(CONFIG.PF2E.alignment).map(configToOptions).sort(sortOptions);
    }

    initValuesFromAllActors(allActors) {}

    levelName() { return "Level" }

    histogramStep() { return 1; }

    histogramLabelPrettify(level) { return level; }

    getPlayerCharacters() {
        return game.actors.entities.filter((x) => x.hasPlayerOwner && x.data.type == "character");
    }

    getNpcs() {
        return game.actors.entities.filter((x) => x.data.type == "npc" || x.data.type == "hazard");
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
            availableActors = availableActors.filter(x => x.data.name.toLowerCase().includes(selectedName.toLowerCase()));
        }

        if (selectedAlignments?.length) {
            availableActors = availableActors.filter(x => selectedAlignments.includes(x.data.data?.details?.alignment?.value));
        }

        if (selectedTraits?.length) {
            availableActors = availableActors.filter(x => {
                return !!x.data.data?.traits?.traits?.value.some(trait => selectedTraits.includes(trait));
            });
        }

        if (selectedRarities?.length) {
            availableActors = availableActors.filter(x => selectedRarities.includes(x.data.data.traits?.rarity?.value));
        }

        if (selectedSizes?.length) {
            availableActors = availableActors.filter(x => selectedSizes.includes(x.data.data.traits?.size?.value));
        }

        return availableActors;
    }

    getActorSource(actor, skipDetails) {
        if (actor.data.data.details.source.value && !skipDetails) {
            return actor.data.data.details.source.value;
        }

        //log(false, actor.name);
        let nonCompendiumSourceType = game.settings.get("vue-encounter-builder", "nonCompendiumSourceType");
        let source = game.world.data.title;

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
            if (actor.data.type == "hazard") {
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

                let xpChart = actor.data.data.details.isComplex ? complexChart : simpleChart;

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
        if (actor?.data?.data?.details?.level) {
            if (actor.data.data.details.level?.value) return actor.data.data.details.level.value;
            return actor.data.data.details.level;
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
