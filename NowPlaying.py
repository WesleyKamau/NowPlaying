import pyaudio
import wave
import time
import asyncio
import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
from shazamio import Shazam

app = Flask(__name__)
CORS(app)

# Audio recording settings
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 10
WAVE_OUTPUT_FILENAME = "output.wav"
QUIET_THRESHOLD = 5 # Adjust this threshold as needed

latest_song_info = None

def list_audio_devices():
    audio = pyaudio.PyAudio()
    device_count = audio.get_device_count()
    devices = []
    for i in range(device_count):
        device_info = audio.get_device_info_by_index(i)
        devices.append(device_info)
    audio.terminate()
    return devices

def get_line_in_device_index():
    devices = list_audio_devices()
    for device in devices:
        if "Line In" in device.get("name", ""):
            print(device)
            return device["index"]
    return None

def record_audio(input_device_index):
    audio = pyaudio.PyAudio()

    # Start recording
    stream = audio.open(format=FORMAT, channels=CHANNELS,
                        rate=RATE, input=True,
                        input_device_index=input_device_index,
                        frames_per_buffer=CHUNK)
    print("Recording...")
    frames = []

    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)
    
    print("Finished recording")

    # Stop recording
    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Save the recording as a WAV file
    waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    waveFile.setnchannels(CHANNELS)
    waveFile.setsampwidth(audio.get_sample_size(FORMAT))
    waveFile.setframerate(RATE)
    waveFile.writeframes(b''.join(frames))
    waveFile.close()

    # Check if the audio is too quiet
    audio_data = np.frombuffer(b''.join(frames), dtype=np.int16)
    rms = np.sqrt(np.mean(audio_data**2))
    print(f"RMS: {rms}")
    return rms >= QUIET_THRESHOLD

async def recognize_music():
    shazam = Shazam()
    out = await shazam.recognize(WAVE_OUTPUT_FILENAME)
    
    if out['matches']:
        track = out['track']
        song_name = track['title']
        artist_name = track['subtitle']
        album_name = next((meta['text'] for meta in track['sections'][0]['metadata'] if meta['title'] == 'Album'), 'Unknown')
        cover_art_url = track['images']['coverarthq'] if 'coverarthq' in track['images'] else None
        print(f"Artist: {artist_name}, Album: {album_name}, Song: {song_name}")
        return {
            "artist": artist_name,
            "album": album_name,
            "song": song_name,
            "cover_art_url": cover_art_url
        }
    else:
        print("Music not recognized")
        return None

@app.route('/latest_song', methods=['GET'])
def get_latest_song():
    response = jsonify(latest_song_info)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    line_in_device_index = get_line_in_device_index()
    if line_in_device_index is None:
        print("Line-in device not found.")
        exit(1)

    def recording_loop():
        global latest_song_info
        while True:
            if record_audio(line_in_device_index):
                latest_song_info = asyncio.run(recognize_music())
            else:
                latest_song_info = None
                print("Audio is too quiet, skipping recognition.")
            #time.sleep(5)
    
    import threading
    recording_thread = threading.Thread(target=recording_loop)
    recording_thread.daemon = True
    recording_thread.start()

    app.run(port=5000)
