import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import * as FileSystem from 'expo-file-system';
import { File } from 'expo-file-system';

const SCREEN_OPTIONS = {
  title: 'Camera',
  headerTransparent: true,
};

const MAX_DURATION = 15; // Maximum video duration in seconds

export default function Screen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);
      setFeedback(null);
      setShowResults(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
        quality: '480p',
      });

      // Video automatically stops after maxDuration or when stopRecording is called
      if (video?.uri) {
        await processVideo(video.uri);
      }
    } catch (err) {
      console.error('Recording error:', err);
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current && isRecording) {
        cameraRef.current.stopRecording();
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };

  const processVideo = async (videoUri: string) => {
    setIsProcessing(true);

    try {
      // Read video file as base64
      const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to Flask backend
      const response = await fetch('https://your-backend-url.com/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video: videoBase64,
          timestamp: Date.now(),
        }),
      });

      const result = await response.json();

      // Store feedback and show results
      setFeedback(result);
      setShowResults(true);
    } catch (err) {
      console.error('Processing error:', err);
      setFeedback({
        error: true,
        message: 'Failed to analyze video. Please try again.',
      });
      setShowResults(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const flipCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const closeResults = () => {
    setShowResults(false);
    setFeedback(null);
    setRecordingTime(0);
  };

  // Permission UI
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-white">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-6">
        <Ionicons name="camera-outline" size={64} color="#fff" />
        <Text className="mb-2 mt-6 text-center text-xl font-semibold text-white">
          Camera Access Required
        </Text>
        <Text className="mb-8 text-center text-white/70">
          We need camera permission to analyze your workout form
        </Text>
        <TouchableOpacity
          onPress={() => requestPermission && requestPermission()}
          className="rounded-xl bg-blue-600 px-8 py-4"
          accessibilityLabel="Grant camera permission">
          <Text className="text-center font-semibold text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 bg-black">
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          onCameraReady={() => setCameraReady(true)}
        />

        {/* Flip Camera Button - Top Right */}
        {!isRecording && !isProcessing && (
          <View className="absolute right-6 top-16">
            <TouchableOpacity
              onPress={flipCamera}
              className="h-12 w-12 items-center justify-center rounded-full bg-black/50"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
              accessibilityLabel="Flip camera">
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Recording Indicator - Top Center */}
        {isRecording && (
          <View className="absolute left-0 right-0 top-16 items-center">
            <View className="rounded-full bg-red-500/90 px-6 py-3">
              <View className="flex-row items-center gap-x-2">
                <View className="h-3 w-3 animate-pulse rounded-full bg-white" />
                <Text className="font-bold text-white">
                  REC {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <View className="absolute inset-0 items-center justify-center bg-black/80">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="mt-4 text-lg font-semibold text-white">Analyzing your form...</Text>
            <Text className="mt-2 text-sm text-white/70">This may take a moment</Text>
          </View>
        )}

        {/* Results Overlay */}
        {showResults && feedback && (
          <View className="absolute inset-0 bg-black/95">
            <ScrollView className="flex-1 px-6 pt-20">
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">Form Analysis</Text>
                <TouchableOpacity onPress={closeResults} className="rounded-full bg-white/20 p-2">
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Error State */}
              {feedback.error ? (
                <View className="items-center py-8">
                  <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                  <Text className="mt-4 text-center text-lg text-white">{feedback.message}</Text>
                </View>
              ) : (
                <>
                  {/* Overall Feedback */}
                  {feedback.overall && (
                    <View className="mb-6 rounded-2xl bg-white/10 p-6">
                      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                        Overall Assessment
                      </Text>
                      <Text className="text-lg text-white">{feedback.overall}</Text>
                    </View>
                  )}

                  {/* Detailed Feedback */}
                  {feedback.details && Array.isArray(feedback.details) && (
                    <View className="mb-6">
                      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
                        Detailed Feedback
                      </Text>
                      {feedback.details.map((detail: string, index: number) => (
                        <View key={index} className="mb-3 flex-row gap-x-3">
                          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          <Text className="flex-1 text-white">{detail}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Angles Data */}
                  {feedback.angles && (
                    <View className="mb-6">
                      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
                        Joint Angles
                      </Text>
                      <View className="rounded-2xl bg-white/10 p-4">
                        {Object.entries(feedback.angles).map(([key, value]: [string, any]) => (
                          <View key={key} className="mb-2 flex-row justify-between">
                            <Text className="capitalize text-white/80">{key}:</Text>
                            <Text className="font-semibold text-white">{value}°</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Score */}
                  {feedback.score !== undefined && (
                    <View className="mb-6 items-center rounded-2xl bg-white/10 p-6">
                      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                        Form Score
                      </Text>
                      <Text className="text-5xl font-bold text-white">{feedback.score}/100</Text>
                    </View>
                  )}
                </>
              )}

              {/* Try Again Button */}
              <TouchableOpacity
                onPress={closeResults}
                className="mb-10 rounded-xl bg-blue-600 py-4"
                accessibilityLabel="Record another video">
                <Text className="text-center font-semibold text-white">Record Another</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Bottom Controls */}
        {!showResults && !isProcessing && (
          <View className="absolute bottom-0 left-0 right-0 pb-10">
            {/* Instructions */}
            <View className="mb-4 items-center px-6">
              <Text className="text-center text-sm text-white/80">
                {isRecording
                  ? `Recording... (${MAX_DURATION - recordingTime}s left)`
                  : `Record your exercise (max ${MAX_DURATION}s)`}
              </Text>
            </View>

            {/* Main Action Button */}
            <View className="items-center">
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                disabled={!cameraReady}
                accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
                activeOpacity={0.8}
                className={`items-center justify-center ${!cameraReady && 'opacity-50'}`}>
                {/* Outer Ring */}
                <View
                  className={`h-20 w-20 items-center justify-center rounded-full border-4 ${
                    isRecording ? 'border-red-500' : 'border-white'
                  }`}
                  style={{
                    shadowColor: isRecording ? '#ef4444' : '#fff',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                  }}>
                  {/* Inner Button */}
                  <View
                    className={`items-center justify-center rounded-full ${
                      isRecording ? 'h-6 w-6 bg-red-500' : 'h-14 w-14 bg-white'
                    }`}>
                    {!isRecording && <Ionicons name="videocam" size={24} color="#000" />}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Button Label */}
              <Text className="mt-3 font-medium text-white">{isRecording ? 'Stop' : 'Record'}</Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
