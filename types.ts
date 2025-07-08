
export interface Message {
    id: string;
    chatJid: string;
    fromMe: boolean;
    status: number;
    text: string | null;
    timestamp: number;
    messageType: number;
    mediaCaption: string | null;
}

export interface Chat {
    jid: string;
    name: string | null;
    lastMessageText: string | null;
    lastMessageTimestamp: number;
}

export interface DecryptedData {
    chats: Chat[];
    messages: Map<string, Message[]>;
}
