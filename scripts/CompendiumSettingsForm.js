export class CompendiumSettingsForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dungeon-moon-compendium-settings-form",
            title: "Compendiums to Load",
            template: "./modules/vue-encounter-builder/templates/compendium-settings.hbs",
            classes: ["sheet"],
            width: 500,
            height: 500,
            closeOnSubmit: true,
            submitOnClose: true
        });
    }

    /** @override */
    getData(options) {
        return {
            compendiums: Array.from(game.packs.entries())
                .filter((x) => x[1].metadata.entity == "Actor" && !x[1].metadata.name.includes("baileywiki"))
                .map(x => {
                    return {
                        name: x[0],
                        label: x[1].metadata.label,
                        value: game.settings.get("vue-encounter-builder", x[0])
                    };
                })
        };
    }

    async _updateObject(event, data) {
        console.log(data);
        Object.keys(data).forEach(key => {
           game.settings.set("vue-encounter-builder", key, data[key]);
        });
    }
}
