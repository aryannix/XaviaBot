import { writeFileSync } from "fs";
import { resolve as resolvePath } from "path";

const config = {
    name: "prefix",
    aliases: [],
    version: "1.4",
    credits: "ArYAN",
    permissions: [0],
    cooldowns: 5,
    description: "Change bot prefix in your box chat or system (admin only)",
    usage: "<new prefix> | reset",
    category: "config",
    nixprefix: false
};

const langData = {
    en_US: {
        reset: "Your prefix has been reset to default: {prefix}",
        onlyAdmin: "Only admin can change prefix of system bot",
        confirmGlobal: "Please react to this message to confirm change prefix of system bot",
        confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
        successGlobal: "Changed prefix of system bot to: {newPrefix}",
        successThisThread: "Changed prefix in your box chat to: {newPrefix}",
        myPrefix: "🌐 System prefix: {systemPrefix}\n🛸 Your box chat prefix: {threadPrefix}",
        invalidPrefix: "Please provide a valid prefix"
    }
};

async function onCall({ message, args, getLang, data, userPermissions }) {
    const { threadID, senderID } = message;
    const { Threads } = global.controllers;
    const _thread = data.thread || {};
    
    if (!args[0]) {
        const systemPrefix = global.config.PREFIX || "!";
        const threadPrefix = _thread?.data?.prefix || systemPrefix;
        return message.reply(getLang("myPrefix", { systemPrefix, threadPrefix }));
    }

    if (args[0].toLowerCase() === 'reset') {
        await Threads.update(threadID, { prefix: null }, "data");
        return message.reply(getLang("reset", { prefix: global.config.PREFIX }));
    }

    const newPrefix = args[0];
    const isGlobal = args[1] === "-g";

    if (isGlobal && !userPermissions.includes(2)) {
        return message.reply(getLang("onlyAdmin"));
    }

    const confirmMsg = isGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    
    const sentMsg = await message.reply(confirmMsg);
    
    sentMsg.addReactEvent({
        callback: async ({ message: reactEvent }) => {
            if (reactEvent.userID !== senderID) return;
            
            if (isGlobal) {
                global.config.PREFIX = newPrefix;
                const configPath = resolvePath(global.mainPath, "config", "config.main.json");
                writeFileSync(configPath, JSON.stringify(global.config, null, 4), "utf8");
                return reactEvent.send(getLang("successGlobal", { newPrefix }), reactEvent.threadID);
            } else {
                await Threads.update(threadID, { prefix: newPrefix }, "data");
                return reactEvent.send(getLang("successThisThread", { newPrefix }), reactEvent.threadID);
            }
        },
        author: senderID
    }, 60000);
}

export default {
    config,
    langData,
    onCall
};
