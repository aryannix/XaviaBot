import { writeFileSync } from "fs";
import { resolve as resolvePath } from "path";
import replitDB from "@replit/database";
import environments from "../var/modules/environments.get.js";

const { isGlitch, isReplit } = environments;
const _20_MINUTES = 1000 * 60 * 20; // 20 minutes in milliseconds

/**
 * Refresh appstate.json cookies every 20 minutes
 * This ensures the Facebook session stays fresh and prevents login issues
 */
export default function startAppstateRefresh() {
    const logger = global.modules.get('logger');
    
    // Start the refresh interval
    global.appstateRefreshInterval = setInterval(() => {
        try {
            logger.custom("Refreshing appstate cookies...", "REFRESH");
            const newAppState = global.api.getAppState();
            
            if (global.config.APPSTATE_PROTECTION === true) {
                if (isGlitch) {
                    writeFileSync(
                        resolvePath(process.cwd(), ".data", "appstate.json"), 
                        JSON.stringify(newAppState, null, 2), 
                        "utf-8"
                    );
                    logger.custom("Appstate refreshed successfully (Glitch)", "REFRESH");
                } else if (isReplit) {
                    let db = new replitDB();
                    db.get("APPSTATE_SECRET_KEY")
                        .then((APPSTATE_SECRET_KEY) => {
                            if (APPSTATE_SECRET_KEY !== null) {
                                const encryptedAppState = global.modules.get("aes").encrypt(
                                    JSON.stringify(newAppState), 
                                    APPSTATE_SECRET_KEY
                                );
                                writeFileSync(
                                    resolvePath(global.config.APPSTATE_PATH), 
                                    JSON.stringify(encryptedAppState), 
                                    "utf8"
                                );
                                logger.custom("Appstate refreshed successfully (Encrypted)", "REFRESH");
                            }
                        })
                        .catch((err) => {
                            logger.error("Failed to refresh appstate: " + err);
                        });
                } else {
                    writeFileSync(
                        resolvePath(global.config.APPSTATE_PATH), 
                        JSON.stringify(newAppState, null, 2), 
                        "utf8"
                    );
                    logger.custom("Appstate refreshed successfully", "REFRESH");
                }
            } else {
                // No protection, save directly
                writeFileSync(
                    resolvePath(global.config.APPSTATE_PATH), 
                    JSON.stringify(newAppState, null, 2), 
                    "utf8"
                );
                logger.custom("Appstate refreshed successfully (No encryption)", "REFRESH");
            }
        } catch (err) {
            logger.error("Error refreshing appstate: " + err);
        }
    }, _20_MINUTES);
    
    logger.custom("Appstate auto-refresh started (every 20 minutes)", "REFRESH");
}

/**
 * Stop the appstate refresh interval
 */
export function stopAppstateRefresh() {
    if (global.appstateRefreshInterval) {
        clearInterval(global.appstateRefreshInterval);
        global.appstateRefreshInterval = null;
    }
}
