import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { completeLevel, LevelMode } from '../../misc/progress';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../misc/BackButton';
import NextButton from '../../misc/NextButton';

// Audio elements with positions matching the visualObjects from level_1.tsx
const dropZones = [
  {
    id: 1,
    name: 'obj_ale',
    position: {
      x: wp('11%'),
      y: hp('9%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
      borderColor: '#0046e3',
      backgroundColor: 'rgba(0, 70, 227, 0.3)',
      matchName: 'ale'
  },
  {
    id: 4,
    name: 'obj_nolo_nkuo',
    position: {
      x: wp('13%'),
      y: hp('23%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
      borderColor: '#e4191c',
      backgroundColor: 'rgba(228, 25, 28, 0.3)',
      matchName: 'nolo nkuo'
  },
  {
    id: 2,
    name: 'obj_kapo',
    position: {
      x: wp('13%'),
      y: hp('38%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
      borderColor: '#ede430',
      backgroundColor: 'rgba(237, 228, 48, 0.3)',
      matchName: 'kapo'
  },
  {
    id: 3,
    name: 'obj_nolo_kibi',
    position: {
      x: wp('7%'),
      y: hp('65%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
      borderColor: '#603f91',
      backgroundColor: 'rgba(96, 63, 145, 0.3)',
      matchName: 'nolo kibi'
  }
];

// Audio draggable elements
const draggableElements = [
  {
    id: 1,
    name: 'ale',
    audio: require('@/assets/audios/ale_alero.wav'),
  },
  {
    id: 2,
    name: 'kapo',
    audio: require('@/assets/audios/kapo_hamaca.wav'),
  },
  {
    id: 3,
    name: 'nolo kibi',
    audio: require('@/assets/audios/nolo_kibi_camino_antes_de_la_casa.wav'),
  },
  {
    id: 4,
    name: 'nolo nkuo',
    audio: require('@/assets/audios/nolo_nkuo_caminito_de_la_casa.wav'),
  },
];

const Level1Listen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  const [canContinue, setCanContinue] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');
  const [animatedValues] = useState(() =>
    dropZones.reduce((acc, zone) => {
      acc[zone.name] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  const LEVEL_ID = 1;
  const LEVEL_MODE = LevelMode.LISTEN;

  // Load speed preference from storage
  useEffect(() => {
    const loadSpeedPreference = async () => {
      try {
        const savedSpeed = await AsyncStorage.getItem('audioPlaybackSpeed');
        if (savedSpeed === 'slow' || savedSpeed === 'normal') {
          setPlaybackSpeed(savedSpeed);
        }
      } catch (error) {
        console.error('Error loading speed preference:', error);
      }
    };
    
    loadSpeedPreference();
  }, []);

  const playSound = async (audio: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(audio);
      
      // Set playback rate based on speed setting
      const rate = playbackSpeed === 'slow' ? 0.7 : 1.0;
      await sound.setRateAsync(rate, true); // true preserves pitch
      
      await sound.playAsync();
      
      // Clean up sound object after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  const togglePlaybackSpeed = async () => {
    const newSpeed = playbackSpeed === 'normal' ? 'slow' : 'normal';
    setPlaybackSpeed(newSpeed);
    
    try {
      await AsyncStorage.setItem('audioPlaybackSpeed', newSpeed);
    } catch (error) {
      console.error('Error saving speed preference:', error);
    }
  };

  const startPulseAnimation = (zoneName: string) => {
    animatedValues[zoneName].setValue(1);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValues[zoneName], {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(animatedValues[zoneName], {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const stopPulseAnimation = (zoneName: string) => {
    animatedValues[zoneName].stopAnimation();
    animatedValues[zoneName].setValue(1);
  };

  // When an audio button is tapped - similar to handleWordPress in level_1
  const handleAudioPress = (item: any) => {
    // Check if this audio is already matched to a zone
    const isMatched = Object.keys(matches).some(zoneName => {
      const zone = dropZones.find(z => z.name === zoneName);
      return zone && zone.matchName === item.name;
    });
    
    if (isMatched) return;
    
    // Play sound when selecting
    playSound(item.audio);
    
    if (selectedZone) {
      // A zone is already selected, check if they match
      const zone = dropZones.find(z => z.name === selectedZone);
      if (zone && zone.matchName === item.name) {
        // Correct match
        setMatches(prev => ({ ...prev, [zone.name]: true }));
        stopPulseAnimation(selectedZone);
        setSelectedZone(null);
        setSelectedAudio(null);
      } else {
        // Incorrect match - just toggle audio selection
        setSelectedAudio(selectedAudio?.name === item.name ? null : item);
      }
    } else {
      // No zone selected, just toggle audio selection
      setSelectedAudio(selectedAudio?.name === item.name ? null : item);
    }
  };

  // When a zone is tapped - similar to handleObjectPress in level_1
  const handleZonePress = (zone: any) => {
    // If this zone is already matched, do nothing
    if (matches[zone.name]) return;
    
    // If clicking the same zone, deselect it
    if (selectedZone === zone.name) {
      setSelectedZone(null);
      stopPulseAnimation(zone.name);
      return;
    }
    
    // If another zone was selected, stop its animation
    if (selectedZone) {
      stopPulseAnimation(selectedZone);
    }
    
    // Select this zone and start pulse animation
    setSelectedZone(zone.name);
    startPulseAnimation(zone.name);
    
    if (selectedAudio) {
      // An audio is already selected, check if they match
      if (selectedAudio.name === zone.matchName) {
        // Correct match
        setMatches(prev => ({ ...prev, [zone.name]: true }));
        stopPulseAnimation(zone.name);
        setSelectedZone(null);
        setSelectedAudio(null);
      }
      // If incorrect, zone stays selected with pulse animation
    }
  };

  // Enable Continue button when all matches are made
  useEffect(() => {
    if (Object.keys(matches).length === dropZones.length) {
      setCanContinue(true);
      // Mark level as completed
      completeLevel(LEVEL_ID, LEVEL_MODE);
    }
  }, [matches]);

  // Clean up animations
  useEffect(() => {
    return () => {
      Object.keys(animatedValues).forEach(key => {
        animatedValues[key].stopAnimation();
      });
    };
  }, [animatedValues]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/guia1juego1.png')}
          style={styles.backgroundImage}
          // resizeMode="contain"
          resizeMode={Platform.OS === 'web' ? 'contain' : 'stretch'}
        >
          {/* Back Button */}
          <View style={styles.buttonsBackContainer}>
            <BackButton navigation={navigation} />
          </View>

          {/* Speed Control Button */}
          <TouchableOpacity
            style={styles.speedButton}
            onPress={togglePlaybackSpeed}
          >
            <View style={[
              styles.speedButtonContent,
              { backgroundColor: playbackSpeed === 'slow' ? '#4CAF50' : '#2196F3' }
            ]}>
              <Image
                source={playbackSpeed === 'slow' 
                  ? require('@/assets/images/audio.png')  // You'll need to add this icon
                  : require('@/assets/images/audio.png') // You'll need to add this icon
                }
                style={styles.speedIcon}
                resizeMode="contain"
              />
              <Text style={styles.speedText}>
                {playbackSpeed === 'slow' ? 'Lento' : 'Normal'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Next Button */}
          {canContinue && (
            <View style={styles.buttonsNextContainer}>
              <NextButton navigation={navigation} nextName="LevelMapping" />
            </View>
          )}

          {/* Colored zones */}
          {dropZones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={{
                position: 'absolute',
                left: zone.position.x,
                top: zone.position.y,
                zIndex: 5,
              }}
              onPress={() => handleZonePress(zone)}
              disabled={!!matches[zone.name]}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: animatedValues[zone.name] }
                  ],
                  width: zone.size.width,
                  height: zone.size.height,
                  borderWidth: matches[zone.name] || selectedZone === zone.name ? 4 : 3,
                  borderColor: zone.borderColor,
                  backgroundColor: matches[zone.name] ? zone.backgroundColor : 'rgba(255, 255, 255, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 0,
                  opacity: 0.9,
                }}
              >
                {matches[zone.name] && (
                  <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}

          {/* Audio Buttons */}
          <View style={styles.buttonsContainer}>
            {draggableElements.map((item) => {
              // Check if this audio is matched to any zone
              const isMatched = dropZones.some(zone => 
                matches[zone.name] && zone.matchName === item.name
              );
              
              return (
                <View key={item.id} style={styles.buttonWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      selectedAudio && selectedAudio.name === item.name && styles.selectedAudio,
                      isMatched && {
                        opacity: 0.5,
                        backgroundColor: '#e0e0e0',
                        borderColor: '#999',
                      }
                    ]}
                    onPress={() => handleAudioPress(item)}
                    disabled={isMatched}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={require('@/assets/images/audio.png')} 
                      style={[
                        styles.audioIcon,
                        isMatched && { opacity: 0.6 }
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backgroundImage: {
    alignSelf: 'center',
    width: wp('80%'),
    height: hp('100%'),
    top: hp('-2%'),
  },
  buttonsBackContainer: {
    position: 'absolute',
    top: hp('-1%'),
    left: wp('-8%'),
    zIndex: 1,
  },
  buttonsNextContainer: {
    position: 'absolute',
    bottom: hp('-3%'),
    right: wp('-6%'),
    zIndex: 1,
  },
  speedButton: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('5%'),
    zIndex: 10,
  },
  speedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  speedIcon: {
    width: wp('4%'),
    height: hp('4%'),
    marginRight: wp('1%'),
  },
  speedText: {
    color: 'white',
    fontSize: hp('2%'),
    fontWeight: 'bold',
  },
  buttonsContainer: {
    position: 'absolute',
    top: hp('82%'),
    left: wp('2%'),
    width: wp('25%'),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: wp('1%'),
  },
  buttonWrapper: {
    width: wp('11%'),
    height: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: hp('0.5%'),
    width: wp('11%'),
    height: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAudio: {
    backgroundColor: '#f0f0f0',
    borderColor: '#677',
    borderWidth: 1.5,
  },
  audioIcon: {
    width: wp('6%'),
    height: hp('3%'),
    resizeMode: 'contain',
  },
});

export default Level1Listen;