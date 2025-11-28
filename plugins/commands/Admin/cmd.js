import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve as resolvePath, join } from "path";
import { pathToFileURL } from "url";

const config = {
    name: "cmd",
    aliases: ["command", "plugin"],
    version: "1.0.0",
    description: "Manage bot commands - install, load, loadall, unload",
    usage: "<install|load|loadall|unload> [command name] [code]",
    credits: "Aryan Rayhan",
    permissions: [2],
    cooldown: 3,
    nixprefix: true,
    vip: false
};

const langData = {
    "en_US": {
        "usage": "Usage:\n• cmd install <name.js> <code>\n• cmd load <name>\n• cmd loadall\n• cmd unload <name>",
        "install.success": "Successfully installed command: {name}",
        "install.failed": "Failed to install command: {error}",
        "load.success": "Successfully loaded command: {name}",
        "load.failed": "Failed to load command: {error}",
        "loadall.success": "Successfully loaded {count} commands",
        "loadall.failed": "Failed to load some commands",
        "unload.success": "Successfully unloaded command: {name}",
        "unload.notfound": "Command {name} not found or not loaded"
    },
    "vi_VN": {
        "usage": "Cách sử dụng:\n• cmd install <tên.js> <code>\n• cmd load <tên>\n• cmd loadall\n• cmd unload <tên>",
        "install.success": "Đã cài đặt lệnh: {name}",
        "install.failed": "Không thể cài đặt lệnh: {error}",
        "load.success": "Đã tải lệnh: {name}",
        "load.failed": "Không thể tải lệnh: {error}",
        "loadall.success": "Đã tải {count} lệnh",
        "loadall.failed": "Không thể tải một số lệnh",
        "unload.success": "Đã gỡ lệnh: {name}",
        "unload.notfound": "Không tìm thấy lệnh {name}"
    },
    "ar_SY": {
        "usage": "الاستخدام:\n• cmd install <اسم.js> <كود>\n• cmd load <اسم>\n• cmd loadall\n• cmd unload <اسم>",
        "install.success": "تم تثبيت الأمر بنجاح: {name}",
        "install.failed": "فشل تثبيت الأمر: {error}",
        "load.success": "تم تحميل الأمر بنجاح: {name}",
        "load.failed": "فشل تحميل الأمر: {error}",
        "loadall.success": "تم تحميل {count} أوامر",
        "loadall.failed": "فشل تحميل بعض الأوامر",
        "unload.success": "تم إلغاء تحميل الأمر بنجاح: {name}",
        "unload.notfound": "الأمر {name} غير موجود"
    }
};

const tempCommands = new Map();

