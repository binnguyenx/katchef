import { Text, View } from 'react-native';

import { screenSharedStyles } from '../../theme/screenShared';

type Props = {
  variant: 'error' | 'success';
  message: string;
};

export const InlineAlert = ({ variant, message }: Props) => {
  if (variant === 'success') {
    return (
      <View style={screenSharedStyles.inlineSuccessBox}>
        <Text style={screenSharedStyles.inlineSuccessText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={screenSharedStyles.inlineErrorBox}>
      <Text style={screenSharedStyles.inlineErrorText}>{message}</Text>
    </View>
  );
};
