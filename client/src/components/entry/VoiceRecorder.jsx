import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Play, Pause, Check } from 'lucide-react';

export default function VoiceRecorder({ onSave, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Format timer seconds as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start timer interval
  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop timer interval
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Cleanup media resources on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setAudioBlob(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File exceeds the 100MB size limit.');
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
  };

  const handleReset = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setSeconds(0);
  };

  const handleSave = () => {
    if (audioBlob) {
      let file = audioBlob;
      // If it's a recorded blob (not a File object already), wrap it as a File
      if (!(audioBlob instanceof File)) {
        file = new File([audioBlob], `voice-recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
      }
      onSave(file);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col items-center justify-center space-y-4">
      
      {/* Visual State Wave/Timer */}
      <div className="flex flex-col items-center">
        {isRecording ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Recording</span>
          </div>
        ) : audioUrl ? (
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Preview Memo</span>
        ) : (
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Mic Capture</span>
        )}
        <span className="text-2xl font-mono font-semibold text-slate-800">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Control Buttons Container */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-4">
          {/* Record/Stop toggle */}
          {!audioUrl && (
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`h-11 w-11 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm ${
                isRecording 
                  ? 'bg-slate-800 hover:bg-slate-900 scale-105' 
                  : 'bg-accent hover:bg-accent-dark scale-100 hover:scale-105'
              }`}
            >
              {isRecording ? <Square className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>
          )}

          {/* Post-recording options */}
          {audioUrl && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <audio src={audioUrl} controls className="h-8 w-full sm:max-w-[220px]" />
              <div className="flex items-center gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer shrink-0"
                  title="Record again"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition cursor-pointer shrink-0"
                  title="Add memo to timeline"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Audio File Trigger */}
        {!audioUrl && !isRecording && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-accent hover:text-accent-dark transition cursor-pointer"
            >
              Or upload an audio file
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="audio/*"
              className="hidden"
            />
          </div>
        )}
      </div>

      {onCancel && !isRecording && (
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
