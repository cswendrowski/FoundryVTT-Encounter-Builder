import ThirteenthAge from "./thirteenth-age.mjs";
import Pathfinder2E from "./pf2e.mjs";
import {CompendiumSettingsForm} from "./CompendiumSettingsForm.js";
import Dnd5e from "./dnd5e.mjs";

const moduleName = "vue-encounter-builder";

Hooks.on('devModeReady', ({registerPackageDebugFlag}) => registerPackageDebugFlag(moduleName));

export function log(force, ...args) {
    try {
        const isDebugging = game.modules.get('_dev-mode')?.api?.getPackageDebugValue(moduleName);

        if (force || isDebugging) {
            console.log(moduleName, '|', ...args);
        }
    } catch (e) { }
}

class EncounterBuilder {
    static init() {
        Dlopen.register('vue-select', {
            scripts: [
                // "https://unpkg.com/classnames@2.2.6/index.js", // can't load it this way because of the classnames/classNames issue in the file definition
                "https://unpkg.com/vue-select@3"
            ],
            styles: [
                "https://unpkg.com/vue-select@3/dist/vue-select.css"
            ],
            dependencies: [],
            init: () => Vue.component("v-select", VueSelect.default)
        });

        Dlopen.register('vue-histogram-slider', {
            scripts: [
                // "https://unpkg.com/classnames@2.2.6/index.js", // can't load it this way because of the classnames/classNames issue in the file definition
                "https://unpkg.com/vue-histogram-slider@0.3.8"
            ],
            styles: [
                "https://unpkg.com/vue-histogram-slider@0.3.8/dist/histogram-slider.css"
            ],
            dependencies: [],
            init: () => Vue.component("histogramslider", window["histogram-slider"])
        });

        Dlopen.register('vue-numeric-input', {
            scripts: [
                // "https://unpkg.com/classnames@2.2.6/index.js", // can't load it this way because of the classnames/classNames issue in the file definition
                "https://unpkg.com/vue-numeric-input"
            ],
            styles: [],
            dependencies: [],
            init: () => Vue.component("vue-numeric-input", window["vue-numeric-input"].default)
        });

        Dlopen.register('vue-loading-spinner', {
            scripts: [
                "https://unpkg.com/vue-loading-spinner@1.0.11/dist/vue-loading-spinner.js"
            ],
            styles: [],
            dependencies: [],
            init: () => Vue.component("pencil", VueLoadingSpinner.Pencil)
        });

        // Define dependency on our own custom vue components for when we need it
        Dlopen.register('vueport-encounter-builder', {
            scripts: "/modules/vue-encounter-builder/dist/vue-components.min.js",
            dependencies: ["vue-select", "vue-histogram-slider", "vue-numeric-input", "vue-loading-spinner"]
        });
    }

    static run() {

        const d = new Dialog({
            title: "Dungeon Moon Encounter Builder",
            content: `<encounter-builder class="vueport-render" dependencies='vueport-encounter-builder'>Loading, please wait...</encounter-builder>`,
            buttons: {}
        },
        {
            height: '800',
            width: 'auto',
            resizable: true,
            popOutModuleDisable: true,
            classes: ["encounter-builder-application", game.system.id]
        }).render(true);
        // Auto resize after 2 seconds
        setTimeout(() => d.setPosition(), 500);
    }
}

Hooks.on('init', () => EncounterBuilder.init());


Hooks.once('ready', function() {
    game.settings.register(moduleName, "nonCompendiumSourceType", {
        name: "Source for non-compendium Actors",
        hint: "When the actor is not from a Compendium, the source will prefer loading from this",
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "worldName": "Name of World",
            "folderName": "Name of Folder, then name of World"
        },
        default: "worldName"
    });

    game.settings.registerMenu(moduleName, 'compendiumSettingsMenu', {
        name: "Loaded Compendiums",
        label: "Which compendiums to load from",
        icon: "fas fa-book",
        type: CompendiumSettingsForm,
        restricted: true
    });

    Array.from(game.packs.entries())
        .filter((x) => x[1].metadata.type == "Actor" && !x[1].metadata.name.includes("baileywiki"))
        .forEach(pack => {
            game.settings.register("vue-encounter-builder", pack[0], {
                scope: 'world',
                config: false,
                type: Boolean,
                default: true
            });
        });

    if (game.system.id == "archmage") {
        window.dungeonMoon = {
            thirteenthAge: new ThirteenthAge()
        };
        log(true, "13th Age Init");
    }
    else if (game.system.id == "pf2e") {
        window.dungeonMoon = {
            pathfinder2E: new Pathfinder2E()
        };
        log(true, "PF2E Init");
    }
    else if (game.system.id == "dnd5e") {
        window.dungeonMoon = {
            dnd5e: new Dnd5e()
        };
        log(true, "DnD5e Init");
    }

    window.dungeonMoon.log = log;

    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(moduleName)) {
        EncounterBuilder.run();
    }
});

Hooks.on('renderCombatTracker', () => {

    if ( !game.user.isGM ) return;

    $("#combat-controls").append(`<a class="dungeon-moon-launcher dungeon-moon-launcher-full">🌑 Dungeon Moon</a>`);
    $("#combat-controls").append(`<a class="dungeon-moon-launcher dungeon-moon-launcher-smol">🌑</a>`);

    $(".dungeon-moon-launcher").on("click", () => {
        EncounterBuilder.run();
    });
    
    if (game.combats.find(x => x.data.scene == game.user.viewedScene)) {
        $(".dungeon-moon-launcher-full").hide();
        $(".dungeon-moon-launcher-smol").show();
    }
});
