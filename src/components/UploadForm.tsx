"use client";
import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Settings,
  Play,
  RotateCcw,
  Sparkles,
  Film,
  Zap,
} from "lucide-react";
import Image from "next/image";

type QualityPreset = "low" | "medium" | "high" | "ultra";

interface QualitySettings {
  fps: number;
  scale: number;
}

interface GifSettings {
  fps: number;
  scale: number;
  quality: QualityPreset;
  startTime: number;
  duration: number;
  loop: boolean;
}

export default function EnhancedGifStudio() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<GifSettings>({
    fps: 15,
    scale: 480,
    quality: "medium",
    startTime: 0,
    duration: 0,
    loop: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const qualityPresets: Record<QualityPreset, QualitySettings> = {
    low: { fps: 10, scale: 320 },
    medium: { fps: 15, scale: 480 },
    high: { fps: 24, scale: 720 },
    ultra: { fps: 30, scale: 1080 },
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert(
          `File too large! Please select a video under 10MB (current: ${(
            file.size /
            1024 /
            1024
          ).toFixed(1)}MB). Try a shorter video or lower quality.`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  async function handleSubmit() {
    if (!fileInputRef.current?.files?.length) return;

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("video", fileInputRef.current.files[0]);

    // Add settings to form data
    formData.append("fps", settings.fps.toString());
    formData.append("scale", settings.scale.toString());
    formData.append("startTime", settings.startTime.toString());
    formData.append("duration", settings.duration.toString());

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const response = await fetch("https://ffmpeg-gif-backend.onrender.com/gif", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreview(url);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }

  const downloadGif = () => {
    if (preview) {
      const a = document.createElement("a");
      a.href = preview;
      a.download = `gif-${Date.now()}.gif`;
      a.click();
    }
  };

  const resetForm = () => {
    setPreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoLoadedMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = e.target as HTMLVideoElement;
    setSettings((prev) => ({
      ...prev,
      duration: Math.min(10, video.duration),
    }));
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quality = e.target.value as QualityPreset;
    const preset = qualityPresets[quality];
    setSettings((prev) => ({
      ...prev,
      quality,
      fps: preset.fps,
      scale: preset.scale,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Film className="w-12 h-12 text-cyan-400" />
              <Sparkles className="w-6 h-6 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
              FFmpeg GIF Studio
            </h1>
          </div>
          <p className="text-xl text-gray-400 font-light">
            Transform your videos into stunning GIFs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-cyan-400" />
              Upload Your Video
            </h2>

            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative border-2 border-dashed border-cyan-400/40 rounded-2xl p-12 text-center hover:border-cyan-400 transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 group cursor-pointer hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-purple-500/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-2">
                      Drop your video here or click to browse
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports MP4, MOV, AVI, and more
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Preview */}
              {videoPreview && (
                <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-600/30">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                  />
                </div>
              )}

              {/* Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-colors duration-200 border border-gray-600/30"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? "Hide" : "Show"} Advanced Settings
              </button>

              {/* Advanced Settings */}
              {showSettings && (
                <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-600/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quality Preset
                      </label>
                      <select
                        value={settings.quality}
                        onChange={handleQualityChange}
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        <option value="low">Low (320p, 10fps)</option>
                        <option value="medium">Medium (480p, 15fps)</option>
                        <option value="high">High (720p, 24fps)</option>
                        <option value="ultra">Ultra (1080p, 30fps)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frame Rate: {settings.fps} fps
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={settings.fps}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            fps: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-cyan-500 bg-gray-700 h-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Time (seconds)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={settings.startTime}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            startTime: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (seconds, 0 = full)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={settings.duration}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            duration: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !videoPreview}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center gap-2 border border-cyan-400/20 disabled:border-gray-600/20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing... {progress.toFixed(0)}%
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Convert to GIF
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {loading && (
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-gray-600/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Preview/Result Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-emerald-400" />
              {preview ? "Your GIF is Ready!" : "Preview"}
            </h2>

            {preview ? (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-xl bg-gray-900/20">
                  <Image
                    width={100}
                    height={100}
                    src={preview}
                    alt="Generated GIF"
                    className="w-full h-auto"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    GIF Ready!
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadGif}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-emerald-400/20"
                  >
                    <Download className="w-5 h-5" />
                    Download GIF
                  </button>

                  <button
                    onClick={resetForm}
                    className="px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-colors duration-200 flex items-center justify-center border border-gray-600/30"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600/30">
                  <Film className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">
                  Upload a video to see the magic happen ✨
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/40 text-center hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 hover:border-cyan-400/30">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-400 text-sm">
              Powered by FFmpeg for ultra-fast video processing
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/40 text-center hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 hover:border-pink-400/30">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Customizable</h3>
            <p className="text-gray-400 text-sm">
              Fine-tune quality, frame rate, and timing to perfection
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/40 text-center hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 hover:border-emerald-400/30">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">High Quality</h3>
            <p className="text-gray-400 text-sm">
              Professional-grade GIFs with optimized compression
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/40">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Keep videos under 30 seconds for best results
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Higher FPS = smoother but larger file size
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Use trim settings to focus on the best moments
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Medium quality works great for most use cases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles animation - behind content */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
