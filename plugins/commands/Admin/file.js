import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve as resolvePath, join } from "path";

const config = {
    name: "file",
    aliases: ["cmdfile", "showcode"],
    version: "1.0.0",
    description: "Show command file code and category",
    usage: "<command name>",
    credits: "Aryan Rayhan",
    permissions: [2],
    cooldown: 5,
    nixprefix: true,
    vip: false
};

const langData = {
    "en_US": {
        "usage": "Usage: file <command name>\nExample: file help",
        "notfound": "Command {name} not found",
        "info": "📁 Command: {name}\n📂 Category: {category}\n📄 File: {filename}\n\n💻 Code:\n{code}"
    }
};

async function onCall({ message, args, getLang }) {
    if (!args[0]) {
        return message.reply(getLang("usage"));
    }

    const searchName = args[0].toLowerCase().replace(".js", "");
    const commandsPath = resolvePath(global.pluginsPath, "commands");
    
    try {
        const categories = readdirSync(commandsPath);
        
        for (const category of categories) {
            const categoryPath = join(commandsPath, category);
            
            try {
                const stat = statSync(categoryPath);
                if (!stat.isDirectory()) continue;
            } catch (e) {
                continue;
            }
            
            const files = readdirSync(categoryPath).filter(f => f.endsWith(".js"));
            
            for (const file of files) {
                const fileName = file.replace(".js", "").toLowerCase();
                
                if (fileName === searchName) {
                    const filePath = join(categoryPath, file);
                    const code = readFileSync(filePath, "utf8");
                    
                    let displayCode = code;
                    if (code.length > 4000) {
                        displayCode = code.substring(0, 4000) + "\n\n... (Code truncated, too long)";
                    }
                    
                    return message.reply(getLang("info", {
                        name: fileName,
                        category: category,
                        filename: file,
                        code: displayCode
                    }));
                }
            }
        }
        
        const cmdConfig = global.plugins.commandsConfig.get(searchName);
        if (cmdConfig) {
            const category = cmdConfig.category;
            const categoryPath = join(commandsPath, category);
            const files = readdirSync(categoryPath).filter(f => f.endsWith(".js"));
            
            for (const file of files) {
                const filePath = join(categoryPath, file);
                const code = readFileSync(filePath, "utf8");
                
                if (code.includes(`name: "${searchName}"`) || code.includes(`name: '${searchName}'`)) {
                    let displayCode = code;
                    if (code.length > 4000) {
                        displayCode = code.substring(0, 4000) + "\n\n... (Code truncated, too long)";
                    }
                    
                    return message.reply(getLang("info", {
                        name: searchName,
                        category: category,
                        filename: file,
                        code: displayCode
                    }));
                }
            }
        }
        
        return message.reply(getLang("notfound", { name: searchName }));
        
    } catch (error) {
        console.error(error);
        return message.reply("Error: " + error.message);
    }
}

export default {
    config,
    langData,
    onCall
};
