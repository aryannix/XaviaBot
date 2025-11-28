const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "XaviaTeam",
    nixprefix: true,
    vip: false
}

function onCall({ message }) {
    let uptime = global.msToHMS(process.uptime() * 1000);
    message.reply(uptime);
}


export default {
    config,
    onCall
}
