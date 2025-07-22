import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAppSelector} from '@store/index';
import {selectIsAuthenticated, selectIsOnboarded} from '@store/index';

// Screens
import {LoginScreen, RegisterScreen, ForgotPasswordScreen} from '@screens/auth';
import {HomeScreen} from '@screens/main';
import {
  VideoListScreen,
  VideoDetailScreen,
  VideoRecordScreen,
} from '@screens/video';
import {AnalysisListScreen, AnalysisDetailScreen} from '@screens/analysis';
import {ProfileScreen, SettingsScreen} from '@screens/profile';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Videos: undefined;
  Analysis: undefined;
  Profile: undefined;
};

export type VideoStackParamList = {
  VideoList: undefined;
  VideoDetail: {videoId: string};
  VideoRecord: undefined;
  VideoEdit: {videoId: string};
};

export type AnalysisStackParamList = {
  AnalysisList: undefined;
  AnalysisDetail: {analysisId: string};
  AnalysisCreate: {videoId?: string};
  AnalysisCompare: {analysisIds: string[]};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  ProfileSettings: undefined;
  ProfileStats: undefined;
  ProfileSubscription: undefined;
};

// Stack Navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const VideoStack = createNativeStackNavigator<VideoStackParamList>();
const AnalysisStack = createNativeStackNavigator<AnalysisStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

// Video Navigator
function VideoNavigator() {
  return (
    <VideoStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <VideoStack.Screen name="VideoList" component={VideoListScreen} />
      <VideoStack.Screen name="VideoDetail" component={VideoDetailScreen} />
      <VideoStack.Screen name="VideoRecord" component={VideoRecordScreen} />
    </VideoStack.Navigator>
  );
}

// Analysis Navigator
function AnalysisNavigator() {
  return (
    <AnalysisStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AnalysisStack.Screen
        name="AnalysisList"
        component={AnalysisListScreen}
      />
      <AnalysisStack.Screen
        name="AnalysisDetail"
        component={AnalysisDetailScreen}
      />
    </AnalysisStack.Navigator>
  );
}

// Profile Navigator
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <ProfileStack.Screen name='ProfileMain' component={ProfileScreen} />
      <ProfileStack.Screen name='ProfileSettings' component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({color, size}) => (
            // Icon placeholder - replace with actual icon component
            <></>
          ),
        }}
      />
      <MainTab.Screen
        name="Videos"
        component={VideoNavigator}
        options={{
          tabBarLabel: 'Vídeos',
          tabBarIcon: ({color, size}) => (
            // Icon placeholder - replace with actual icon component
            <></>
          ),
        }}
      />
      <MainTab.Screen
        name="Analysis"
        component={AnalysisNavigator}
        options={{
          tabBarLabel: 'Análises',
          tabBarIcon: ({color, size}) => (
            // Icon placeholder - replace with actual icon component
            <></>
          ),
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({color, size}) => (
            // Icon placeholder - replace with actual icon component
            <></>
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOnboarded = useAppSelector(selectIsOnboarded);

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={MainNavigator} />
      )}
    </RootStack.Navigator>
  );
}

// App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// Navigation utilities
export const navigationRef = React.createRef<any>();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function reset(routeName: string) {
  navigationRef.current?.reset({
    index: 0,
    routes: [{name: routeName}],
  });
}
