import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { ActivityIndicator, View } from 'react-native';
import { PlacesProvider } from './src/context/PlacesContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import ListScreen from './src/screens/ListScreen';
import MapScreen from './src/screens/MapScreen';
import VoteScreen from './src/screens/VoteScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import GroupScreen from './src/screens/GroupScreen';
import PickPlaceScreen from './src/screens/PickPlaceScreen';
import PickGroupScreen from './src/screens/PickGroupScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import GroupListScreen from './src/screens/GroupListScreen';
import PickTagsScreen from './src/screens/PickTagsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// placefinder://join?code=K7P2QX (i exp://.../--/join?code=... w Expo Go) -> zakładka Głosowanie z kodem
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'placefinder://'],
  config: {
    screens: {
      Tabs: { screens: { Głosowanie: 'join' } },
    },
  },
};

// [aktywna, nieaktywna]
const TAB_ICONS: Record<keyof TabParamList, [IoniconsIconName, IoniconsIconName]> = {
  Lista: ['list', 'list-outline'],
  Mapa: ['map', 'map-outline'],
  Głosowanie: ['thumbs-up', 'thumbs-up-outline'],
  Profil: ['person', 'person-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#3355aa',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Lista" component={ListScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Głosowanie" component={VoteScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3355aa" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: 'Szczegóły', headerBackTitle: 'Wróć' }}
          />
          <Stack.Screen name="Group" component={GroupScreen} options={{ title: 'Grupa', headerBackTitle: 'Wróć' }} />
          <Stack.Screen name="PickPlace" component={PickPlaceScreen} options={{ title: 'Zaproponuj lokal', presentation: 'modal' }} />
          <Stack.Screen name="PickGroup" component={PickGroupScreen} options={{ title: 'Wybierz grupę', presentation: 'modal' }} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Ulubione', headerBackTitle: 'Wróć' }} />
          <Stack.Screen name="GroupList" component={GroupListScreen} options={{ title: 'Moje grupy', headerBackTitle: 'Wróć' }} />
          <Stack.Screen name="PickTags" component={PickTagsScreen} options={{ title: 'Czego szukam', presentation: 'modal' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </PlacesProvider>
    </AuthProvider>
  );
}
