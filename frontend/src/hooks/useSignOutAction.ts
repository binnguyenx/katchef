import { useState } from 'react';
import { Alert } from 'react-native';

import { signOut } from '../services/auth';
import { getErrorMessage } from '../utils/error';

export const useSignOutAction = () => {
  const [signingOut, setSigningOut] = useState(false);

  const runSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign out failed', getErrorMessage(error, 'Please try again.'));
    } finally {
      setSigningOut(false);
    }
  };

  return { signingOut, runSignOut };
};
