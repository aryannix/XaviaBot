const config = {
    name: "waifu",
    description: "Are you my waifu?",
    cooldown: 3,
    credits: "XaviaTeam",
    nixprefix: true,
    vip: false
};

function onCall({ message }) {
    global.random(0, 5) === 3 ? message.reply("Love you bakaaa >w<") : message.reply("We are just friends 😔");
}

export default {
    config,
    onCall
};
