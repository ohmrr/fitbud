import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Activity, CheckCircle2, Upload, AlertCircle } from 'lucide-react-native';

// 🧠 Make sure this matches your Flask server
const BACKEND_HOST = 'http://10.117.6.179:8080';

const SCREEN_OPTIONS = {
  title: 'Upload',
  headerTransparent: true,
  headerRight: () => <ThemeSwitcher />,
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

  // 🎥 Pick a video from gallery
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setVideoUri(uri);
      setStatus('idle');
      setResult(null);
      setProgress(0);
      player.replaceAsync(uri);
    }
  };

  // 🚀 Upload and trigger analysis
  // 🚀 Upload and trigger analysis
  const uploadAndAnalyze = async () => {
    if (!videoUri) return;

    try {
      setStatus('uploading');
      setProgress(10);
      setStatusMessage('Uploading video...');

      const filename = videoUri.split('/').pop() || 'video.mp4';

      // 🔥 Read raw bytes from the local file
      const fileData = await fetch(videoUri);
      const blob = await fileData.blob();

      // 🚀 Send raw bytes directly, NOT multipart/form-data
      const uploadResult = await fetch(`${BACKEND_HOST}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'video/mp4', // or 'application/octet-stream'
        },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.status}`);
      }

      const responseData = await uploadResult.json();
      const { id } = responseData;
      setProcessingId(id);
      setStatus('processing');
      setProgress(30);
      setStatusMessage('Analyzing your workout...');

      pollStatus(id);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setStatusMessage('Failed to upload video. Please try again.');
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    }
  };

  // 🔄 Poll Flask backend for analysis completion
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
        setProgress((prev) => Math.min(prev + 5, 90));
        setTimeout(() => pollStatus(id), 2000);
      }
    } catch (error) {
      console.error('Polling error:', error);
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
        <View className="mt-10 flex-1 items-center justify-center gap-6 p-6 pt-24">
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
