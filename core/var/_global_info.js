import { resolve as resolvePath } from "path";
import axios from "axios";

const _global = {
    mainPath: resolvePath(process.cwd()),
    corePath: resolvePath(process.cwd(), "core"),
    cachePath: resolvePath(process.cwd(), "core", "var", "data", "cache"),
    assetsPath: resolvePath(process.cwd(), "core", "var", "assets"),
    config: new Object(),
    modules: new Map(),
    getLang: null,
    // Plugins:
    pluginsPath: resolvePath(process.cwd(), "plugins"),
    plugins: new Object({
        commands: new Map(),
        commandsAliases: new Map(),
        commandsConfig: new Map(),
        customs: new Number(0),
        events: new Map(),
        onMessage: new Map(),
    }),
    client: new Object({
        cooldowns: new Map(),
        replies: new Map(),
        reactions: new Map(),
    }),
    // Data
    data: new Object({
        models: new Object(),
        users: new Map(),
        threads: new Map(),
        langPlugin: new Object(),
        langSystem: new Object(),
        messages: new Array(),
        temps: new Array(),
    }),
    listenMqtt: null,
    api: null,
    botID: null,
    updateJSON: null,
    updateMONGO: null,
    controllers: null,
    xva_api: null,
    xva_ppi: null,
    server: null,
    refreshState: null,
    refreshMqtt: null,
    mongo: null,
    restart: restart,
    shutdown: shutdown,
    maintain: false,
};

function _change_prototype_DATA(data) {
    data.users.set = function (key, value) {
        value.lastUpdated = Date.now();
        return Map.prototype.set.call(this, key, value);
    };

