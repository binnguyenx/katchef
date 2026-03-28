import { useRef, useState } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InlineAlert } from '../../components/common/InlineAlert';
import { Screen } from '../../components/common/Screen';
import { demoScanImageUri, detectIngredients } from '../../services/api';
import { colors, radii, screenSharedStyles, spacing } from '../../theme';
import type { MainTabParamList, RootStackParamList } from '../../types';
import { getErrorMessage } from '../../utils/error';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Scan'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ScanScreen = ({ navigation }: Props) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureImage = async () => {
    try {
      const image = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
      });

      if (image?.uri) {
        setImageUri(image.uri);
        setError(null);
      }
    } catch (captureError) {
      setError(getErrorMessage(captureError, 'The camera could not capture that image.'));
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await detectIngredients(uri);
      navigation.navigate('ScanResults', {
        imageUri: uri,
        detections: response.ingredients,
      });
    } catch (scanError) {
      setError(getErrorMessage(scanError, 'KatLens could not analyze that image yet.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Text style={screenSharedStyles.pageTitle}>KatLens scan</Text>
        <Text style={screenSharedStyles.pageSubtitle}>
          Capture ingredients, preview the result, then confirm detections before saving them.
        </Text>
      </Card>

      {imageUri ? (
        <Card>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.buttonRow}>
            <Button label="Retake" variant="outline" onPress={() => setImageUri(null)} />
            <Button label="Analyze scan" onPress={() => void analyzeImage(imageUri)} loading={isAnalyzing} />
          </View>
        </Card>
      ) : permission?.granted ? (
        <Card>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <Button label="Capture image" onPress={() => void captureImage()} />
          <Button label="Try demo scan" variant="ghost" onPress={() => void analyzeImage(demoScanImageUri)} />
        </Card>
      ) : (
        <Card>
          <Text style={screenSharedStyles.panelTitle}>Camera access</Text>
          <Text style={screenSharedStyles.panelCopy}>
            Browser previews inside Codespaces can limit camera access. You can request permission or jump straight into a demo scan flow.
          </Text>
          <Button label="Enable camera" onPress={() => void requestPermission()} />
          <Button label="Use demo scan instead" variant="outline" onPress={() => void analyzeImage(demoScanImageUri)} />
        </Card>
      )}

      {error ? <InlineAlert variant="error" message={error} /> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: 420,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 420,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundAlt,
  },
  buttonRow: {
    gap: spacing.sm,
  },
});
