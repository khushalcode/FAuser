/**
 * SafePressable — drop-in Pressable that resolves style/children functions
 * itself. NativeWind's JSX runtime drops style={({ pressed }) => ...} in
 * release APKs (no padding, margins, backgrounds, row layout).
 */
import React from 'react';
import { Pressable as RNPressable, PressableProps } from 'react-native';

export const Pressable = React.forwardRef<any, PressableProps>(function Pressable(
  { style, children, onPressIn, onPressOut, ...rest },
  ref
) {
  const [pressed, setPressed] = React.useState(false);
  const state = { pressed } as any;
  const resolvedStyle = typeof style === 'function' ? style(state) : style;
  const resolvedChildren = typeof children === 'function' ? children(state) : children;

  return (
    <RNPressable
      ref={ref}
      {...rest}
      style={resolvedStyle as any}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
    >
      {resolvedChildren}
    </RNPressable>
  );
});

export default Pressable;
