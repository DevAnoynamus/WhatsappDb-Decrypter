# WhatsApp Chat Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=whatsapp-chat-viewer)](https://vercel.com)

**Securely and privately view your encrypted WhatsApp chat backups right in your browser. No data is ever uploaded to the cloud.**


*(Replace this with a GIF of your actual application)*

A secure, client-side tool to decrypt and view WhatsApp `.crypt12`, `.crypt14`, and `.crypt15` chat backups locally. Upload your `key` and database file to browse your messages in a familiar interface without sending any sensitive data to the internet.

---

## ✨ Features

- **🔐 100% Private**: All decryption happens locally in your browser using the Web Crypto API. Your files are never uploaded.
- **🔓 Multi-Format Support**: Decrypts `msgstore.db.crypt12`, `crypt14`, and `crypt15` files automatically.
- **💬 Familiar UI**: Browse your messages in a classic, intuitive chat interface.
- **🔍 Search Chats**: Easily find specific conversations.
- **📄 Export Chats**: Export your conversations to PDF or HTML files for archiving or sharing.
- **🌓 Light & Dark Mode**: Comfortable viewing experience, day or night.
- **💻 Cross-Platform**: Works on any modern desktop web browser.

---

## 🛠️ How to Use

To use the app, you need two files from your Android phone: the **`key`** file and the **`msgstore.db.crypt`** database file.

| File                   | Description                                                                          |
| :--------------------- | :----------------------------------------------------------------------------------- |
| `key`                  | The 158-byte decryption key that unlocks your database.                                |
| `msgstore.db.crypt...` | The encrypted WhatsApp database (`.crypt12`, `.crypt14`, or `.crypt15`) with your messages. |

### How to Get The Files

#### 📱 Method 1: Rooted Device (Easy)

If your device is rooted, use a file manager with root access to copy the following files to your computer:

1.  **Key File**:
    ```bash
    /data/data/com.whatsapp/files/key
    ```
2.  **Database File**: Look in one of these locations (the path can vary by Android version):
    *   `/sdcard/WhatsApp/Databases/msgstore.db.crypt15`
    *   `/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Databases/msgstore.db.crypt15`

    *(Note: The file might also be named `.crypt14` or `.crypt12`. Any of these will work.)*

#### 💻 Method 2: Non-Rooted Device (Advanced)

Extracting the key from a non-rooted device is complex and requires a PC and developer tools.

1.  **Install ADB**: Install Android Platform Tools (ADB) from the [official Android developer website](https://developer.android.com/studio/releases/platform-tools).
2.  **Enable USB Debugging**: On your phone, go to `Settings > About Phone`, then tap "Build number" 7 times to enable Developer Options. In `Developer Options`, enable "USB debugging".
3.  **Downgrade WhatsApp**: This risky process involves backing up your current WhatsApp data (to Google Drive), uninstalling it, and installing an older, specific version of WhatsApp that allows data extraction.
4.  **Run Extraction Script**: Use a community-made tool (e.g., from a trusted GitHub repository) that leverages ADB to run a backup of the older WhatsApp version's data, from which it can extract the `key` file.
5.  **Copy Database File**: After getting the key, find the `msgstore.db.crypt` file (see paths in the "Rooted" section) and copy it to your PC.
6.  **Reinstall & Restore**: Reinstall the latest version of WhatsApp from the Play Store and restore your chat backup from Google Drive.

> ⚠️ **Warning**: This method is for advanced users and carries a high risk of data loss if not done correctly. Search for a detailed, up-to-date guide on forums like GitHub or XDA-Developers for "non-root WhatsApp key extraction" before proceeding. The exact steps change frequently.

---

## ✍️ Author

- **Dev. Utkarsh**

---

## 📄 License

This project is licensed under the MIT License.
