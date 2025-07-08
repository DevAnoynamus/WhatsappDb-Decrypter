import { GET_CHATS_QUERY, GET_MESSAGES_QUERY } from '../constants';
import type { Chat, Message, DecryptedData } from '../types';

declare const pako: any;
declare const initSqlJs: any;

let db: any = null;

async function getDb(dbBuffer: Uint8Array) {
    if (!db) {
        const SQL = await initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database(dbBuffer);
    }
    return db;
}

async function decryptBackupFile(keyFileBuffer: ArrayBuffer, dbFileBuffer: ArrayBuffer): Promise<Uint8Array> {
    if (keyFileBuffer.byteLength !== 158) {
        throw new Error('Invalid key file: Must be 158 bytes long.');
    }

    const key = await window.crypto.subtle.importKey(
        'raw',
        keyFileBuffer.slice(126, 158), // Main AES key
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    // IV and Ciphertext offsets for different crypt versions.
    // We try them in order of likelihood.
    const versions = [
        { name: 'crypt14/15', ivOffset: 67, ivLength: 16, ciphertextOffset: 83 },
        { name: 'crypt12', ivOffset: 51, ivLength: 16, ciphertextOffset: 67 },
    ];

    let lastError: unknown = null;
    for (const version of versions) {
        // Ensure file is large enough for this version's header and a 16-byte auth tag
        if (dbFileBuffer.byteLength < version.ciphertextOffset + 16) {
            continue;
        }
        try {
            const iv = dbFileBuffer.slice(version.ivOffset, version.ivOffset + version.ivLength);
            const encryptedDbWithTag = dbFileBuffer.slice(version.ciphertextOffset);

            const decryptedCompressedDb = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv, tagLength: 128 }, // 128-bit auth tag
                key,
                encryptedDbWithTag
            );
            
            // Decryption successful, decompress and return
            // @ts-ignore
            return pako.inflate(new Uint8Array(decryptedCompressedDb));
        } catch (e) {
            lastError = e;
            // This version failed, loop will try the next one.
        }
    }

    // If all decryption attempts failed
    console.error("All decryption attempts failed.", lastError);
    throw new Error('Decryption failed. The key file might be invalid, or the database file is not a supported format (crypt12, crypt14, or crypt15). Please verify your files.');
}


async function parseDB(dbBuffer: Uint8Array): Promise<DecryptedData> {
    const db = await getDb(dbBuffer);

    // Fetch chats
    const chatsResult = db.exec(GET_CHATS_QUERY);
    const chats: Chat[] = [];
    if (chatsResult.length > 0 && chatsResult[0].values) {
        chatsResult[0].values.forEach((row: any[]) => {
            const [jid, group_name, contact_name, lastMessageText, lastMessageTimestamp] = row;
            // For individual chats, use contact name, otherwise group name
            const name = jid.endsWith('@g.us') ? group_name : contact_name || jid.split('@')[0];
            chats.push({
                jid: jid as string,
                name: name as string,
                lastMessageText: lastMessageText as string | null,
                lastMessageTimestamp: lastMessageTimestamp as number,
            });
        });
    }

    // Fetch all messages and group them by chat
    const messages = new Map<string, Message[]>();
    const stmt = db.prepare(GET_MESSAGES_QUERY);
    for (const chat of chats) {
        stmt.bind([chat.jid]);
        const chatMessages: Message[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            chatMessages.push({
                id: row._id as string,
                chatJid: row.key_remote_jid as string,
                fromMe: !!row.from_me,
                status: row.status as number,
                text: row.data as string | null,
                timestamp: (row.timestamp as number),
                messageType: row.message_type as number,
                mediaCaption: row.media_caption as string | null,
            });
        }
        messages.set(chat.jid, chatMessages);
        stmt.reset();
    }
    stmt.free();

    return { chats, messages };
}

export async function processFiles(keyFile: File, dbFile: File): Promise<DecryptedData> {
    const keyFileBuffer = await keyFile.arrayBuffer();
    const dbFileBuffer = await dbFile.arrayBuffer();

    const dbBuffer = await decryptBackupFile(keyFileBuffer, dbFileBuffer);
    const parsedData = await parseDB(dbBuffer);
    
    return parsedData;
}
