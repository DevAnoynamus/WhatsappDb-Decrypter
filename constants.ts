
// Fetches the list of chats, their names, last message, and timestamp.
// We use chat_view which provides convenient access to chat info.
export const GET_CHATS_QUERY = `
    SELECT
        c.jid AS jid,
        c.subject AS group_name,
        wc.given_name as contact_name,
        m.data AS lastMessageText,
        c.last_message_timestamp AS lastMessageTimestamp
    FROM chat_view c
    LEFT JOIN message_view m ON c.last_message_row_id = m._id
    LEFT JOIN wa_contacts wc on c.jid = wc.jid
    WHERE c.hidden = 0 AND c.jid NOT LIKE '%@broadcast'
    ORDER BY c.last_message_timestamp DESC;
`;

// Fetches all messages for a specific chat JID.
// message_view is used as it simplifies access to message data.
export const GET_MESSAGES_QUERY = `
    SELECT
        _id,
        key_remote_jid,
        from_me,
        status,
        data,
        timestamp,
        message_type,
        media_caption
    FROM message_view
    WHERE key_remote_jid = ? AND _id > 0
    ORDER BY timestamp ASC;
`;
