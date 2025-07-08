import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileKeyIcon, FileTextIcon, AlertCircleIcon, ShieldCheckIcon, CheckIcon } from './icons';

interface FileUploaderProps {
    onDecrypt: (keyFile: File, dbFile: File) => void;
    isLoading: boolean;
    error: string | null;
}

const FileDropZone: React.FC<{
    onFileDrop: (file: File) => void;
    file: File | null;
    title: string;
    description: string;
    Icon: React.ElementType;
}> = ({ onFileDrop, file, title, description, Icon }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileDrop(e.target.files[0]);
        }
    };
    
    const borderColor = isDragging ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600';
    const bgColor = file ? 'bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-gray-800/50';
    const successBorderColor = file ? 'border-green-500' : borderColor;

    return (
        <div 
            className={`relative flex-1 p-6 border-2 ${successBorderColor} border-dashed rounded-xl text-center transition-all duration-300 ${bgColor}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input type="file" id={`file-upload-${title.replace(/\s+/g, '-')}`} className="hidden" onChange={handleFileChange} />
            <label htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`} className="cursor-pointer">
                {file ? (
                     <div className="flex flex-col items-center justify-center h-full">
                        <CheckIcon className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title} Loaded</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate w-full px-2">{file.name}</p>
                        <button onClick={(e) => {e.preventDefault(); onFileDrop(null as any)}} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Icon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        <p className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            DRAG & DROP OR <span className="underline">BROWSE</span>
                        </p>
                    </div>
                )}
            </label>
        </div>
    );
};

export const FileUploader: React.FC<FileUploaderProps> = ({ onDecrypt, isLoading, error }) => {
    const [keyFile, setKeyFile] = useState<File | null>(null);
    const [dbFile, setDbFile] = useState<File | null>(null);

    const handleDecryptClick = () => {
        if (keyFile && dbFile) {
            onDecrypt(keyFile, dbFile);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                        WhatsApp Chat Viewer
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Securely decrypt and view your WhatsApp backup files locally.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <FileDropZone 
                            onFileDrop={setKeyFile}
                            file={keyFile}
                            title="WhatsApp Key File"
                            description="The 158-byte 'key' file from your phone's data folder."
                            Icon={FileKeyIcon}
                        />
                        <FileDropZone 
                            onFileDrop={setDbFile}
                            file={dbFile}
                            title="Database File"
                            description="Your 'msgstore.db.crypt' chat backup file."
                            Icon={FileTextIcon}
                        />
                    </div>

                    {error && (
                        <div className="my-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                            <AlertCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={handleDecryptClick}
                            disabled={!keyFile || !dbFile || isLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                "Decrypt & View Chats"
                            )}
                        </button>
                    </div>
                </div>
                
                 <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center text-lg">How to Get Your Files</h3>
                    <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300 text-left">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center"><span className="text-xl mr-2">📱</span>Method 1: Rooted Device (Easy)</h4>
                            <p className="mt-1">If your device is rooted, use a file manager with root access to copy the two required files to your computer:</p>
                            <ul className="mt-2 space-y-2 text-xs pl-2">
                                <li>
                                    <strong>Key File:</strong> Found in your phone's private data partition.
                                    <code className="block bg-gray-200 dark:bg-gray-700/50 px-2 py-1.5 rounded-md mt-1 font-mono">/data/data/com.whatsapp/files/key</code>
                                </li>
                                <li>
                                    <strong>Database File:</strong> Found in your phone's internal storage. The exact path depends on your Android version.
                                    <code className="block bg-gray-200 dark:bg-gray-700/50 px-2 py-1.5 rounded-md mt-1 font-mono">/sdcard/WhatsApp/Databases/msgstore.db.crypt15</code>
                                    <span className="text-gray-500 dark:text-gray-400 block mt-1">or for newer Android versions:</span>
                                    <code className="block bg-gray-200 dark:bg-gray-700/50 px-2 py-1.5 rounded-md mt-1 font-mono">/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Databases/msgstore.db.crypt15</code>
                                    <span className="text-gray-500 dark:text-gray-400 block mt-1">(Note: The file extension may be `.crypt14` or `.crypt12`. This tool supports all of them.)</span>
                                </li>
                            </ul>
                        </div>
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-6">
                             <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center"><span className="text-xl mr-2">💻</span>Method 2: Non-Rooted Device (Advanced)</h4>
                             <p className="mt-1">Extracting the key from a non-rooted device is very complex and the steps change frequently. This is a high-level overview:</p>
                             <ol className="list-decimal list-inside mt-2 space-y-2">
                                 <li><strong>Enable USB Debugging:</strong> Go to your phone's `Settings &gt; About Phone`, then tap "Build number" 7 times to enable Developer Options. In `Developer Options`, enable "USB debugging".</li>
                                 <li><strong>Install Android Platform Tools (ADB):</strong> Download `adb` for your operating system from the [official Android developer website](https://developer.android.com/studio/releases/platform-tools) and add it to your system's PATH.</li>
                                 <li><strong>Downgrade WhatsApp:</strong> This is the riskiest step. You must back up your chats to Google Drive, uninstall WhatsApp, and then sideload a much older version of WhatsApp that has a security vulnerability allowing key extraction.</li>
                                 <li><strong>Run an Extraction Script:</strong> You'll need to find a third-party tool (often a script on GitHub) that uses `adb` to exploit the old WhatsApp version. It will run a backup command (`adb backup`) and extract the `key` file from the backup data.</li>
                                 <li><strong>Copy the Database File:</strong> Once you have the key, you can find your `msgstore.db.crypt` file in your phone's storage (see paths in Method 1) and copy it to your PC.</li>
                                 <li><strong>Upgrade and Restore:</strong> Uninstall the old version, reinstall the latest WhatsApp from the Play Store, and restore your chats from your Google Drive backup.</li>
                             </ol>
                             <p className="mt-4 text-xs p-3 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-lg">
                                 ⚠️ <strong>Warning:</strong> This method is for advanced users only and carries a significant risk of permanent data loss if not performed correctly. We cannot provide a direct guide as the steps change constantly. Please search for a recent, detailed guide on a trusted forum like **GitHub** or **XDA-Developers** for "non-root WhatsApp key extraction" before attempting.
                             </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center text-sm">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
                    <span><strong>100% Private.</strong> All decryption happens in your browser. No data is ever uploaded.</span>
                </div>
            </div>
        </div>
    );
};
