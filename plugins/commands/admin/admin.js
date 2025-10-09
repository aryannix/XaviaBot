import { writeFileSync, readFileSync } from "fs";
import { resolve as resolvePath } from "path";

const config = {
    name: "admin",
    aliases: ["adm"],
    version: "0.0.1",
    description: "Add, remove, or list bot admins",
    usage: "[add | remove | list] <uid | @tag>",
    permissions: [2],
    credits: "ArYAN",
    cooldowns: 5,
    category: "admin"
};

const langData = {
    en_US: {
        added: "✅ Added admin role for {count} user(s):\n{list}",
        alreadyAdmin: "\n⚠️ {count} user(s) already have admin role:\n{list}",
        missingIdAdd: "⚠️ Please provide user ID or tag to add admin role",
        removed: "✅ Removed admin role from {count} user(s):\n{list}",
        notAdmin: "⚠️ {count} user(s) don't have admin role:\n{list}",
        missingIdRemove: "⚠️ Please provide user ID or tag to remove admin role",
        listAdmin: "👑 List of bot admins:\n{list}",
        invalidSyntax: "Invalid syntax. Use: {prefix}admin [add|remove|list] <uid | @tag>"
    },
    vi_VN: {
        added: "✅ Đã thêm quyền admin cho {count} người dùng:\n{list}",
        alreadyAdmin: "\n⚠️ {count} người dùng đã có quyền admin:\n{list}",
        missingIdAdd: "⚠️ Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
        removed: "✅ Đã xóa quyền admin của {count} người dùng:\n{list}",
        notAdmin: "⚠️ {count} người dùng không có quyền admin:\n{list}",
        missingIdRemove: "⚠️ Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
        listAdmin: "👑 Danh sách admin:\n{list}",
        invalidSyntax: "Cú pháp không hợp lệ. Sử dụng: {prefix}admin [add|remove|list] <uid | @tag>"
    }
};

async function onCall({ message, args, getLang, prefix }) {
    const configPath = resolvePath(process.cwd(), "config", "config.main.json");
    const mainConfig = JSON.parse(readFileSync(configPath, "utf8"));
    mainConfig.MODERATORS = mainConfig.MODERATORS || [];

    switch (args[0]?.toLowerCase()) {
        case "add":
        case "-a": {
            if (!args[1]) return message.reply(getLang("missingIdAdd"));

            let uids = [];
            if (Object.keys(message.mentions || {}).length > 0) {
                uids = Object.keys(message.mentions);
            } else if (message.messageReply) {
                uids.push(message.messageReply.senderID);
            } else {
                uids = args.slice(1).filter(arg => !isNaN(arg));
            }

            const notAdminIds = [];
            const adminIds = [];

            for (const uid of uids) {
                if (mainConfig.MODERATORS.includes(uid)) {
                    adminIds.push(uid);
                } else {
                    notAdminIds.push(uid);
                    mainConfig.MODERATORS.push(uid);
                }
            }

            writeFileSync(configPath, JSON.stringify(mainConfig, null, 4));
            global.config.MODERATORS = mainConfig.MODERATORS;

            let response = "";
            if (notAdminIds.length > 0) {
                response += getLang("added", { count: notAdminIds.length, list: notAdminIds.map(uid => `• ${uid}`).join("\n") });
            }
            if (adminIds.length > 0) {
                response += getLang("alreadyAdmin", { count: adminIds.length, list: adminIds.map(uid => `• ${uid}`).join("\n") });
            }
            return message.reply(response || "No changes made");
        }

        case "remove":
        case "-r": {
            if (!args[1]) return message.reply(getLang("missingIdRemove"));

            let uids = [];
            if (Object.keys(message.mentions || {}).length > 0) {
                uids = Object.keys(message.mentions);
            } else if (message.messageReply) {
                uids.push(message.messageReply.senderID);
            } else {
                uids = args.slice(1).filter(arg => !isNaN(arg));
            }

            const notAdminIds = [];
            const adminIds = [];

            for (const uid of uids) {
                if (mainConfig.MODERATORS.includes(uid)) {
                    adminIds.push(uid);
                    mainConfig.MODERATORS = mainConfig.MODERATORS.filter(id => id !== uid);
                } else {
                    notAdminIds.push(uid);
                }
            }

            writeFileSync(configPath, JSON.stringify(mainConfig, null, 4));
            global.config.MODERATORS = mainConfig.MODERATORS;

            let response = "";
            if (adminIds.length > 0) {
                response += getLang("removed", { count: adminIds.length, list: adminIds.map(uid => `• ${uid}`).join("\n") });
            }
            if (notAdminIds.length > 0) {
                response += getLang("notAdmin", { count: notAdminIds.length, list: notAdminIds.map(uid => `• ${uid}`).join("\n") });
            }
            return message.reply(response || "No changes made");
        }

        case "list":
        case "-l": {
            const admins = mainConfig.MODERATORS || [];
            if (admins.length === 0) return message.reply("No bot admins configured.");
            return message.reply(getLang("listAdmin", { list: admins.map(uid => `• ${uid}`).join("\n") }));
        }

        default:
            return message.reply(getLang("invalidSyntax", { prefix }));
    }
}

export default {
    config,
    langData,
    onCall
};
