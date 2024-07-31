import {log} from './module.js';

export default class ThirteenthAge {

    initValuesFromAllActors(allActors) {}

    levelName() { return "Level" }

    histogramStep() { return 1; }

    histogramLabelPrettify(level) { return level; }

    perPage() { return 12; }

    getPlayerCharacters() {
        return game.actors.filter((x) => x.hasPlayerOwner && x.type == "character");
    }

    getNpcs() {
        return game.actors.filter((x) => x.type == "npc");
    }

    filterCompendiumActors(pack, packActors) {
        return packActors;
    }

    filterAvailableActors(availableActors, {
        selectedName,
        selectedRoles,
        selectedSizes,
        selectedSources,
        selectedTypes
    }) {
        if (selectedSources?.length) {
            availableActors = availableActors.filter(x => selectedSources.includes(this.getActorSource(x).toLowerCase()));
        }
        if (!!selectedName) {
            availableActors = availableActors.filter(x => x.name.toLowerCase().includes(selectedName.toLowerCase()));
        }
        if (selectedSizes?.length) {
            availableActors = availableActors.filter(x => {
                if (!!x.system?.details?.size) {
                    return selectedSizes.includes(x.system.details.size.value.toLowerCase());
                }
                return false;
            });
        }
        if (selectedRoles?.length) {
            availableActors = availableActors.filter(x => {
                if (!!x.system?.details?.role) {
                    return selectedRoles.includes(x.system.details.role.value.toLowerCase());
                }
                return false;
            });
        }
        if (selectedTypes?.length) {
            availableActors = availableActors.filter(x => {
                if (!!x.system?.details?.type) {
                    return selectedTypes.includes(x.system.details.type.value.toLowerCase());
                }
                return false;
            });
        }

        return availableActors;
    }

    getActorSource(actor) {
        //console.log(actor.name);
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
        //console.log(actor);
        try {
            let role = 'troop';
            if (actor.system != undefined && actor.system.details != undefined && actor.system.details.role != undefined) {
                role = actor.system.details.role.value.toLowerCase();
            }

            let encounterTier = "adventurer";
            if (partyInfo.averagePartyLevel >= 5) {
                encounterTier = "champion";
            }
            if (partyInfo.averagePartyLevel >= 8) {
                encounterTier = "epic";
            }

            if (role == "mook") {
                return this.getMookEncounterScore(encounterTier, partyInfo.averagePartyLevel, actor);
            }
            else {
                return this.getNormalEncounterScore(encounterTier, partyInfo.averagePartyLevel, actor);
            }
        }
        catch (error) {
            console.error(error);
            return -30;
        }
    }

    getSafeLevel(actor) {
        if (actor.system != undefined && actor.system.details != undefined && actor.system.details.level != undefined) {
            return actor.system.details.level.value;
        }
        return 0;
    }

    getNormalEncounterScore(tier, averageLevel, enemy) {
        let scoreChart = [
            [0.25, 0.50, 0.75, 1.00, 1.50],
            [0.35, 0.70, 1.00, 1.50, 2.00],
            [0.50, 1.00, 1.50, 2.00, 3.00], // Same level
            [0.75, 1.50, 2.25, 3.00, 4.00],
            [1.00, 2.00, 3.00, 4.00, 6.00],
            [1.50, 3.00, 4.50, 5.00, 8.00],
            [2.00, 4.00, 6.00, 6.00, 10.00]
        ];

        let size = 'normal';
        if (enemy.system != undefined && enemy.system.details != undefined && enemy.system.details.size != undefined && enemy.system.details.size != '') {
            size = enemy.system.details.strength.value.toLowerCase();
        }
        let sizeToColumn = {
            "weakling": 0,
            "normal": 1,
            "elite": 2,
            "large": 3,
            "2x": 3,
            "double": 3,
            "double-strength": 3,
            "huge": 4,
            "3x": 4,
            "triple": 4,
            "triple-strength": 4
        };

        let enemyLevel = 1;
        if (enemy.system != undefined && enemy.system.details != undefined && enemy.system.details.level != undefined && enemy.system.details.level != '') {
            enemyLevel = enemy.system.details.level.value;
        }
        let levelDifference = enemyLevel - averageLevel;
        if (tier == "champion") {
            levelDifference--;
        }
        else if (tier == "epic") {
            levelDifference -= 2;
        }
        levelDifference += 2;

        if (levelDifference < 0) {
            log(false, "Enemy too weak!");
            return -20;
        }
        else if (levelDifference > 6) {
            log(false, "Enemy too strong!");
            return -10;
        }
        return scoreChart[levelDifference][sizeToColumn[size]];

    }

    getMookEncounterScore(tier, averageLevel, enemy) {
        let scoreChart = [
            [0.05, 0.10, 0.20, 0.30],
            [.075, 0.15, 0.30, 0.45],
            [0.10, 0.20, 0.40, 0.60], // Same level
            [0.15, 0.30, 0.60, 0.90],
            [0.20, 0.40, 0.80, 1.20],
            [0.30, 0.60, 1.20, 1.80],
            [0.40, 0.80, 1.60, 2.40]
        ];

        let size = 'normal';
        if (enemy.system != undefined && enemy.system.details != undefined && enemy.system.details.size != undefined && enemy.system.details.size != '') {
            size = enemy.system.details.strength.value.toLowerCase()
        }

        let sizeToColumn = {
            "weakling": 0,
            "normal": 1,
            "elite": 2,
            "large": 2,
            "2x": 2,
            "double": 2,
            "double-strength": 2,
            "huge": 3,
            "3x": 3,
            "triple": 3,
            "triple-strength": 3
        };

        let enemyLevel = 1;
        if (enemy.system != undefined && enemy.system.details != undefined && enemy.system.details.level != undefined && enemy.system.details.level != '') {
            enemyLevel = enemy.system.details.level.value;
        }
        let levelDifference = enemyLevel - averageLevel;
        if (tier == "champion") {
            levelDifference--;
        }
        else if (tier == "epic") {
            levelDifference -= 2;
        }
        levelDifference += 2;

        if (levelDifference < 0) {
            console.log("Enemy too weak!");
            return -20;
        }
        else if (levelDifference > 6) {
            console.log("Enemy too strong!");
            return -10;
        }
        return scoreChart[levelDifference][sizeToColumn[size]];
    }

    getDefaultLevelRange(partyInfo, minimumLevel, maximumLevel) {
        let minSelectedLevel = partyInfo.averagePartyLevel - 2;
        if (minSelectedLevel < minimumLevel)
            minSelectedLevel = minimumLevel;

        let maxSelectedLevel = partyInfo.averagePartyLevel + 4;
        if (this.maxSelectedLevel > maximumLevel)
            maxSelectedLevel = maximumLevel;

        return {
            minSelectedLevel: minSelectedLevel,
            maxSelectedLevel: maxSelectedLevel
        }
    }
}
