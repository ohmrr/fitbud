import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Activity, CheckCircle2, Upload, AlertCircle } from 'lucide-react-native';

const BACKEND_HOST = 'https://fitbud-m7tj.onrender.com';

const SCREEN_OPTIONS = {
  title: 'Upload',
  headerTransparent: true,
  headerRight: () => <ThemeSwitcher />
};

type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface AnalysisResult {
  feedback: string;
}

export default function UploadScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Video player for preview
  const player = useVideoPlayer(videoUri || '', (player) => {
    player.loop = true;
  });

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality, // Native H.264 conversion!
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setStatus('idle');
      setResult(null);
      setProgress(0);
      // Update player source (async version to avoid warning)
      player.replaceAsync(result.assets[0].uri);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!videoUri) return;

    try {
      setStatus('uploading');
      setProgress(10);
      setStatusMessage('Uploading video...');

      const filename = videoUri.split('/').pop() || 'video.mp4';

      // Create FormData with the video URI
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        name: filename,
        type: 'video/mp4',
      } as any);

      // Upload
      const uploadResult = await fetch(`${BACKEND_HOST}/process`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Upload failed');
      }

      const responseData = await uploadResult.json();
      const { id } = responseData;
      setProcessingId(id);
      setStatus('processing');
      setProgress(30);
      setStatusMessage('Analyzing your workout...');

      // Poll for status
      pollStatus(id);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setStatusMessage('Failed to upload video. Please try again.');
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_HOST}/status/${id}`);

      if (!response.ok) {
        throw new Error('Status check failed');
      }

      const data = await response.json();

      if (data.done) {
        setStatus('complete');
        setProgress(100);
        setStatusMessage('Analysis complete!');
        setResult(data.result);
      } else {
        setStatusMessage(data.status || 'Processing...');
        // Update progress incrementally (30-90%)
        setProgress((prev) => Math.min(prev + 5, 90));
        // Continue polling
        setTimeout(() => pollStatus(id), 2000);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Analysis failed. Please try again.');
      Alert.alert('Error', 'Analysis failed. Please try again.');
    }
  };

  const reset = () => {
    setVideoUri(null);
    setStatus('idle');
    setProgress(0);
    setStatusMessage('');
    setResult(null);
    setProcessingId(null);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Activity className="animate-spin text-primary" size={24} />;
      case 'complete':
        return <CheckCircle2 className="text-green-500" size={24} />;
      case 'error':
        return <AlertCircle className="text-destructive" size={24} />;
      default:
        return <Upload className="text-muted-foreground" size={24} />;
    }
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center gap-6 p-6 pt-24 mt-10">
          {/* Video Preview */}
          {videoUri && status === 'idle' && (
            <Card className="w-full max-w-md">
              <CardContent className="p-4">
                <VideoView player={player} style={{ width: '100%', height: 300 }} nativeControls />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="w-full max-w-md gap-3">
            {!videoUri && (
              <Button onPress={pickVideo} size="lg" className="w-full">
                <Upload className="text-primary-foreground" size={20} />
                <Text>Select Video</Text>
              </Button>
            )}

            {videoUri && status === 'idle' && (
              <>
                <Button onPress={uploadAndAnalyze} size="lg" className="w-full">
                  <Activity className="mr-2 text-primary-foreground" size={20} />
                  <Text>Analyze Workout</Text>
                </Button>
                <Button onPress={pickVideo} variant="outline" size="lg" className="w-full">
                  <Text>Choose Different Video</Text>
                </Button>
              </>
            )}

            {(status === 'complete' || status === 'error') && (
              <Button onPress={reset} size="lg" className="w-full">
                <Text>Upload Another Video</Text>
              </Button>
            )}
          </View>

          {/* Processing Status */}
          {(status === 'uploading' || status === 'processing') && (
            <Card className="w-full max-w-md">
              <CardHeader>
                <View className="flex-row items-center gap-3">
                  {getStatusIcon()}
                  <View className="flex-1">
                    <CardTitle>Analyzing Your Form</CardTitle>
                    <CardDescription>{statusMessage}</CardDescription>
                  </View>
                </View>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <Text className="mt-2 text-center text-sm text-muted-foreground">{progress}%</Text>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {status === 'complete' && result && (
            <Card className="w-full max-w-md">
              <CardHeader>
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 className="text-green-500" size={24} />
                  <View className="flex-1">
                    <CardTitle>Analysis Complete</CardTitle>
                    <CardDescription>Here's your feedback</CardDescription>
                  </View>
                </View>
              </CardHeader>
              <CardContent>
                <View className="rounded-lg bg-muted p-4">
                  <Text className="text-base leading-relaxed">{result.feedback}</Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {status === 'error' && (
            <Card className="w-full max-w-md border-destructive">
              <CardHeader>
                <View className="flex-row items-center gap-3">
                  <AlertCircle className="text-destructive" size={24} />
                  <View className="flex-1">
                    <CardTitle className="text-destructive">Analysis Failed</CardTitle>
                    <CardDescription>{statusMessage}</CardDescription>
                  </View>
                </View>
              </CardHeader>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}
