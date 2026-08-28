"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useVoiceRecorder(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.continuous = true;
        sr.interimResults = true;

        sr.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            onTranscriptRef.current(finalTranscript);
          }
        };

        sr.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        sr.onend = () => {
          setIsRecording(false);
        };

        setRecognition(sr);
      } else {
        console.warn("Speech recognition not supported in this browser.");
      }
    }
  }, []); // Empty dependency array because we use onTranscriptRef

  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      recognition.start();
      setIsRecording(true);
    }
  }, [recognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  }, [recognition, isRecording]);

  return { isRecording, startRecording, stopRecording, supported: !!recognition };
}
