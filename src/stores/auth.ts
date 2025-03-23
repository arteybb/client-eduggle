import { getUserById, register, signIn } from './../api/user/user.api';
import { ref } from "vue";
import { defineStore } from "pinia";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref();
  const token = ref();
  const errorMessage = ref();

  const initAuth = async () => {
    user.value = await new Promise(async (resolve, reject) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await getUserById(firebaseUser.uid);
            resolve(userData);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      }, reject);
    });
  };





  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;

    } catch (error: any) {

    }
  }

  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<any> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed up:", user);
      const payload = {
        email: user.email,
        uid: user.uid,
        displayName: displayName,
      };
      console.log(user.uid);
      const data = await register(payload);
      return data;
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      throw new Error(error.message);
    }
  };


  const loginWithGoogle = async (): Promise<any> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        throw new Error("Credential is null");
      }

      const user = result.user;
      console.log("Google User:", user);

      // สร้าง payload สำหรับส่งข้อมูลไปยัง API
      const payload = {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName || "",
        photoURL: user.photoURL || ""
      };


      const data = await register(payload);

      router.push({ name: "home" });
      return data;
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      throw new Error(error?.message);
    }
  };



  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
      token.value = null;
      router.push({ name: "login" });
    } catch (error: any) {
      errorMessage.value = error.message;
    }
  };






  return {
    user,
    token,
    errorMessage,
    registerWithEmail,
    loginWithGoogle,
    logout,
    initAuth,
    loginWithEmailAndPassword,
  };
});
