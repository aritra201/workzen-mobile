import { isHalfShiftKey, normalizeHalfShiftApiKey } from './halfShifts';
import { responseKeyToApiShiftKey } from './shiftLabels';

export function getCommentThreadForShiftKey(record, shiftResponseKey) {
  const threads = record?.commentThreads;
  if (!threads) {
    return null;
  }

  if (threads[shiftResponseKey]) {
    return threads[shiftResponseKey];
  }

  const apiKey = responseKeyToApiShiftKey(shiftResponseKey);
  if (isHalfShiftKey(apiKey)) {
    const normalized = normalizeHalfShiftApiKey(apiKey);
    const legacyList = threads.halfShifts || [];
    return legacyList.find((t) => normalizeHalfShiftApiKey(t?.shiftKey) === normalized) ?? null;
  }

  return null;
}

export function getCommentThreadReplies(commentThread) {
  const messages = commentThread?.messages;
  if (!Array.isArray(messages) || messages.length <= 1) {
    return [];
  }
  return messages.slice(1);
}

export function formatCommentThreadAuthorRole(authorRole) {
  if (authorRole === 'admin') return 'Admin';
  if (authorRole === 'employee') return 'Employee';
  return authorRole ? String(authorRole) : 'User';
}
