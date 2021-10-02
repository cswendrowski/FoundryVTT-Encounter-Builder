import {log} from './module.js';

export default class Pathfinder2E {

    constructor() {
        this.monsterTraits = Object.values(CONFIG.PF2E.monsterTraits);
        this.actorSizes = Object.values(CONFIG.PF2E.actorSizes);
        this.rarityTraits = Object.values(CONFIG.PF2E.rarityTraits);
        this.alignment = Object.values(CONFIG.PF2E.alignment);
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

    filterAvailableActors(availableActors, filters) {
        if (filters.selectedSources.length > 0) {
            availableActors = availableActors.filter(x => filters.selectedSources.includes(this.getActorSource(x).toLowerCase()));
        }
        if (filters.selectedName != "") {
            availableActors = availableActors.filter(x => x.data.name.toLowerCase().includes(filters.selectedName.toLowerCase()));
        }

        // selectedAlignments: [],
        // selectedTraits: [],
        // selectedRarities: [],
        // selectedSizes: [],
        

        if (filters.selectedAlignments && filters.selectedAlignments.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.alignment != undefined) {
                    return filters.selectedAlignments.filter(value => 
                        Object.entries(CONFIG.PF2E.alignment).find(x => x[1] == value)[0] == x.data.data.details.alignment.value
                        ).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedTraits && filters.selectedTraits.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.traits != undefined) {
                    return filters.selectedTraits.filter(value => x.data.data.traits.traits.value.includes(value)).length > 0;
                }
                return false;
            });
        }      

        if (filters.selectedRarities && filters.selectedRarities.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.rarity != undefined) {
                    return filters.selectedRarities.includes(x.data.data.traits.rarity.value);
                }
                return false;
            });
        }

        if (filters.selectedSizes && filters.selectedSizes.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.size != undefined) {
                    return filters.selectedSizes.filter(value => 
                        Object.entries(CONFIG.PF2E.actorSizes).find(x => x[1] == value)[0] == x.data.data.traits.size.value
                        ).length > 0;
                }
                return false;
            });
        }

        return availableActors;
    }

    getActorSource(actor) {
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

    
}
