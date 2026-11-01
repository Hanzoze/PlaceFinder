import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlacesProvider } from './src/context/PlacesContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import ListScreen from './src/screens/ListScreen';
import MapScreen from './src/screens/MapScreen';
import VoteScreen from './src/screens/VoteScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DetailsScreen from './src/screens/DetailsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator>
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
