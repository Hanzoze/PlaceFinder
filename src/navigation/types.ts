import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabParamList = {
  Lista: undefined;
  Mapa: undefined;
  Głosowanie: undefined;
  Profil: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Details: { placeId: string };
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
