import { 
    makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { mkdirSync, existsSync, rmSync } from 'fs';
import pino from 'pino';

// Create the auth directory if it doesn't exist
const AUTH_DIR = 'auth_info_baileys';

// Clear existing auth state if it exists
if (existsSync(AUTH_DIR)) {
    console.log('Clearing existing authentication state...');
    rmSync(AUTH_DIR, { recursive: true, force: true });
}

console.log(`Creating fresh auth directory: ${AUTH_DIR}`);
mkdirSync(AUTH_DIR, { recursive: true });

// Configure logger
const logger = pino({ level: 'debug' });

async function connectToWhatsApp() {
    console.log('Initializing WhatsApp connection...');
    try {
        // Load authentication state
        console.log('Loading authentication state...');
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        
        console.log('Authentication state loaded successfully');
        console.log('Creating WhatsApp socket...');

        // Create WhatsApp socket with logging
        const sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: logger,
            defaultQueryTimeoutMs: undefined
        });
        
        console.log('WhatsApp socket created');

        // Handle authentication updates
        sock.ev.on('creds.update', saveCreds);

        // Handle connection updates
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('QR Code received. Please scan it with your WhatsApp app');
            }
            
            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                console.log(`Connection closed with status code: ${statusCode}`);
                
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                console.log('Reason for disconnection: ', lastDisconnect?.error);
                console.log('Should reconnect: ', shouldReconnect);
                
                if (shouldReconnect) {
                    console.log('Attempting to reconnect...');
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    console.log('Not reconnecting because user logged out');
                }
            } else if (connection === 'open') {
                console.log('Connection opened successfully');
                console.log('Bot is now online and ready to use');
            } else {
                console.log('Connection status:', connection);
            }
        });

        // Handle incoming messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            console.log('New message event received');
            
            for (const message of messages) {
                try {
                    if (!message.key || !message.key.remoteJid || !message.message) {
                        continue;
                    }
                    
                    const chatId = message.key.remoteJid;
                    
                    // Only process group messages
                    if (chatId.endsWith('@g.us')) {
                        // Extract message text
                        let messageText = '';
                        const msg = message.message;
                        
                        if (msg.conversation) {
                            messageText = msg.conversation;
                        } else if (msg.extendedTextMessage?.text) {
                            messageText = msg.extendedTextMessage.text;
                        }
                        
                        // Check if the message is "@everyone"
                        if (messageText.trim().toLowerCase() === '@everyone') {
                            try {
                                // Get group participants
                                const groupMetadata = await sock.groupMetadata(chatId);
                                const participants = groupMetadata.participants;
                                
                                // Create mention text for all participants
                                const mentions = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');
                                
                                // Send message with mentions
                                await sock.sendMessage(chatId, {
                                    text: mentions,
                                    mentions: participants.map(p => p.id)
                                });
                                
                                console.log('Successfully tagged everyone');
                            } catch (error) {
                                console.error('Error tagging everyone:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        });
        
        return sock;
    } catch (error) {
        console.error('Error in connectToWhatsApp function:', error);
        throw error;
    }
}

// Start the bot
console.log('Starting WhatsApp Tag Bot...');
connectToWhatsApp()
    .then(() => console.log('Bot initialization complete'))
    .catch(err => {
        console.error('Fatal error starting bot:', err);
    }); 