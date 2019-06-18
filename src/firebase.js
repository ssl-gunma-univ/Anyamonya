import firebase from 'firebase/app'
import 'firebase/firestore'

var firebaseConfig = {
    apiKey: 'AIzaSyDqjPTjjIVYbnQpDAkiw3E0QGAiRB651_8',
    authDomain: 'yt-vue-firestore-chat-bc170.firebaseapp.com',
    databaseURL: 'https://yt-vue-firestore-chat-bc170.firebaseio.com',
    projectId: 'yt-vue-firestore-chat-bc170',
    storageBucket: 'yt-vue-firestore-chat-bc170.appspot.com',
    messagingSenderId: '21103090828',
    appId: '1:21103090828:web:02eebe3c23c74a54'
  }
  
  firebase.initializeApp(firebaseConfig)
  
  export const db = firebase.firestore()