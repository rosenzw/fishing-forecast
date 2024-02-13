import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  SafeAreaView,
  View,
  FlatList,
  Button,
  Image
} from 'react-native';

import {
  useAuthenticator,
  Authenticator,
  useTheme
} from '@aws-amplify/ui-react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';

// Go here for icon included: https://icons.expo.fyi/Index
import {Ionicons} from '@expo/vector-icons';

import colors from './assets/colors/colors.js';

const Stack = createNativeStackNavigator();


Amplify.configure({
    Auth: {
    Cognito: {
        userPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID,
        userPoolClientId: process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID
    }
    },
    API: {
    REST: {
        predictions: {
        endpoint: process.env.EXPO_PUBLIC_AWS_API_ENDPOINT,
        region: process.env.EXPO_PUBLIC_AWS_API_REGION
        }
    }
    }
});

// retrieves only the current value of 'user' from 'useAuthenticator'
const userSelector = (context) => [context.user];

const SignOutButton = () => {
  const { user, signOut } = useAuthenticator(userSelector);

  return (
    <Pressable onPress={signOut} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        Hello, {user.username}! Click here to sign out!
      </Text>
    </Pressable>
  );
};

const MyAppHeader = () => {
    const {
      tokens: { space, fontSizes },
    } = useTheme();
    return (
      <View>
        <Text style={{ color: colors.text_body, fontSize: fontSizes.xxxl, padding: space.xl }}>
          Fishing Forecast
        </Text>
      </View>
    );
};

const App = () => {

    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

  
    async function fetchItems() {
      try {
          const { idToken } = (await fetchAuthSession()).tokens ?? {};
          console.log(idToken.toString());
  
        const restOperation = get({ 
          apiName: 'predictions',
          path: '/predictions',
          options: {
              headers: { 
                  Authorization: idToken
              }
          }
        });
        const response = await restOperation.response;
        const json = await response.body.json();
        console.log('GET call succeeded: ', json);
        setPredictions(json);
      } catch (error) {
        console.log('GET call failed: ', error);
      }
    }

    const Home = ({navigation}) => {
        return (
            <SafeAreaView style={styles.appContainer}>
                <View style={styles.headerContainer}>
                    <Image
                        source={require('./assets/images/profile.png')}
                        style={styles.profileImage}
                    />
                    <Image
                        source={require('./assets/images/logo.png')}
                        style={styles.logoImage}
                    />
                    <Text style={styles.title}>Fishing Forecast</Text>
                    <Pressable onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="settings-sharp" size={24} color={colors.text_body} />
                    </Pressable>
                </View>
                <FlatList
                    style={styles.predictionsContainer}
                    data={predictions}
                    renderItem={({ item }) => {
                        const locationObject = JSON.parse(item.location);
                        const locationName = locationObject.name;
                        return (
                            <Pressable onPress={() => navigation.navigate('Details', {prediction: item})}>
                                <View style={styles.locationContainer}>
                                    <Text style={styles.locationTitle}>{locationName}</Text>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="rainy" size={32} color="green" />
                                        <Ionicons name="fish" size={24} color="black" />
                                    </View>
                                </View>
                            </Pressable>
                            );
                    }}
                    keyExtractor={item => item.id}
                />
            </SafeAreaView>
        )
    }

    const Settings = ({navigation}) => {
        return (
            <SafeAreaView style={styles.appContainer}>
                <Button title="Go back" onPress={() => navigation.goBack()} />
                <Text>Settings setup</Text>
            </SafeAreaView>
        )
    }

    const Details = ({navigation, route}) => {
        const prediction = route.params.prediction;
        const locationObject = JSON.parse(prediction.location);
        const locationName = locationObject.name;   

        return (
            <SafeAreaView style={styles.appContainer}>
                <Button title="Go back" onPress={() => navigation.goBack()} />
                <Text>Details for {locationName}</Text> 
                <Text>{prediction.details}</Text>
            </SafeAreaView>
        )
    }
    
    return (
        <Authenticator.Provider>
            <Authenticator
                // will wrap every subcomponent
                Container={(props) => (
                    // reuse default `Container` and apply custom background
                    <Authenticator.Container
                        {...props}
                        style={{ borderColor:colors.button_background, backgroundColor: colors.app_background}}
                    />
                )}
                // will render on every subcomponent
                Header={MyAppHeader}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
                        <Stack.Screen name="Settings" component={Settings} />
                        <Stack.Screen name="Details" component={Details} />
                    </Stack.Navigator>
                </NavigationContainer>
                <SignOutButton>
                </SignOutButton>
            </Authenticator>
        </Authenticator.Provider>
    );    
}

const styles = StyleSheet.create({
    appContainer: { flex: 1, padding: 20, alignSelf: 'center', margin: 10 },
    title: { fontSize: 20, fontWeight: 'bold', alignSelf: 'center' },
    buttonContainer: {
      alignSelf: 'center',
      backgroundColor: colors.button_background,
      paddingHorizontal: 8,
      borderRadius: 8
    },
    iconContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.location_background,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderTopWidth: 4,
        borderTopColor: colors.app_background,
        borderBottomWidth: 4,
        borderBottomColor: colors.app_background      
    },
    locationTitle: {
        fontSize: 24,
    },
    predictionsContainer: {
        alignSelf: 'center',
        backgroundColor: colors.app_background
    },
    buttonText: { color: colors.button_text, padding: 16, fontSize: 18 },
    predictionRow: {
        // Add styles for table rows
        paddingHorizontal: 20
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:0,
        alignItems: 'center'
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        paddingTop:20
    },
    logoImage:{
        width: 50,
        height: 50,
        paddingTop:20
    },
    headerText: {
        fontWeight: 'bold',
        // Add other header styles
    },
  });

export default App;
