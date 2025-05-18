// app/utils/AppConstants.js

import {Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const AppConstants = {
  primaryColor: '#2a534e', // Dark blue color (primary color)
  secondaryColor: '#DABB97', // Light blue color (secondary color)
  brightColor: '#fff', // Light blue color (secondary color)

 
  primaryBackgroundGradient: [
    'rgba(255, 221, 176, 0.25)', // Top
    'rgba(61, 92, 81, 1)', // Bottom
  ],

  // Primary and Secondary button colors with gradient effect
  primaryButton: () => (
    <LinearGradient
      colors={AppConstants.primaryButtonGradient}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      }}>
      {/* This will be used as a gradient button */}
    </LinearGradient>
  ),

  secondaryButton: () => (
    <LinearGradient
      colors={AppConstants.secondaryButtonGradient}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      }}>
      {/* This will be used as a gradient button */}
    </LinearGradient>
  ),

  // Font families for text (Use the fonts you've linked or default fonts)
  primaryTextFont: Platform.OS === 'ios' ? 'Roboto' : 'sans-serif', // Primary font family
  secondaryTextFont: Platform.OS === 'ios' ? 'Poppins' : 'sans-serif-medium', // Secondary font family
};
