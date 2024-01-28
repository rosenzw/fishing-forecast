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
            renderItem={({ item }) => (
                <View style={styles.predictionRow}>
                    <Text style={styles.headerText}>Location:</Text>
                    <Text>{item.location}</Text>
                    <Text style={styles.headerText}>Date:</Text>
                    <Text>{item.date}</Text>
                    <Text style={styles.headerText}>Details:</Text>
                    <Text>{item.details}</Text>
                </View>
            )}
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
      backgroundColor: 'black',
      paddingHorizontal: 8
    },
    buttonText: { color: 'white', padding: 16, fontSize: 18 },
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
