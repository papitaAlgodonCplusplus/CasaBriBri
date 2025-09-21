// app/misc/responsiveLayoutElement.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const dpiScale = PixelRatio.get();

export const getResponsivePos = (baseXPercent: number, baseYPercent: number) => {
  const baseX = screenWidth * (baseXPercent / 100);
  const baseY = screenHeight * (baseYPercent / 100);
  const correctionFactor = dpiScale > 2.5 ? 0.5 : 0.5;
  return { x: baseX * correctionFactor, y: baseY * correctionFactor };
};

export const getResponsivePosBack = (baseXPercent: number, baseYPercent: number) => {
  const baseX = screenWidth * (baseXPercent / 100);
  const baseY = screenHeight * (baseYPercent / 100);
  const correctionFactor = dpiScale > 2.5 ? 0.5 : 0.5;
  return { left: baseX * correctionFactor, top: baseY * correctionFactor };
};


export const getResponsivePosNext = (baseXPercent: number, baseYPercent: number) => {
  const baseX = screenWidth * (baseXPercent / 100);
  const baseY = screenHeight * (baseYPercent / 100);
  const correctionFactor = dpiScale > 2.5 ? 0.5 : 0.5;
  return {
    right: (screenWidth - baseX) * correctionFactor,
    bottom: (screenHeight - baseY) * correctionFactor,
  };
};


