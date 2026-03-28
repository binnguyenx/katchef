const errorMap: Record<string, string> = {
  'auth/email-already-in-use': 'That email is already in use. Try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'That email or password does not match our records.',
  'auth/user-not-found': 'We could not find an account with that email.',
  'auth/wrong-password': 'That password looks incorrect.',
  'auth/too-many-requests': 'Too many attempts right now. Please try again in a moment.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
  'auth/popup-blocked': 'Your browser blocked the Google popup. Allow popups and try again.',
  'permission-denied': 'Permission was denied for that action.',
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) => {
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
      return maybeMessage;
    }
  }

  return fallback;
};
