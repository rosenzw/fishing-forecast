import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  SafeAreaView,
  View,
  FlatList
} from 'react-native';

import {
  withAuthenticator,
  useAuthenticator
} from '@aws-amplify/ui-react-native';

import { Amplify } from "aws-amplify";
import { fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';

import colors from './assets/colors/colors.js';

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
    
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Welcome to the Fishing Predictor App!</Text>
            <FlatList
            data={predictions}
            renderItem={({ item }) => {
                const locationObject = JSON.parse(item.location);
                const locationName = locationObject.name;
                return (
                <View style={styles.locationContainer}>
                    <Text>{locationName}</Text>
                    <Text>{item.details}</Text>
                </View>);
            }}
            keyExtractor={item => item.id}
        />
            <SignOutButton>
            </SignOutButton>
        </SafeAreaView>
    );    
}

const styles = StyleSheet.create({
    container: { width: 400, flex: 1, padding: 20, alignSelf: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', alignSelf: 'center' },
    buttonContainer: {
      alignSelf: 'center',
      backgroundColor: colors.button_background,
      paddingHorizontal: 8,
      borderRadius: 8
    },
    locationContainer: {
        alignSelf: 'center',
        backgroundColor: colors.location_background,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderTopWidth: 4,
        borderTopColor: colors.app_background,
        borderBottomWidth: 4,
        borderBottomColor: colors.app_background      
    },
    buttonText: { color: colors.button_text, padding: 16, fontSize: 18 },
    predictionRow: {
        // Add styles for table rows
        paddingHorizontal: 20
    },
    headerText: {
        fontWeight: 'bold',
        // Add other header styles
    },
  });

export default withAuthenticator(App);
