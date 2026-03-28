const errorMap: Record<string, string> = {
  'auth/email-already-in-use': 'That email is already in use. Try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'That email or password does not match our records.',
  'auth/user-not-found': 'We could not find an account with that email.',
  'auth/wrong-password': 'That password looks incorrect.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts right now. Please try again in a moment.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
  'auth/popup-blocked': 'Your browser blocked the Google popup. Allow popups and try again.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'permission-denied': 'Permission was denied for that action.',
  'firestore/permission-denied': 'You do not have permission to access this data.',
  'firestore/unavailable': 'Database is temporarily unavailable. Try again shortly.',
};

/** API errors thrown after a non-OK HTTP response (message is user-facing). */
export class HttpApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpApiError';
    this.status = status;
  }
}

const isOfflineLikeMessage = (msg: string) =>
  /network request failed|failed to fetch|load failed|internet connection appears|networkerror/i.test(msg);

export const getNetworkFailureMessage = (error: unknown): string => {
  const base = getErrorMessage(error, '');
  if (base && isOfflineLikeMessage(base)) {
    return 'Could not reach the server. Check your connection and API URL.';
  }
  if (error instanceof TypeError && typeof error.message === 'string' && isOfflineLikeMessage(error.message)) {
    return 'Could not reach the server. Check your connection and API URL.';
  }
  return base || 'Could not reach the server. Check your connection and API URL.';
};

type FastApiDetail =
  | string
  | { msg?: string }[]
  | { detail?: FastApiDetail }
  | Record<string, unknown>;

const detailToString = (detail: unknown): string | null => {
  if (detail == null) {
    return null;
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    if (first && typeof first.msg === 'string') {
      return first.msg;
    }
    return null;
  }
  if (typeof detail === 'object' && 'detail' in detail) {
    return detailToString((detail as { detail: unknown }).detail);
  }
  return null;
};

/** Parse already-read response body (FastAPI `detail`, plain text, or status defaults). */
export const parseHttpErrorBody = (status: number, text: string, fallback: string): string => {
  if (text) {
    try {
      const json = JSON.parse(text) as { detail?: FastApiDetail };
      const fromDetail = detailToString(json.detail);
      if (fromDetail) {
        return fromDetail;
      }
    } catch {
      const trimmed = text.trim().slice(0, 280);
      if (trimmed) {
        return trimmed;
      }
    }
  }

  if (status === 401 || status === 403) {
    return 'You are not allowed to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 413) {
    return 'The file is too large for the server.';
  }
  if (status >= 500) {
    return 'The server had a problem. Please try again later.';
  }

  return `${fallback} (HTTP ${status})`;
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) => {
  if (error instanceof HttpApiError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeCode = 'code' in error ? String(error.code) : null;
    const maybeMessage = 'message' in error ? String(error.message) : null;

    if (maybeCode && errorMap[maybeCode]) {
      return errorMap[maybeCode];
    }

    if (maybeMessage) {
      if (maybeCode?.startsWith('auth/') && errorMap[maybeCode]) {
        return errorMap[maybeCode];
      }
      return maybeMessage;
    }
  }

  return fallback;
};