async function onCall({ message, args, getLang }) {
    try {
        // Safety check for args
        if (!args || !Array.isArray(args) || args.length === 0) {
            return message.reply(getLang("usage"));
        }
        
        const action = args[0]?.toLowerCase();
        
        if (!action || !["install", "load", "loadall", "unload"].includes(action)) {
            return message.reply(getLang("usage"));
        }

        const { api } = global;

        switch (action) {
        case "install": {
            if (!args[1] || args.length < 3) {
                return message.reply("Usage: cmd install <filename.js> <code>\nExample: cmd install test.js const config = {...}");
            }
            
            const fileName = args[1];
            if (!fileName || !fileName.endsWith(".js")) {
                return message.reply("File name must end with .js");
            }
            
            const code = args.slice(2).join(" ");
            if (!code || code.trim().length === 0) {
                return message.reply("Please provide code for the command");
            }
            
            try {
                const commandName = fileName.replace(".js", "").toLowerCase();
                const cacheDir = resolvePath(global.pluginsPath, "commands", "cache");
                const filePath = join(cacheDir, fileName);
                
                writeFileSync(filePath, code, "utf8");
                
                const pluginURL = pathToFileURL(filePath);
                pluginURL.searchParams.set("version", Date.now());
                
                let pluginExport = await import(pluginURL);
                pluginExport = pluginExport.default || pluginExport;
                
                if (typeof pluginExport === "object" && pluginExport.onCall) {
                    const cmdConfig = pluginExport.config || { name: commandName, aliases: [commandName] };
                    cmdConfig.category = "cache";
                    
                    tempCommands.set(commandName, {
                        onCall: pluginExport.onCall,
                        config: cmdConfig,
                        filePath: filePath
                    });
                    
                    global.plugins.commands.set(cmdConfig.name, pluginExport.onCall);
                    global.plugins.commandsConfig.set(cmdConfig.name, cmdConfig);
                    global.plugins.commandsAliases.set(cmdConfig.name, cmdConfig.aliases || [cmdConfig.name]);
                    
                    return message.reply(getLang("install.success", { name: fileName }));
                } else {
                    return message.reply("Invalid command format. Command must export config and onCall.");
                }
            } catch (error) {
                console.error(error);
                return message.reply(getLang("install.failed", { error: error.message }));
            }
        }

        case "load": {
            if (!args[1]) {
                return message.reply("Usage: cmd load <command name>");
            }
            
            const commandName = args[1].toLowerCase().replace(".js", "");
            
            try {
                const commandsPath = resolvePath(global.pluginsPath, "commands");
                const categories = readdirSync(commandsPath);
                let found = false;
                
                for (const category of categories) {
                    const categoryPath = join(commandsPath, category);
                    if (!existsSync(categoryPath)) continue;
                    
                    const files = readdirSync(categoryPath);
                    const targetFile = files.find(f => f.toLowerCase().replace(".js", "") === commandName);
                    
                    if (targetFile) {
                        const filePath = join(categoryPath, targetFile);
                        const pluginURL = pathToFileURL(filePath);
                        pluginURL.searchParams.set("version", Date.now());
                        
                        let pluginExport = await import(pluginURL);
                        pluginExport = pluginExport.default || pluginExport;
                        
                        if (typeof pluginExport === "object" && pluginExport.onCall) {
                            const cmdConfig = pluginExport.config || { name: commandName, aliases: [commandName] };
                            cmdConfig.category = category;
                            
                            global.plugins.commands.set(cmdConfig.name, pluginExport.onCall);
                            global.plugins.commandsConfig.set(cmdConfig.name, cmdConfig);
                            global.plugins.commandsAliases.set(cmdConfig.name, cmdConfig.aliases || [cmdConfig.name]);
                            
                            found = true;
                            break;
                        }
                    }
                }
                
                if (found) {
                    return message.reply(getLang("load.success", { name: commandName }));
                } else {
                    return message.reply(getLang("load.failed", { error: "Command file not found" }));
                }
            } catch (error) {
                console.error(error);
                return message.reply(getLang("load.failed", { error: error.message }));
            }
        }

        case "loadall": {
            try {
                const commandsPath = resolvePath(global.pluginsPath, "commands");
                const categories = readdirSync(commandsPath);
                let loadedCount = 0;
                
                for (const category of categories) {
                    if (category === "cache" || category === "template" || category === "example") continue;
                    
                    const categoryPath = join(commandsPath, category);
                    if (!existsSync(categoryPath)) continue;
                    
                    const files = readdirSync(categoryPath).filter(f => f.endsWith(".js"));
                    
                    for (const file of files) {
                        try {
                            const filePath = join(categoryPath, file);
                            const pluginURL = pathToFileURL(filePath);
                            pluginURL.searchParams.set("version", Date.now());
                            
                            let pluginExport = await import(pluginURL);
                            pluginExport = pluginExport.default || pluginExport;
                            
                            if (typeof pluginExport === "object" && pluginExport.onCall) {
                                const commandName = file.replace(".js", "").toLowerCase();
                                const cmdConfig = pluginExport.config || { name: commandName, aliases: [commandName] };
                                cmdConfig.category = category;
                                
                                global.plugins.commands.set(cmdConfig.name, pluginExport.onCall);
                                global.plugins.commandsConfig.set(cmdConfig.name, cmdConfig);
                                global.plugins.commandsAliases.set(cmdConfig.name, cmdConfig.aliases || [cmdConfig.name]);
                                loadedCount++;
                            }
                        } catch (e) {
                            console.error(`Failed to load ${file}:`, e);
                        }
                    }
                }
                
                return message.reply(getLang("loadall.success", { count: loadedCount }));
            } catch (error) {
                console.error(error);
                return message.reply(getLang("loadall.failed"));
            }
        }

        case "unload": {
            if (!args[1]) {
                return message.reply("Usage: cmd unload <command name>");
            }
            
            const commandName = args[1].toLowerCase().replace(".js", "");
            
            if (global.plugins.commands.has(commandName)) {
                global.plugins.commands.delete(commandName);
                global.plugins.commandsConfig.delete(commandName);
                global.plugins.commandsAliases.delete(commandName);
                
                if (tempCommands.has(commandName)) {
                    tempCommands.delete(commandName);
                }
                
                return message.reply(getLang("unload.success", { name: commandName }));
            } else {
                return message.reply(getLang("unload.notfound", { name: commandName }));
            }
        }
        }
    } catch (error) {
        console.error("CMD Error:", error);
        return message.reply(`Error: ${error.message || "Unknown error occurred"}`);
    }
}

export default {
    config,
    langData,
    onCall
};
