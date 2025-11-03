import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7AK6I_KmkFEZIaWJokO5HN1UnejpHZ3U",
  authDomain: "the-bus-94fe3.firebaseapp.com",
  projectId: "the-bus-94fe3",
  storageBucket: "the-bus-94fe3.appspot.com",
  messagingSenderId: "782387450057",
  appId: "1:782387450057:web:d6d4dcf0fd778ff6533d18",
  measurementId: "G-D9627JEYQ6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registerForm = document.getElementById("register-form");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const userType = document.getElementById("register-type").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (usr) => {
        if (usr) {
          unsub();
          resolve();
        }
      });
    });

    await addDoc(collection(db, "accounts"), {
      userId: user.uid,
      email: email,
      password: password,
      userType: userType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    message.style.color = "green";
    message.textContent = "登録が完了しました、ログインしてください。";
  } catch (err) {
    console.error("登録エラー:", err);
    if (err.code === "auth/email-already-in-use") {
      message.style.color = "red";
      message.textContent = "このメールはすでに登録されています。ログインしてください。";
    } else {
      message.style.color = "red";
      message.textContent = "登録に失敗しました：" + err.message;
    }
  }
});

