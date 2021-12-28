import {log} from './module.js';

export default class Dnd5e {

    constructor() {
        this.environments = [];
        this.creatureTypes = Object.keys(CONFIG.DND5E.creatureTypes).map((x) => ({
            label: game.i18n.localize(CONFIG.DND5E.creatureTypes[x]),
            value: x,
        }));
        this.actorSizes = Object.values(CONFIG.DND5E.actorSizes).reverse();
        this.damageResistanceTypes = Object.values(CONFIG.DND5E.damageResistanceTypes);
        this.movementTypes = Object.keys(CONFIG.DND5E.movementTypes);
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
        return game.actors.filter((x) => x.hasPlayerOwner && x.data.type == "character");
    }

    getNpcs() {
        return game.actors.filter((x) => x.data.type == "npc" && !x.data.img.includes("baileywiki"));
    }

    filterCompendiumActors(pack, packActors) {
        return packActors;
    }

    filterAvailableActors(availableActors, {
        selectedAlignmentsGood,
        selectedAlignmentsLaw,
        selectedEnvironments,
        selectedImmunities,
        selectedMovements,
        selectedName,
        selectedResistances,
        selectedSizes,
        selectedSources,
        selectedTraits,
        selectedTypes,
        selectedVulnerabilities
    }) {
        if (selectedSources?.length > 0) {
            availableActors = availableActors.filter(x => {
                const matchesSourceDetail = selectedSources.includes(this.getActorSource(x).toLowerCase());

                const matchesNormalSource = selectedSources.includes(this.getActorSource(x, true).toLowerCase());

                return matchesSourceDetail || matchesNormalSource;
            });
        }

        if (!!selectedName) {
            availableActors = availableActors.filter(x => x.data.name.toLowerCase().includes(selectedName.toLowerCase()));
        }

        if (selectedEnvironments?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.environment != undefined) {
                    return selectedEnvironments.filter(value => x.data.data.details.environment.includes(value)).length > 0;
                }
                return false;
            });
        }

        if (selectedTypes?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.details?.type != undefined) {
                    return selectedTypes.filter(value => x.data.data.details.type.value == value).length > 0;
                }
                return false;
            });
        }

        if (selectedSizes?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.size != undefined) {
                    return selectedSizes.filter(value =>
                        Object.entries(CONFIG.DND5E.actorSizes).find(x => x[1] == value)[0] == x.data.data.traits.size
                    ).length > 0;
                }
                return false;
            });
        }

        if (selectedAlignmentsLaw?.length || selectedAlignmentsGood?.length) {
            availableActors = availableActors.filter(x => {
                const alignment = x.data.data.details.alignment.toLowerCase();

                if (alignment === 'unaligned') {
                    return false;
                }

                if (['any', 'any alignment'].includes(alignment)) {
                    return true;
                }

                const alignmentArray = alignment.split(' ');

                if (alignmentArray.length !== 2) {
                    return false;
                }

                if (alignmentArray[0] === 'any') {
                    return [...selectedAlignmentsGood, ...selectedAlignmentsLaw].includes(alignmentArray[1]);
                }

                // BRITTLE ASSUMPTION
                const [lawfulness, goodness] = alignmentArray;
                
                const matchLaw = selectedAlignmentsLaw.length ? selectedAlignmentsLaw.includes(lawfulness) : true;

                const matchGood = selectedAlignmentsGood.length ? selectedAlignmentsGood.includes(goodness) : true;

                return matchLaw && matchGood;
            });
        }

        if (selectedMovements?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.attributes?.movement != undefined) {
                    let matchingMovements = selectedMovements.filter(value => {
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

        if (selectedTraits?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data != undefined) {
                    let matchingTraits = selectedTraits.filter(value => {
                        switch (value) {
                            case "Spellcaster": return x.data.data.details.spellLevel > 0;
                            case "Lair Actions": return x.data.data.resources?.lair?.value;
                            case "Legendary Actions": return x.data.data.resources?.legact?.max > 0 || x.data.data.resources?.legres?.max > 0;
                        }
                    });
                    return matchingTraits.length > 0;
                }
                return false;
            });
        }

        if (selectedResistances?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.dr != undefined) {
                    return selectedResistances.filter(value => x.data.data.traits.dr.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        if (selectedImmunities?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.di != undefined) {
                    return selectedImmunities.filter(value => x.data.data.traits.di.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        if (selectedVulnerabilities?.length > 0) {
            availableActors = availableActors.filter(x => {
                if (x.data.data?.traits?.dv != undefined) {
                    return selectedVulnerabilities.filter(value => x.data.data.traits.dv.value.includes(value)).length > 0;
                }
                return false;
            });
        }

        return availableActors;
    }

    getActorSource(actor, skipDetails) {
        if (actor.data.data.details.source && !skipDetails) {
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
                return Number(actor.data.data.details.level);
            }
        }
        else {
            if (actor.data?.data?.details?.cr) {
                return Number(actor.data.data.details.cr);
            }
        }
        return 0;
    }

    getDefaultLevelRange(partyInfo, minimumLevel, maximumLevel) {
        return {
            minSelectedLevel: 0.25,
            maxSelectedLevel: partyInfo.averagePartyLevel + 1
        }
    }
    
}
