async function onCall({ message }) {
    const { threadID, body, isGroup } = message;
    const { Threads } = global.controllers;
    
    if (!body || body.toLowerCase() !== "prefix") return;
    
    const _thread = isGroup === true ? (await Threads.get(threadID)) || {} : {};
    const systemPrefix = global.config.PREFIX || "!";
    const threadPrefix = _thread?.data?.prefix || systemPrefix;
    
    message.reply(`🌐 System prefix: ${systemPrefix}\n🛸 Your box chat prefix: ${threadPrefix}`);
}

export default {
    onCall
};
