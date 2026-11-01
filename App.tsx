import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListScreen from './src/screens/ListScreen';
import MapScreen from './src/screens/MapScreen';
import VoteScreen from './src/screens/VoteScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Lista" component={ListScreen} />
        <Tab.Screen name="Mapa" component={MapScreen} />
        <Tab.Screen name="Głosowanie" component={VoteScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}