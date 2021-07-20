import Head from "next/head";
import { useState, useRef } from "react";
import { Avatar } from "@material-ui/core";
import styled from "styled-components";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Button } from "@material-ui/core";

const firebaseConfig = {
  apiKey: "AIzaSyDcK0zo0xmyuZqauWV2tbkTmXijhdFcoNk",
  authDomain: "superchat-d92e4.firebaseapp.com",
  projectId: "superchat-d92e4",
  storageBucket: "superchat-d92e4.appspot.com",
  messagingSenderId: "1041041005225",
  appId: "1:1041041005225:web:087a4e527f831ce60167b8",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const auth = app.auth();
const firestore = app.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[whitesmoke]">
      <Head>
        <title>SuperChat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container className="shadow-xl w-[500px] h-[700px] grid place-content-center relative">
        {user ? <ChatRoom /> : <SignIn />}
      </Container>
    </div>
  );
}

const ChatRoom = () => {
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container className="w-full">
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>
      <form
        className="absolute bottom-0 left-0 flex justify-center w-full p-2"
        onSubmit={sendMessage}
      >
        <input
          className="w-4/5 border-[whitesmoke] border-2 px-2"
          placeholder="say something kind..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <Button variant="outlined" className="w-1/5" type="submit">
          Send
        </Button>
      </form>
    </Container>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass} flex items-center mb-2`}>
      <UserAvatar src={photoURL} className="mr-2" />
      <p>{text}</p>
    </div>
  );
};

const SignIn = () => {
  const signInWithGoogle = () => {
    auth.signInWithPopup(provider);
  };

  return (
    <div>
      <Button variant="outlined" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
    </div>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <Button variant="outlined" onClick={() => auth.signOut()}>
        Sign Out
      </Button>
    )
  );
};

const UserAvatar = styled(Avatar)``;

const Container = styled.div`
  background-color: white;
`;
