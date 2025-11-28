const config = {
    name: "tid",
    description: "Get thread ID",
    credits: "XaviaTeam",
    nixprefix: true,
    vip: false
};

function onCall({ message }) {
    message.reply(message.threadID);
}

export default {
    config,
    onCall
};
