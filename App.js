/**
 * Sample OIDC React Native App
 * @format
 * @flow strict-local
 */
import React, { Component} from 'react';
import { Button, StyleSheet, View, Text, ScrollView} from 'react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import { Buffer } from 'buffer';

const configs = {
  provider : {
    issuer: 'https://amlab4.personal.com.ar:8543/openam',
    clientId: 'mobile',
    redirectUrl: 'com.identicum.mobile.demo:/oauthredirect',
    additionalParameters: {},
    scopes: ['openid', 'profile'],
    serviceConfiguration: {
       authorizationEndpoint: 'https://amlab4.personal.com.ar:8543/openam/oauth2/authorize',
       tokenEndpoint: 'https://amlab4.personal.com.ar:8543/openam/oauth2/access_token',
       revocationEndpoint: 'https://amlab4.personal.com.ar:8543/openam/oauth2/token/revoke'
    }
  }
};  

class App extends Component {
      constructor(props) {
        super(props);
        this.state = { accessToken: '', idToken : '' };
      }
      decodeJwt = (idToken) => {
        console.log("____ Decoding ID token: " + this.state.idToken)
        const jwtBody = idToken.split('.')[1];
        const base64 = jwtBody.replace('-', '+').replace('_', '/');
        const decodedJwt = Buffer.from(base64, 'base64');
        console.log("____ Decoded ID token: " + decodedJwt)
        return JSON.parse(decodedJwt);
      }
      _onLogin = () => { 
        console.log("___ Login...")
        authorize(configs.provider).then(authResponse => {
            console.log("___ Response:" + authResponse);
            let idTokenJSON = 
            this.setState( { 
              accessToken: authResponse.accessToken , 
              idToken : authResponse.idToken
            });
          })
          .catch(error => console.log(error));
       };

      _onLogout = () => {
        console.log("___ Logout...")
        // TODO: Handling revoke token
        /**
        revoke(configs.provider, { tokenToRevoke: this.state.accessToken, sendClientId: true}).then(success => {
           console.log(success);
        })
        .catch(error => console.log(error));
        **/
        this.setState({ 
          accessToken: '',
          idToken : ''
        });
      };
      render() {
        let loggedIn = this.state.accessToken == '' ? false : true;
        let decodedJwt;
        if(loggedIn)
          decodedJwt = this.decodeJwt(this.state.idToken);
        console.log("___ User is logged in : " + loggedIn );
        return (
                <View style={styles.container}>
                  <View>
                    <Text style={styles.headerText}>{ loggedIn ? "User: " +  decodedJwt.sub : "Welcome" } </Text>
                  </View>
                  <View style={styles.content}>
                { loggedIn ? (
                  <ScrollView contentContainerStyle={{ paddingTop: 10, flexGrow: 1, justifyContent: 'center' , width: "100%"}}>
                    <View style = {[{ width: "90%" , marginBottom : 50}]}>
                            <View >
                              <Text style={styles.fieldHeader}>Access Token</Text>
                              <Text style={styles.fieldValue} selectable>{this.state.accessToken}</Text>
                              <Text style={styles.fieldHeader}>ID Token </Text>
                              <Text style={styles.fieldValue} selectable> {JSON.stringify(decodedJwt)}</Text>
                              <Text style={styles.fieldHeader}>ID Token (JWT)</Text>
                              <Text style={styles.fieldValue} selectable>{this.state.idToken}</Text>
                            </View> 
                    </View>
                </ScrollView>
                 ): <View></View>}
              <View style={ loggedIn ? styles.bottomView : [{ width: "90%"}] } >
                  <Button  onPress = { loggedIn ? this._onLogout : this._onLogin } title = { loggedIn ? 'Log Out' : 'Log In' } />
              </View>
              </View>
            </View>
        );
      }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
     },
     content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
     },
     headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 35
      },
    fieldHeader : {
      alignSelf:'center',
      fontSize: 20,
      justifyContent:'center',
      alignItems:'center'
    },
    bottomView:{
      width: '90%', 
      position: 'absolute',
      bottom: 20
    },
    fieldValue : {
      color: '#0071BC',
      fontSize: 15,
      margin: 20
    }
});

export default App;
