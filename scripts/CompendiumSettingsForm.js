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
            compendiums: game.packs
                .filter((x) => x.metadata.entity == "Actor" && !x.metadata.name.includes("baileywiki"))
                .map(x => {
                    return {
                        name: x.metadata.name,
                        label: x.metadata.label,
                        value: game.settings.get("vue-encounter-builder", x.metadata.name)
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
