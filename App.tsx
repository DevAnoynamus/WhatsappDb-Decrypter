import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ChatView } from './components/ChatView';
import { DecryptedData } from './types';
import { processFiles } from './services/whatsappService';

const App: React.FC = () => {
    const [decryptedData, setDecryptedData] = useState<DecryptedData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDecryption = useCallback(async (keyFile: File, dbFile: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await processFiles(keyFile, dbFile);
            setDecryptedData(data);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error(e);
                setError(`Decryption failed: ${e.message}. Please double-check your files and try again.`);
            } else {
                setError('An unknown error occurred during decryption.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleReset = useCallback(() => {
        setDecryptedData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
            {decryptedData ? (
                <ChatView decryptedData={decryptedData} onReset={handleReset} />
            ) : (
                <FileUploader onDecrypt={handleDecryption} isLoading={isLoading} error={error} />
            )}
        </div>
    );
};

export default App;
