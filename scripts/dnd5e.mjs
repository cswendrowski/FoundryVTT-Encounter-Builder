import {log} from './module.js';

export default class Dnd5e {

    constructor() {
        this.environments = [];
    }

    initValuesFromAllActors(allActors) {
        let environments = new Set();
        allActors.forEach(actor => {
            if (actor.data?.data?.details?.environment) {
                environments.add(actor.data?.data?.details?.environment);
            }
        });
        this.environments = Array.from(environments);
    }

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

        if (filters.selectedEnvironments && filters.selectedEnvironments.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.environment != undefined) {
                    return filters.selectedEnvironments.includes(x.data.data.details.environment);
                }
                return false;
            });
        }

        if (filters.selectedTypes && filters.selectedTypes.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.type != undefined) {
                    return filters.selectedTypes.filter(value => x.data.data.details.type == value).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedSizes && filters.selectedSizes.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.size != undefined) {
                    return filters.selectedSizes.filter(value =>
                        Object.entries(CONFIG.DND5E.actorSizes).find(x => x[1] == value)[0] == x.data.data.traits.size
                    ).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedAlignments && filters.selectedAlignments.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.alignment != undefined) {
                    return filters.selectedAlignments.filter(value =>
                        value == x.data.data.details.alignment
                    ).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedMovements && filters.selectedMovements.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.attributes?.movement != undefined) {
                    let matchingMovements = filters.selectedMovements.filter(value => {
                        switch (value) {
                            case "Burrows": return x.data.data.attributes.movement.burrow > 0;
                            case "Climbs": return x.data.data.attributes.movement.climb > 0;
                            case "Flys": return x.data.data.attributes.movement.fly > 0;
                            case "Swims": return x.data.data.attributes.movement.swim > 0;
                            case "Walks": return x.data.data.attributes.movement.walk > 0;
                        }
                    });
                    return matchingMovements.length > 0;
                }
                return false;
            });
        }

        if (filters.selectedTraits && filters.selectedTraits.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data != undefined) {
                    let matchingTraits = filters.selectedTraits.filter(value => {
                        switch (value) {
                            case "Spellcaster": return x.data.data.details.spellLevel > 0;
                            case "Legendary": return x.data.data.resources?.lair?.value;
                            case "Lair Actions": return x.data.data.resources?.legact?.max > 0 || x.data.data.resources?.legres?.max > 0;
                        }
                    });
                    return matchingTraits.length > 0;
                }
                return false;
            });
        }

        if (filters.selectedResistances && filters.selectedResistances.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.dr != undefined) {
                    return filters.selectedResistances.filter(value => x.data.data.traits.dr.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedImmunities && filters.selectedImmunities.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.di != undefined) {
                    return filters.selectedImmunities.filter(value => x.data.data.traits.di.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        if (filters.selectedVulnerabilities && filters.selectedVulnerabilities.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.dv != undefined) {
                    return filters.selectedVulnerabilities.filter(value => x.data.data.traits.dv.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        return availableActors;
    }

    getActorSource(actor) {
        if (actor.data.data.details.source) {
            return actor.data.data.details.source.split('pg')[0];
        }

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

    getEncounterScore(actor) {
        if (actor == undefined) return -30;
        try {
            return actor.data.data.details.xp.value;
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
