import BackButton from '@/app/misc/BackButton';
import NextButton from '@/app/misc/NextButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Platform, StyleSheet, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Guide = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const bgImage = require('@/assets/images/guia7.png');

    const [mode, setMode] = useState<'read' | 'listen' | null>(null);

    useEffect(() => {
        const fetchMode = async () => {
            const storedMode = await AsyncStorage.getItem('mode');
            setMode(storedMode === 'read' || storedMode === 'listen' ? storedMode : 'listen');
        };
        fetchMode();
    }, []);

    return (
        <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ImageBackground
            source={bgImage}
            style={styles.bgImage}
            imageStyle={{ resizeMode: 'contain' }}>
            <View style={styles.buttonsBackContainer}>
              <BackButton navigation={navigation} />
            </View>
            <View style={styles.buttonsNextContainer}>
                <NextButton navigation={navigation} nextName="Level7" />
            </View>
          </ImageBackground>
        </SafeAreaView>
      </SafeAreaProvider>
    );
};

const styles: { [key: string]: any } = StyleSheet.create({
    container: {
        flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffff',
      },
      bgImage: Platform.OS === 'web' ? {
        flex: 1,
        width: wp('80%'),
        height: hp('90%'),
      } : {
        flex: 1,
        width: wp('80%'),
        height: hp('90%'),
      },
      buttonsBackContainer: {
        position: 'absolute',
        top: hp('-3%'),
        left: wp('-8%'),
        resizeMode: 'cover',
    },
    buttonsNextContainer: {
        position: 'absolute',
        bottom: hp('-1%'),
        right: wp('-6%'),
    }
});

export default Guide;
