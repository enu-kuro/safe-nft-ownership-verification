import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventInfo } from "../components/eventInfo";
import { Result } from "../components/result";
import { Submission } from "../components/submission";
import { Verification } from "../components/verification";
import { db } from "../firebase";
import { NETWORK } from "../utils";

const loadingView = () => {
  return (
    <div className="flex flex-col justify-center mt-40">
      <div className="text-4xl text-center">Loading...</div>
    </div>
  );
};
export const Top = () => {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [sendChainId, setSendChainId] = useState<NETWORK>();

  const fetchEvent = useCallback(
    async (eventId: string) => {
      const docSnap = await getDoc(doc(db, "events", eventId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Document data:", data);
        setEventName(data.name);
        setEventDescription(data.description);
        setSendChainId(data.sendChainId);
      } else {
        console.log("No such document!");
        navigate("404");
      }
    },
    [navigate]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const eventId = searchParams.get("eventId");
    if (eventId) {
      setEventId(eventId);
      eventId && fetchEvent(eventId);
    } else {
      console.log("event not found!");
      navigate("404");
    }
  }, [fetchEvent, navigate]);

  if (!eventName) {
    return loadingView();
  }
  return (
    <div className="w-96 container mx-auto my-8 px-4 prose">
      <div className="font-extrabold text-2xl sm:text-3xl">
        申し込みフォーム
      </div>
      <EventInfo eventName={eventName} eventDescription={eventDescription} />

      {verified ? (
        <Result email={email} />
      ) : targetAddress ? (
        <Verification
          targetAddress={targetAddress}
          setVerified={setVerified}
          email={email}
          sendChainId={sendChainId}
        />
      ) : (
        <Submission
          eventId={eventId}
          sendChainId={sendChainId}
          setTargetAddress={setTargetAddress}
          setEmail={setEmail}
        />
      )}
    </div>
  );
};
