// apps/mobile/App.tsx — Versión final MVP
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "app/lib/store";
import { LoginScreen }           from "app/screens/LoginScreen";
import { RegisterScreen }        from "app/screens/RegisterScreen";
import { DashboardScreen }       from "app/screens/DashboardScreen";
import { NewIncidentScreen }     from "app/screens/NewIncidentScreen";
import { IncidentsListScreen }   from "app/screens/IncidentsListScreen";
import { SuppliersScreen }       from "app/screens/SuppliersScreen";
import { CompanySettingsScreen } from "app/screens/CompanySettingsScreen";
import "../global.css";

type RootStackParamList = {
  Login: undefined; Register: undefined;
  Dashboard: undefined; NewIncident: undefined;
  IncidentsList: undefined; Suppliers: undefined;
  CompanySettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#020617" } }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Dashboard"       component={DashboardScreen} />
              <Stack.Screen name="IncidentsList"   component={IncidentsListScreen} />
              <Stack.Screen name="NewIncident"     component={NewIncidentScreen} options={{ presentation: "modal" }} />
              <Stack.Screen name="Suppliers"       component={SuppliersScreen} />
              <Stack.Screen name="CompanySettings" component={CompanySettingsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login"    component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: "modal" }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
