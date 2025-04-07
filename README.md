# WhatsApp Group Tag Bot

A simple WhatsApp bot that can tag everyone in a group when someone types "@everyone".

## Features

- Automatically tags all members in a WhatsApp group when someone types "@everyone"
- Easy to set up and use
- Maintains connection and automatically reconnects if disconnected

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the bot in development mode:
   ```bash
   npm run dev
   ```
2. Scan the QR code that appears in the terminal with your WhatsApp mobile app
3. Add the bot to any WhatsApp group
4. Type "@everyone" in the group to tag all members

## Commands

- `npm run dev` - Start the bot in development mode
- `npm run build` - Build the TypeScript code
- `npm start` - Start the bot in production mode

## Notes

- The bot will store authentication information in the `auth_info_baileys` directory
- Make sure to keep this directory secure and don't share it with others
- The bot needs to be an admin in the group to tag everyone 