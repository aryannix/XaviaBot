const config = {
    name: "ping",
    aliases: ["p"],
    description: "Check bot response time",
    credits: "XaviaTeam",
    nixprefix: true,
    vip: false
};

function onCall({ message }) {
    let timeStart = Date.now();
    message.send('').catch(_ => {
        let timeEnd = Date.now();
        message.reply(`Pong! ${timeEnd - timeStart}ms`);
    })
}

export default {
    config,
    onCall
};
