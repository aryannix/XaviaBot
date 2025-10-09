function checkBanStatus(data = {}, userID) {
    if (
        data?.user?.banned === true ||
        data?.thread?.banned === true ||
        data?.thread?.info?.members?.find((e) => e.userID == userID)?.banned === true
    )
        return true;

    return false;
}

function getUserPermissions(userID, _thread) {
    const { MODERATORS } = global.config;
    const adminIDs = _thread?.adminIDs || [];

    let permissions = [0];

    if (adminIDs.some((e) => e == userID)) permissions.push(1);
    if (MODERATORS.includes(userID)) permissions.push(2);

    return permissions;
}

function checkPermission(permissions, userPermissions) {
    if (permissions.length === 0 || userPermissions.length === 0) return false;

    return permissions.some((permission) =>
        userPermissions.includes(permission)
    );
}

async function onCall(methods) {
    const { commands, commandsConfig, commandsAliases } = global.plugins;
    const { message } = methods;
    const { threadID, messageID, senderID, args, isGroup } = message;
    const { Threads, Users } = global.controllers;
    const { api, getLang } = global;
    
    if (!args || args.length === 0) return;
    
    const called = args[0]?.toLowerCase();
    
    let commandName = null;
    
    for (const [name, config] of commandsConfig.entries()) {
        if (config.nixprefix === true) {
            if (name === called) {
                commandName = name;
                break;
            }
            if (config.aliases && config.aliases.includes(called)) {
                commandName = name;
                break;
            }
        }
    }
    
    if (!commandName) return;
    
    const command = commands.get(commandName);
    if (!command) return;
    
    const _thread = isGroup === true ? (await Threads.get(threadID)) || {} : {};
    const _user = (await Users.get(senderID)) || {};
    
    const data = { thread: _thread, user: _user };
    if (checkBanStatus(data, senderID)) return;
    
    const commandInfo = commandsConfig.get(commandName);
    const { cooldowns } = global.client;
    const permissions = commandInfo.permissions || [0];
    const userPermissions = getUserPermissions(senderID, _thread?.info);
    const isAbsoluteUser = global.config?.ABSOLUTES?.some((e) => e == senderID);
    const checkAbsolute = !!commandInfo.isAbsolute ? isAbsoluteUser : true;
    const isValidUser = checkPermission(permissions, userPermissions) && checkAbsolute;
    
    if (!isValidUser) {
        return;
    }
    
    const userCooldown = cooldowns.get(senderID) || {};
    const isReady = !userCooldown[commandName] || Date.now() - userCooldown[commandName] >= (commandInfo.cooldown || 3) * 1000;
    
    if (!isReady) {
        api.setMessageReaction("🕓", messageID, null, true);
        return;
    }
    
    const isNSFWEnabled = _thread?.data?.nsfw === true;
    const isCommandNSFW = commandInfo.nsfw === true;
    
    if (!((isNSFWEnabled && isCommandNSFW) || !isCommandNSFW || isGroup === false)) {
        api.sendMessage(getLang("handlers.commands.nsfwNotAllowed"), threadID, messageID);
        return;
    }
    
    userCooldown[commandName] = Date.now();
    cooldowns.set(senderID, userCooldown);
    
    let TLang = _thread?.data?.language || global.config.LANGUAGE || "en_US";
    const getLangForCommand = (key, objectData) => getLang(key, objectData, commandName, TLang);
    
    const prefix = (_thread?.data?.prefix || global.config.PREFIX || "x").trim().toLowerCase();
    
    methods.args = args.slice(1);
    methods.getLang = getLangForCommand;
    methods.extra = commandInfo.extra || {};
    methods.data = data;
    methods.userPermissions = userPermissions;
    methods.prefix = prefix;
    
    try {
        command(methods);
    } catch (err) {
        console.error(err);
        api.sendMessage(
            getLang("handlers.default.error", {
                error: String(err.message || err),
            }),
            threadID,
            messageID
        );
    }
}

export default {
    onCall
};
