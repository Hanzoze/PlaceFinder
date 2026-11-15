import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabParamList = {
  Lista: undefined;
  Mapa: undefined;
  Głosowanie: { code?: string } | undefined;   // code z linku zaproszenia
  Profil: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  Details: { placeId: string };
  Group: { groupId: string };
  PickPlace: { groupId: string };       // wybór lokalu do propozycji
  PickGroup: { placeId: string };       // wybór grupy dla lokalu (z Details)
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
