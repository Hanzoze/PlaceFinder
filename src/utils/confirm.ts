import { Alert } from 'react-native';

// Pyta przed usunięciem lokalu z ulubionych
export function confirmRemoveFavorite(placeName: string, onConfirm: () => void) {
  Alert.alert('Usunąć z ulubionych?', `Czy na pewno chcesz usunąć „${placeName}” z ulubionych?`, [
    { text: 'Anuluj', style: 'cancel' },
    { text: 'Usuń', style: 'destructive', onPress: onConfirm },
  ]);
}
