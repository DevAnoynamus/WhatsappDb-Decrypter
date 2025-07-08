import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DecryptedData, Chat, Message } from '../types';
import { SearchIcon, MessageSquareIcon, LogOutIcon, DownloadIcon } from './icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const ChatListItem: React.FC<{ chat: Chat; isSelected: boolean; onSelect: () => void; lastMessage: Message | undefined }> = ({ chat, isSelected, onSelect, lastMessage }) => {
    const bgColor = isSelected ? 'bg-indigo-500' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50';
    const textColor = isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100';
    const subTextColor = isSelected ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400';

    const lastMessageText = lastMessage?.text || lastMessage?.mediaCaption || 'Media message';
    
    return (
        <li
            onClick={onSelect}
            className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors duration-200 ${bgColor}`}
        >
            <div className="w-11 h-11 bg-gray-300 dark:bg-gray-600 rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                 <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{chat.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h3 className={`font-semibold truncate ${textColor}`}>{chat.name}</h3>
                    <p className={`text-xs flex-shrink-0 ml-2 ${subTextColor}`}>{formatTimestamp(chat.lastMessageTimestamp)}</p>
                </div>
                <p className={`text-sm truncate ${subTextColor}`}>{lastMessageText}</p>
            </div>
        </li>
    );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isSent = message.fromMe;
    const bubbleClass = isSent
        ? 'bg-emerald-100 dark:bg-emerald-800 self-end'
        : 'bg-white dark:bg-gray-700 self-start';
    const textAlign = isSent ? 'text-right' : 'text-left';

    const renderContent = () => {
        if (message.text) {
            return <p className="text-gray-800 dark:text-gray-200">{message.text}</p>;
        }
        if (message.mediaCaption) {
            return (
                <div>
                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md mb-1 text-gray-500 dark:text-gray-400">[Media content]</div>
                    <p className="text-gray-800 dark:text-gray-200">{message.mediaCaption}</p>
                </div>
            );
        }
        return <p className="text-gray-500 dark:text-gray-400 italic">[Media message]</p>;
    }

    return (
        <div className={`max-w-md md:max-w-lg mb-2 p-3 rounded-xl shadow-sm ${bubbleClass}`}>
            {renderContent()}
            <p className={`text-xs mt-1.5 ${textAlign} text-gray-400 dark:text-gray-500`}>
                {formatTimestamp(message.timestamp)}
            </p>
        </div>
    );
};

const DateSeparator: React.FC<{ timestamp: number }> = ({ timestamp }) => (
    <div className="flex justify-center my-4">
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
            {formatDateHeader(timestamp)}
        </span>
    </div>
);


export const ChatView: React.FC<{ decryptedData: DecryptedData; onReset: () => void }> = ({ decryptedData, onReset }) => {
    const { chats, messages } = decryptedData;
    const [selectedChatJid, setSelectedChatJid] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const messagePaneRef = useRef<HTMLDivElement>(null);

    const filteredChats = useMemo(() => {
        if (!searchTerm) return chats;
        return chats.filter(chat =>
            chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [chats, searchTerm]);

    const selectedChatMessages = useMemo(() => {
        if (!selectedChatJid) return [];
        return messages.get(selectedChatJid) || [];
    }, [selectedChatJid, messages]);
    
    const selectedChat = useMemo(() => {
        if (!selectedChatJid) return null;
        return chats.find(c => c.jid === selectedChatJid) || null;
    }, [selectedChatJid, chats]);

    const handleExport = useCallback(async (format: 'pdf' | 'html') => {
        if (!selectedChat || !messagePaneRef.current) return;
        setIsExporting(true);

        const chatName = selectedChat.name || "chat";
        const messagesToRender = messages.get(selectedChat.jid) || [];
        
        if (format === 'html') {
            let htmlContent = `
            <html><head><title>Chat with ${chatName}</title>
            <style>
                body { font-family: sans-serif; background-color: #f0f2f5; padding: 20px; }
                .message { padding: 8px 12px; border-radius: 8px; max-width: 70%; margin-bottom: 10px; }
                .sent { background-color: #dcf8c6; margin-left: auto; text-align: right; }
                .received { background-color: #ffffff; }
                .timestamp { font-size: 0.75rem; color: #888; margin-top: 4px; }
            </style>
            </head><body><h1>Chat with ${chatName}</h1>`;
            
            messagesToRender.forEach(msg => {
                htmlContent += `<div class="message ${msg.fromMe ? 'sent' : 'received'}">
                    <p>${msg.text || msg.mediaCaption || '[Media]'}</p>
                    <div class="timestamp">${formatTimestamp(msg.timestamp)}</div>
                </div>`;
            });
            htmlContent += '</body></html>';
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `WhatsApp Chat - ${chatName}.html`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            const canvas = await html2canvas(messagePaneRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: document.body.classList.contains('dark') ? '#1f2937' : '#f9fafb'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            let height = pdfWidth / ratio;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
            let heightLeft = height - pdfHeight;

            while (heightLeft > 0) {
                position = -pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, height);
                heightLeft -= pdfHeight;
            }
            pdf.save(`WhatsApp Chat - ${chatName}.pdf`);
        }
        setIsExporting(false);
    }, [selectedChat, messages]);

    const messagesWithDateSeparators = useMemo(() => {
        const result: (Message | { type: 'date'; timestamp: number })[] = [];
        let lastDate: string | null = null;

        for (const message of selectedChatMessages) {
            const messageDate = new Date(message.timestamp).toDateString();
            if (messageDate !== lastDate) {
                result.push({ type: 'date', timestamp: message.timestamp });
                lastDate = messageDate;
            }
            result.push(message);
        }
        return result;
    }, [selectedChatMessages]);

    return (
        <div className="h-screen w-screen flex bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`w-full md:w-1/3 lg:w-1/4 h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${selectedChatJid && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                     <h2 className="text-xl font-bold text-gray-800 dark:text-white">Chats</h2>
                    <button onClick={onReset} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <LogOutIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-lg pl-10 pr-4 py-2 text-sm"
                        />
                    </div>
                </div>
                <ul className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredChats.map(chat => (
                        <ChatListItem
                            key={chat.jid}
                            chat={chat}
                            isSelected={chat.jid === selectedChatJid}
                            onSelect={() => setSelectedChatJid(chat.jid)}
                            lastMessage={messages.get(chat.jid)?.slice(-1)[0]}
                        />
                    ))}
                </ul>
            </aside>
            
            {/* Main Content */}
            <main className={`flex-1 flex flex-col h-full transition-all duration-300 ${!selectedChatJid && 'hidden md:flex'}`}>
                {selectedChat ? (
                    <>
                        <header className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="w-11 h-11 bg-gray-300 dark:bg-gray-600 rounded-full mr-4 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{selectedChat.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-lg font-semibold flex-1 text-gray-900 dark:text-white">{selectedChat.name}</h2>
                             <div className="relative">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                    className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
                                >
                                    <DownloadIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-1" /> PDF
                                </button>
                                <button
                                    onClick={() => handleExport('html')}
                                    disabled={isExporting}
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
                                >
                                    <DownloadIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-1" /> HTML
                                </button>
                                {isExporting && <span className="text-xs absolute -bottom-4 right-0">Exporting...</span>}
                            </div>
                        </header>
                        <div ref={messagePaneRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900">
                            <div className="flex flex-col">
                                {messagesWithDateSeparators.map((item, index) => {
                                    // Use 'id' in item to discriminate between Message and date separator,
                                    // as 'id' only exists on the Message type in the union.
                                    if ('id' in item) {
                                        return <MessageBubble key={item.id} message={item} />;
                                    } else {
                                        return <DateSeparator key={`date-${item.timestamp}-${index}`} timestamp={item.timestamp} />;
                                    }
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-100 dark:bg-gray-900">
                        <MessageSquareIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Select a chat to start messaging</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Your chats will appear here once you select one from the list.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
