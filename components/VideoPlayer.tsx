import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Dimensions
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Slider from '@/components/Slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  RotateCw
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Text from '@/components/Text';

interface VideoPlayerProps {
  uri: string;
  style?: object;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, style }) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPlaying = status?.isLoaded && status.isPlaying;
  const isMuted = status?.isLoaded && status.isMuted;
  const duration = status?.isLoaded ? status.durationMillis || 0 : 0;
  const position = status?.isLoaded ? status.positionMillis : 0;

  useEffect(() => {
    if (!isSeeking && status?.isLoaded) {
      setSliderValue(status.positionMillis / (status.durationMillis || 1));
    }
  }, [status, isSeeking]);

  useEffect(() => {
    // Hide controls after 3 seconds if video is playing
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [showControls, isPlaying]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded && loading) {
      setLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setShowControls(true);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    await videoRef.current.setIsMutedAsync(!isMuted);
    setShowControls(true);
  };

  const toggleFullscreen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setFullscreen(!fullscreen);
    setShowControls(true);
  };

  const skipForward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newPosition = Math.min(status.positionMillis + 10000, status.durationMillis || 0);
    await videoRef.current.setPositionAsync(newPosition);
    setShowControls(true);
  };

  const skipBackward = async () => {
    if (!videoRef.current || !status?.isLoaded) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newPosition = Math.max(0, status.positionMillis - 10000);
    await videoRef.current.setPositionAsync(newPosition);
    setShowControls(true);
  };

  const restartVideo = async () => {
    if (!videoRef.current) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    await videoRef.current.setPositionAsync(0);
    await videoRef.current.playAsync();
    setShowControls(true);
  };

  const onSlidingStart = () => {
    setIsSeeking(true);
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    }
  };

  const onSlidingComplete = async (value: number) => {
    if (!videoRef.current || !status?.isLoaded) return;
    
    const newPosition = value * (status.durationMillis || 1);
    await videoRef.current.setPositionAsync(newPosition);
    setIsSeeking(false);
    
    if (isPlaying) {
      videoRef.current.playAsync();
    }
  };

  // For web compatibility
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <video
          src={uri}
          style={{ width: '100%', height: '100%' }}
          controls
          playsInline
        />
      </View>
    );
  }

  const videoContainerStyle = fullscreen ? {
    ...styles.fullscreenContainer,
    backgroundColor: 'black',
  } : styles.videoContainer;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={videoContainerStyle}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {showControls && !loading && (
          <View style={styles.controlsContainer}>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.fullscreenButton]}
                onPress={toggleFullscreen}
              >
                {fullscreen ? (
                  <Minimize size={20} color="white" />
                ) : (
                  <Maximize size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.skipButton]}
                onPress={skipBackward}
              >
                <SkipBack size={24} color="white" />
                <Text style={styles.skipText}>10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton, { backgroundColor: colors.primary }]}
                onPress={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause size={28} color="white" />
                ) : (
                  <Play size={28} color="white" fill="white" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.skipButton]}
                onPress={skipForward}
              >
                <SkipForward size={24} color="white" />
                <Text style={styles.skipText}>10s</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Slider
                  value={sliderValue}
                  onSlidingStart={onSlidingStart}
                  onSlidingComplete={onSlidingComplete}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={colors.primary}
                />
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(position)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(duration)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity
                  style={[styles.controlButton, styles.volumeButton]}
                  onPress={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX size={20} color="white" />
                  ) : (
                    <Volume2 size={20} color="white" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.controlButton, styles.volumeButton]}
                  onPress={restartVideo}
                >
                  <RotateCw size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  bottomControls: {
    padding: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  skipButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 10,
    marginTop: -2,
  },
  volumeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default VideoPlayer;