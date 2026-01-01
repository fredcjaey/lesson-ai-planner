export interface RecordedVideo {
  blob: Blob;
  url: string;
  duration: number;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      this.chunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  stopRecording(): Promise<RecordedVideo> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - this.startTime) / 1000;

        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());

        resolve({ blob, url, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording' || false;
  }

  async uploadToSupabase(
    video: RecordedVideo,
    userId: string,
    sessionId: string
  ): Promise<string> {
    const supabase = (await import('@/lib/supabase')).supabase;

    const filename = `videos/${userId}/${sessionId}-${Date.now()}.webm`;

    const { data, error } = await supabase.storage
      .from('lesson-videos')
      .upload(filename, video.blob, {
        contentType: 'video/webm',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lesson-videos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
}

export async function transcribeVideo(
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  const data = await response.json();
  return data.text;
}