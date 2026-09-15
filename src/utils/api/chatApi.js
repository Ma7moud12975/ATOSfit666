import { supabase } from '../supabase.js';
import {
  saveLocalConversationTurn,
  getLocalConversations,
  getLocalConversationMessages,
  deleteLocalConversation,
  clearLocalConversations,
} from '../localAccountStorage.js';

const userIdCache = new Map();

/**
 * Validates and ensures that a conversation ID conforms to standard UUID format
 * required by Supabase PostgreSQL schema.
 */
export function ensureUuid(id) {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(String(id))) return String(id);
  return crypto.randomUUID();
}

/**
 * Resolves a given identifier (email, principal, or user id) to the actual
 * primary key in the Supabase `users` table to satisfy the foreign key constraint.
 */
export async function resolveDbUserId(identifier) {
  if (!identifier) return null;
  const idStr = String(identifier).trim();
  if (userIdCache.has(idStr)) return userIdCache.get(idStr);

  try {
    if (supabase && typeof supabase.from === 'function') {
      // 1. Direct ID match
      const { data: byId } = await supabase
        .from('users')
        .select('id')
        .eq('id', idStr)
        .maybeSingle();

      if (byId?.id) {
        userIdCache.set(idStr, byId.id);
        return byId.id;
      }

      // 2. Email lookup match
      const email = idStr.includes('@') ? idStr.toLowerCase() : null;
      if (email) {
        const { data: byEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (byEmail?.id) {
          userIdCache.set(idStr, byEmail.id);
          return byEmail.id;
        }
      }

      // 3. Name lookup match
      const { data: byName } = await supabase
        .from('users')
        .select('id')
        .ilike('full_name', `%${idStr}%`)
        .limit(1)
        .maybeSingle();

      if (byName?.id) {
        userIdCache.set(idStr, byName.id);
        return byName.id;
      }

      // 4. Fallback to active localStorage user ID
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (stored?.id && stored.id !== idStr) {
          const resolved = await resolveDbUserId(stored.id);
          if (resolved) {
            userIdCache.set(idStr, resolved);
            return resolved;
          }
        }
        if (stored?.email && stored.email !== idStr) {
          const resolved = await resolveDbUserId(stored.email);
          if (resolved) {
            userIdCache.set(idStr, resolved);
            return resolved;
          }
        }
      } catch {}
    }
  } catch (e) {
    console.warn('[chatApi] Error resolving DB user ID:', e?.message);
  }

  return idStr;
}

/**
 * Synchronizes any conversations currently sitting only in localStorage into Supabase chatbot_logs.
 * Guarantees that turns chatted before cloud sync was active are immediately pushed to Supabase.
 */
export async function syncLocalConversationsToCloud(userId) {
  const dbUserId = await resolveDbUserId(userId);
  if (!dbUserId) return;

  try {
    const localConvs = getLocalConversations(userId);
    if (!localConvs || !localConvs.length) return;

    // Fetch existing conversation IDs from Supabase to avoid duplicates
    const { data: remoteLogs } = await supabase
      .from('chatbot_logs')
      .select('conversation_id')
      .eq('user_id', dbUserId);

    const existingConvIds = new Set((remoteLogs || []).map(r => r.conversation_id));

    for (const conv of localConvs) {
      const convId = ensureUuid(conv.id);
      if (!existingConvIds.has(convId)) {
        const messages = getLocalConversationMessages(userId, conv.id);
        if (messages && messages.length) {
          const rowsToInsert = messages.map(m => ({
            user_id: dbUserId,
            message: m.message,
            is_user_message: Boolean(m.is_user_message ?? m.isUser),
            conversation_id: convId,
            timestamp: m.timestamp || new Date().toISOString(),
          }));

          const { error } = await supabase.from('chatbot_logs').insert(rowsToInsert);
          if (!error) existingConvIds.add(convId);
        }
      }
    }
  } catch (err) {
    console.warn('[chatApi] Local to cloud conversation sync notice:', err?.message);
  }
}

