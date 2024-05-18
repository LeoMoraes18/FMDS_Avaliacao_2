// Utilities
import { defineStore } from "pinia";
import { getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { collection, doc, setDoc } from 'firebase/firestore';
import db from '@/plugins/firebase';
import router from "@/router";

const usersCollection = collection(db, 'users');
const auth = getAuth(getApp())

export const useUserStore = defineStore("user", {
  state: () => ({
    user: {
      displayName: null,
      email: null,
      uid: null,
      photoURL: null
    }
  }),
  getters: {
    isAuthenticated() {
      return !!this.user.uid
    }
  },
  actions: {
    async signIn() {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      this.user = userCredential.user;

      // User logged, persist data.
      await setDoc(doc(usersCollection, this.user.uid), { displayName: this.user.displayName, photoURL: this.user.photoURL })
    },
    async signOut() {
      await signOut(auth);
      this.user = {};
      router.push('/');
    }
  },
});
