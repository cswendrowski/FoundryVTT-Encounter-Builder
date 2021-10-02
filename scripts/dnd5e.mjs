
/**
 * Player Character XP Thresholds
 */
const xpThresholdsByLevel = {
    1: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    2: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    3: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    4: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    5: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    6: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    7: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    8: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    9: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    10: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    11: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    12: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    13: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    14: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    15: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    16: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    17: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    18: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    19: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
    20: {
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
    },
}


export default class Dnd5e {

    levelName() { return "CR" }

    histogramStep() { return 0.25; }

    histogramLabelPrettify(cr) {
        if (cr >= 1) return cr.toString();
        if (cr == 0.75) return "3/4";
        if (cr == 0.5) return "1/2";
        if (cr == 0.25) return "1/4";
        if (cr == 0) return "0";
        if (cr < 0.25) return "1/8";
        return 0;
    }

    getPlayerCharacters() {
        return game.actors.entities.filter((x) => x.hasPlayerOwner && x.data.type == "character");
    }

    getNpcs() {
        return game.actors.entities.filter((x) => x.data.type == "npc" && !x.data.img.includes("baileywiki"));
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
        

        // if (filters.selectedAlignments && filters.selectedAlignments.length > 0) {
        //     availableActors = availableActors.filter(x => {
        //         if (x.data.data?.details?.alignment != undefined) {
        //             return filters.selectedAlignments.filter(value =>
        //                 Object.entries(CONFIG.PF2E.alignment).find(x => x[1] == value)[0] == x.data.data.details.alignment.value
        //                 ).length > 0;
        //         }
        //         return false;
        //     });
        // }
        //
        // if (filters.selectedTraits && filters.selectedTraits.length > 0) {
        //     availableActors = availableActors.filter(x => {
        //         if (x.data.data?.traits?.traits != undefined) {
        //             return filters.selectedTraits.filter(value => x.data.data.traits.traits.value.includes(value)).length > 0;
        //         }
        //         return false;
        //     });
        // }
        //
        // if (filters.selectedRarities && filters.selectedRarities.length > 0) {
        //     availableActors = availableActors.filter(x => {
        //         if (x.data.data?.traits?.rarity != undefined) {
        //             return filters.selectedRarities.includes(x.data.data.traits.rarity.value);
        //         }
        //         return false;
        //     });
        // }
        //
        // if (filters.selectedSizes && filters.selectedSizes.length > 0) {
        //     availableActors = availableActors.filter(x => {
        //         if (x.data.data?.traits?.size != undefined) {
        //             return filters.selectedSizes.filter(value =>
        //                 Object.entries(CONFIG.PF2E.actorSizes).find(x => x[1] == value)[0] == x.data.data.traits.size.value
        //                 ).length > 0;
        //         }
        //         return false;
        //     });
        // }

        return availableActors;
    }

    getActorSource(actor) {
        if (actor.data.data.details.source) {
            return actor.data.data.details.source.split('pg')[0];
        }

        //console.log(actor.name);
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
        return actor._id + partyInfo.averagePartyLevel + partyInfo.numberOfPartyMembers;
    }

    getEncounterScore(actor, partyInfo) {
        if (actor == undefined) return -30;
        //console.log(actor);
        try {

            // let xpChart = [
            //     10,
            //     15,
            //     20,
            //     30,
            //     40, // Same level
            //     60,
            //     80,
            //     120,
            //     160
            // ];
            //
            // let levelDifference = this.getSafeLevel(actor) - partyInfo.averagePartyLevel;
            // let xpIndex = levelDifference + 4;
            //
            // return xpChart[xpIndex];
            return 0;
        }
        catch (error) {
            console.error(error);
            return -30;
        }
    }

    getSafeLevel(actor) {
        if (actor.data.type == "character") {
            if (actor.data?.data?.details?.level) {
                return actor.data.data.details.level;
            }
        }
        else {
            if (actor.data?.data?.details?.cr) {
                return actor.data.data.details.cr;
            }
        }
        return 0;
    }

    
}
