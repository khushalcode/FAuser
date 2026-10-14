import { Platform } from 'react-native';

export const shadow = (
  elevation = 4,
  color = '#000',
  opacity = 0.15
) =>
  Platform.select({
    web: { boxShadow: `0px ${elevation / 2}px ${elevation * 2}px rgba(0,0,0,${opacity})` },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: elevation * 2,
      elevation,
    },
  }) as any;
