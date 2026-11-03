import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { PlacesProvider } from './src/context/PlacesContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import ListScreen from './src/screens/ListScreen';
import MapScreen from './src/screens/MapScreen';
import VoteScreen from './src/screens/VoteScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DetailsScreen from './src/screens/DetailsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

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

export default function App() {
  return (
    <PlacesProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: 'Szczegóły', headerBackTitle: 'Wróć' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PlacesProvider>
  );
}
