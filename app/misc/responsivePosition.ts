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
