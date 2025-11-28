
import axios from "axios";
import { createReadStream, createWriteStream, unlinkSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import ytSearch from "yt-search";

const config = {
    name: "sing",
    aliases: ["music", "song", "play"],
    version: "2.0.1",
    permissions: [0, 1, 2],
    credits: "ArYAN (Xavia Compatible)",
    description: "Search and download music from YouTube",
    usage: "[song name or YouTube URL]",
    cooldown: 10,
    nixprefix: true,
    vip: false,
};

const langData = {
    "en_US": {
        "sing.noInput": "❌ Please provide a song name or YouTube URL.",
        "sing.searching": "🎵 Searching for music, please wait...",
        "sing.downloading": "⏬ Downloading: {title}",
        "sing.success": "🎵 𝗠𝗨𝗦𝗜𝗖\n━━━━━━━━━━━━━━━\n\n{title}",
        "sing.noResults": "❌ No results found for: {query}",
        "sing.error": "❌ Failed to download song: {error}",
        "sing.apiError": "❌ API failed to return download URL.",
    },
    "vi_VN": {
        "sing.noInput": "❌ Vui lòng cung cấp tên bài hát hoặc URL YouTube.",
        "sing.searching": "🎵 Đang tìm kiếm nhạc, vui lòng đợi...",
        "sing.downloading": "⏬ Đang tải: {title}",
        "sing.success": "🎵 𝗠𝗨𝗦𝗜𝗖\n━━━━━━━━━━━━━━━\n\n{title}",
        "sing.noResults": "❌ Không tìm thấy kết quả cho: {query}",
        "sing.error": "❌ Không thể tải bài hát: {error}",
        "sing.apiError": "❌ API không trả về URL tải xuống.",
    },
};

async function onCall({ message, args, getLang }) {
    if (!args || args.length === 0) {
        return message.reply(getLang("sing.noInput"));
    }

    const query = args.join(" ");
    const waitMsg = await message.reply(getLang("sing.searching"));

    try {
        let videoUrl;

        // Check if input is a YouTube URL
        if (query.startsWith("http://") || query.startsWith("https://")) {
            videoUrl = query;
        } else {
            // Search on YouTube
            const searchResults = await ytSearch(query);
            if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
                message.unsend(waitMsg.messageID);
                return message.reply(getLang("sing.noResults", { query }));
            }
            videoUrl = searchResults.videos[0].url;
        }

        // Download from API
        const apiUrl = `http://65.109.80.126:20409/aryan/play?url=${encodeURIComponent(videoUrl)}`;
        const apiResponse = await axios.get(apiUrl, { timeout: 30000 });
        const { status, downloadUrl, title } = apiResponse.data;

        if (!status || !downloadUrl) {
            throw new Error(getLang("sing.apiError"));
        }

        // Update waiting message
        message.edit(getLang("sing.downloading", { title }), waitMsg.messageID);

        // Create cache directory if it doesn't exist
        const cachePath = join(process.cwd(), "plugins", "commands", "cache");
        if (!existsSync(cachePath)) {
            mkdirSync(cachePath, { recursive: true });
        }

        // Create safe filename
        const safeTitle = title.replace(/[\\/:"*?<>|]/g, "").substring(0, 100);
        const fileName = `${Date.now()}_${safeTitle}.mp3`;
        const filePath = join(cachePath, fileName);

        // Download audio file
        const audioResponse = await axios.get(downloadUrl, { 
            responseType: "stream",
            timeout: 60000
        });
        
        const writer = createWriteStream(filePath);
        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        // Send audio file
        await message.reply({
            body: getLang("sing.success", { title }),
            attachment: createReadStream(filePath),
        });

        // Cleanup
        message.unsend(waitMsg.messageID);
        
        // Delete file after a short delay
        setTimeout(() => {
            if (existsSync(filePath)) {
                try {
                    unlinkSync(filePath);
                } catch (err) {
                    console.error("Failed to delete file:", err);
                }
            }
        }, 5000);

    } catch (error) {
        console.error("Sing command error:", error);
        message.unsend(waitMsg.messageID);
        return message.reply(getLang("sing.error", { error: error.message || "Unknown error" }));
    }
}

export default {
    config,
    langData,
    onCall,
};
