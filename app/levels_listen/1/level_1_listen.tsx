import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
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
      x: wp('25%'),
      y: hp('48%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    matchName: 'ale'
  },
  {
    id: 2,
    name: 'obj_nolo_nkuo',
    position: {
      x: wp('15%'),
      y: hp('110%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
    borderColor: 'yellow',
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    matchName: 'nolo nkuo'
  },
  {
    id: 3,
    name: 'obj_kapo',
    position: {
      x: wp('56%'),
      y: hp('101%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
    borderColor: 'orange',
    backgroundColor: 'rgba(255, 165, 0, 0.3)',
    matchName: 'kapo'
  },
  {
    id: 4,
    name: 'obj_nolo_kibi',
    position: {
      x: wp('45%'),
      y: hp('108%')
    },
    size: {
      width: wp('5.5%'),
      height: hp('5.5%')
    },
    borderColor: 'lime',
    backgroundColor: 'rgba(86, 255, 24, 0.77)',
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
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  const [canContinue, setCanContinue] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');
  const [animatedValues] = useState(() => 
    dropZones.reduce((acc, zone) => {
      acc[zone.name] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

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

  // When an audio button is tapped
  const handleAudioPress = (item: any) => {
    if (Object.values(matches).includes(item.name)) return;
    setSelectedAudio(item);
    playSound(item.audio);
  };

  // When a zone is tapped
  const handleZonePress = (zone: any) => {
    if (matches[zone.name]) return;
    
    if (!selectedAudio) {
      // If no audio is selected, highlight this zone
      startPulseAnimation(zone.name);
      setTimeout(() => {
        stopPulseAnimation(zone.name);
      }, 2000);
      return;
    }
    
    if (selectedAudio.name === zone.matchName) {
      // Correct match
      setMatches(prev => ({ ...prev, [zone.name]: true }));
      setSelectedAudio(null);
    } else {
      // Incorrect match
      setSelectedAudio(null);
    }
  };

  // Enable Continue button when all matches are made
  useEffect(() => {
    if (Object.keys(matches).length === dropZones.length) {
      setCanContinue(true);
    }
  }, [matches]);

  // Clean up animations
  useEffect(() => {
    return () => {
      Object.keys(animatedValues).forEach(key => {
        animatedValues[key].stopAnimation();
      });
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/guia1juego.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
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
                  borderWidth: 3,
                  borderColor: zone.borderColor,
                  backgroundColor: matches[zone.name] ? zone.backgroundColor : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
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
              const isMatched = Object.values(matches).some((matched, index) => {
                return matched && dropZones[index].matchName === item.name;
              });
              
              return (
                <View key={item.id} style={styles.buttonWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      selectedAudio && selectedAudio.name === item.name && styles.selectedAudio,
                      isMatched && {
                        opacity: 0.5,
                      }
                    ]}
                    onPress={() => handleAudioPress(item)}
                    disabled={isMatched}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={require('@/assets/images/audio.png')} 
                      style={styles.audioIcon}
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
    width: wp('100%'),
    height: hp('135%'),
    top: hp('-2%'),
  },
  buttonsBackContainer: {
    position: 'absolute',
    top: hp('-2%'),
    left: wp('-8%'),
    zIndex: 1,
  },
  buttonsNextContainer: {
    position: 'absolute',
    bottom: hp('-0%'),
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
    top: hp('30%'),
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