export async function saveChatMessage(userId, message, isUserMessage = true, conversationId = null) {
  const convId = ensureUuid(conversationId);
  const dbUserId = await resolveDbUserId(userId);

  if (!dbUserId) return null;

  const { data, error } = await supabase
    .from('chatbot_logs')
    .insert({
      user_id: dbUserId,
      message,
      is_user_message: isUserMessage,
      conversation_id: convId,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveChatResponse(userId, response, conversationId = null) {
  return saveChatMessage(userId, response, false, conversationId);
}

export async function saveConversationTurn(userId, userMessage, botResponse, conversationId = null) {
  const convId = ensureUuid(conversationId);
  const localResult = saveLocalConversationTurn(userId, userMessage, botResponse, convId);

  const dbUserId = await resolveDbUserId(userId);
  if (!dbUserId) {
    console.warn('[chatApi] Could not resolve Supabase user ID. Saved locally only.');
    return localResult;
  }

  const now = new Date().toISOString();
  const messages = [
    {
      user_id: dbUserId,
      message: userMessage,
      is_user_message: true,
      conversation_id: convId,
      timestamp: now,
    },
    {
      user_id: dbUserId,
      message: botResponse,
      is_user_message: false,
      conversation_id: convId,
      timestamp: new Date(Date.now() + 10).toISOString(),
    },
  ];

  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .insert(messages)
      .select();

    if (error) {
      console.warn('[chatApi] Supabase chat turn sync error:', error.message);
      return { ...localResult, syncError: error };
    }

    return { conversationId: convId, messages: data };
  } catch (err) {
    console.warn('[chatApi] Conversation saved locally, Supabase request failed:', err?.message);
    return localResult;
  }
}

export async function getChatHistory(userId, options = {}) {
  const { limit = 50, offset = 0, conversationId = null } = options;
  const dbUserId = await resolveDbUserId(userId);
  const convId = conversationId ? ensureUuid(conversationId) : null;

  if (!dbUserId) {
    if (conversationId) return getLocalConversationMessages(userId, conversationId);
    return getLocalConversations(userId);
  }

  let query = supabase
    .from('chatbot_logs')
    .select('*')
    .eq('user_id', dbUserId)
    .order('timestamp', { ascending: true })
    .range(offset, offset + limit - 1);

  if (convId) query = query.eq('conversation_id', convId);

  const { data, error } = await query;

  if (error) {
    console.warn('Loading Supabase chat history failed. Using local messages:', error);
    if (conversationId) return getLocalConversationMessages(userId, conversationId);
    return getLocalConversations(userId);
  }
  return data;
}

export async function getConversations(userId, limit = 20) {
  const dbUserId = await resolveDbUserId(userId);

  if (!dbUserId) {
    return getLocalConversations(userId).slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .select('conversation_id, timestamp, message, is_user_message')
      .eq('user_id', dbUserId)
      .order('timestamp', { ascending: false })
      .limit(limit * 20);

    if (error) {
      console.warn('Loading Supabase conversations failed. Using local chat history:', error.message);
      return getLocalConversations(userId).slice(0, limit);
    }

    const conversations = {};
    (data || []).forEach(log => {
      const convId = log.conversation_id;
      if (!convId) return;

      if (!conversations[convId]) {
        conversations[convId] = {
          id: convId,
          title: log.is_user_message
            ? (log.message.slice(0, 40) + (log.message.length > 40 ? '...' : ''))
            : 'Conversation',
          lastMessage: log.timestamp,
          messageCount: 1,
        };
      } else {
        conversations[convId].messageCount++;
        if (log.is_user_message && conversations[convId].title === 'Conversation') {
          conversations[convId].title = log.message.slice(0, 40) + (log.message.length > 40 ? '...' : '');
        }
      }
    });

    const remote = Object.values(conversations);
    const local = getLocalConversations(userId);
    const merged = [...remote, ...local.filter(item => !remote.some(remoteItem => remoteItem.id === item.id))];
    return merged.slice(0, limit);
  } catch (err) {
    console.warn('Error fetching Supabase conversations:', err?.message);
    return getLocalConversations(userId).slice(0, limit);
  }
}

export async function getConversationMessages(userId, conversationId) {
  const dbUserId = await resolveDbUserId(userId);
  const convId = ensureUuid(conversationId);

  if (dbUserId) {
    try {
      const { data, error } = await supabase
        .from('chatbot_logs')
        .select('*')
        .eq('user_id', dbUserId)
        .eq('conversation_id', convId)
        .order('timestamp', { ascending: true });

      if (!error && data?.length) {
        return data;
      }
    } catch (e) {
      console.warn('Error fetching conversation messages:', e?.message);
    }
  }

  return getLocalConversationMessages(userId, conversationId);
}

export async function deleteConversation(userId, conversationId) {
  deleteLocalConversation(userId, conversationId);

  const dbUserId = await resolveDbUserId(userId);
  const convId = ensureUuid(conversationId);

  if (!dbUserId) return [];

  const { data, error } = await supabase
    .from('chatbot_logs')
    .delete()
    .eq('user_id', dbUserId)
    .eq('conversation_id', convId)
    .select();

  if (error) {
    console.warn('Conversation deleted locally, but Supabase delete failed:', error);
    return [];
  }

  return data;
}

export async function renameConversation(userId, conversationId, newTitle) {
  // Title is derived dynamically from messages, but local storage title can be updated
  const conversations = getLocalConversations(userId);
  const updated = conversations.map(c => c.id === conversationId ? { ...c, title: newTitle } : c);
  try {
    localStorage.setItem(`atos_account:${userId}:chat_conversations`, JSON.stringify(updated));
  } catch {}
  return updated;
}

export async function clearAllConversations(userId) {
  clearLocalConversations(userId);

  const dbUserId = await resolveDbUserId(userId);
  if (!dbUserId) return [];

  const { data, error } = await supabase
    .from('chatbot_logs')
    .delete()
    .eq('user_id', dbUserId)
    .select();

  if (error) {
    console.warn('Conversations cleared locally, but Supabase clear failed:', error);
    return [];
  }

  return data;
}

export async function getMessageCount(userId) {
  const dbUserId = await resolveDbUserId(userId);
  if (!dbUserId) return getLocalConversations(userId).reduce((sum, item) => sum + (item.messageCount || 0), 0);

  const { count, error } = await supabase
    .from('chatbot_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', dbUserId);

  if (error) return getLocalConversations(userId).reduce((sum, item) => sum + (item.messageCount || 0), 0);
  return count;
}

export default {
  saveChatMessage,
  saveChatResponse,
  saveConversationTurn,
  getChatHistory,
  getConversations,
  getConversationMessages,
  deleteConversation,
  renameConversation,
  clearAllConversations,
  getMessageCount,
};
