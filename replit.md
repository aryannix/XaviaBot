# Xavia Bot - Facebook Messenger Bot

## Overview
এটি একটি Facebook Messenger Bot যা fca-aryan package ব্যবহার করে তৈরি। এই বটে nixprefix system, VIP system, এবং dynamic command management রয়েছে।

## Recent Changes (November 2025)
- Migrated from @xaviabot/fca-unofficial to fca-aryan package
- Added nix/colors.js for console color management
- Implemented nixprefix (noprefix) system
- Implemented VIP user system
- Created cmd command for dynamic command management
- Created file command to display command source code
- Enhanced console output with colored BOT INFO and OWNER INFO

## Project Structure
```
├── config/
│   ├── config.main.json    # Main configuration (PREFIX, VIP, OWNER, etc.)
│   └── ...
├── core/
│   ├── _build.js           # Main build file with bot info display
│   ├── handlers/
│   │   └── events.js       # Event handler with nixprefix & VIP logic
│   └── var/modules/
│       └── loader.js       # Command loader with colored output
├── nix/
│   └── colors.js           # Console color utilities
├── plugins/
│   └── commands/
│       ├── Admin/
│       │   ├── cmd.js      # Dynamic command management
│       │   └── file.js     # Show command source code
│       └── ...
```

## Features

### 1. nixprefix System
Commands can work without prefix when `nixprefix: true` is set in config:
```javascript
const config = {
    name: "test",
    nixprefix: true,  // Command works without prefix
    // ...
};
```

### 2. VIP System
Restrict commands to VIP users only:
```javascript
const config = {
    name: "premium",
    vip: true,  // Only VIP users can use this command
    // ...
};
```
VIP UIDs are set in `config/config.main.json`:
```json
{
    "VIP": ["100000000000000", "200000000000000"]
}
```

### 3. cmd Command (Admin Only)
- `cmd install <filename.js> <code>` - Install new command
- `cmd load <command name>` - Load/reload a command
- `cmd loadall` - Reload all commands
- `cmd unload <command name>` - Unload a command

### 4. file Command (Admin Only)
- `file <command name>` - Show command source code

## Configuration
Edit `config/config.main.json`:
```json
{
    "PREFIX": "x",
    "NAME": "Xavia Bot",
    "OWNER": "Aryan Rayhan",
    "OWNER_NOTE": "enjoy Xavia bot",
    "VIP": ["uid1", "uid2"],
    "UNSEND": {
        "enabled": true,
        "emoji": "😠"
    }
}
```

### 5. Unsend Reaction Feature
Admin/Moderator can react with 😠 emoji on bot's message to unsend it:
- `UNSEND.enabled: true` - Enable unsend feature
- `UNSEND.enabled: false` - Disable unsend feature
- `UNSEND.emoji` - Emoji to trigger unsend (default: 😠)

### Important Notes
- OWNER field is **required** - bot won't start without it
- If OWNER is removed from config, bot will show error and stop

## Setup
1. Add your Facebook appstate to `config/appstate.json`
2. Update `config/config.main.json` with your settings
3. Run `node index.js`

## Console Output
The bot displays colored console output:
- Cyan: BOT INFO section
- Magenta: OWNER INFO section
- Yellow: Command names
- Green: Success messages

## User Preferences
- Language: Bengali/Bangla
- VIP error message: "𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫"
