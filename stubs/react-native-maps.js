const React = require('react');
const { View, Text } = require('react-native');

const MapView = ({ children, style }) =>
  React.createElement(
    View,
    { style: [{ backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }, style] },
    React.createElement(Text, null, 'Map is not available on web'),
    children
  );

const Noop = () => null;

module.exports = {
  __esModule: true,
  default: MapView,
  MapView,
  Marker: Noop,
  Callout: Noop,
  Polyline: Noop,
  Polygon: Noop,
  Circle: Noop,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: null,
};
