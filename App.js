// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SidebarProvider } from './context/SidebarContext';
import MenuScreen from './Screens/MenuScreen';
import StockScreen from './Screens/StockScreen';
import HealthAlertsScreen from './Screens/HealthAlertsScreen';
import PromotionsScreen from './Screens/PromotionsScreen';
import StaffScreen from './Screens/StaffScreen';
import ReservationsScreen from './Screens/ReservationsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SidebarProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Menu"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Stock" component={StockScreen} />
          <Stack.Screen name="HealthAlerts" component={HealthAlertsScreen} />
          <Stack.Screen name="Promotions" component={PromotionsScreen} />
          <Stack.Screen name="Staff" component={StaffScreen} />
          <Stack.Screen name="Reservations" component={ReservationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SidebarProvider>
  );
}
