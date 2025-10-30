
"use client";

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Camera } from "lucide-react";

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

// Define types for keypoints and poses
type Keypoint = poseDetection.Keypoint;
type Pose = poseDetection.Pose;

export function PoseDetector() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let detector: poseDetection.PoseDetector | null = null;
    let stream: MediaStream | null = null;
    let isMounted = true;

    const setup = async () => {
      if (!isMounted) return;

      // 1. Check for camera support
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCameraPermission(false);
        setIsLoading(false);
        return;
      }

      // 2. Initialize TensorFlow backend
      await tf.setBackend('webgl');
      await tf.ready();

      // 3. Request camera permission
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Please enable camera permissions in your browser settings.');
        setHasCameraPermission(false);
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to use the form coach.',
        });
        return;
      }

      // 4. Load the MoveNet model
      try {
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });
        setIsLoading(false);
      } catch (e) {
          setError("Failed to load the ML model.");
          setIsLoading(false);
          return;
      }

      // 5. Start prediction loop
      const video = videoRef.current;
      if (video) {
        video.addEventListener('loadeddata', () => {
            if (detector) {
                 detectPose(detector);
            }
        });
      }
    };

    const detectPose = async (poseDetector: poseDetection.PoseDetector) => {
        if (!isMounted) return;
      
        const video = videoRef.current;
        const canvas = canvasRef.current;
      
        if (video && video.readyState === 4 && canvas) {
          const poses = await poseDetector.estimatePoses(video);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPoses(poses, ctx);
          }
        }
        animationFrameId.current = requestAnimationFrame(() => detectPose(poseDetector));
      };

    const drawPoses = (poses: Pose[], ctx: CanvasRenderingContext2D) => {
        poses.forEach(pose => {
            drawKeypoints(pose.keypoints, ctx);
            drawSkeleton(pose.keypoints, ctx);
        });
    };

    const drawKeypoints = (keypoints: Keypoint[], ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.strokeStyle = 'hsl(var(--primary-foreground))';
        ctx.lineWidth = 2;

        keypoints.forEach(keypoint => {
            if (keypoint.score && keypoint.score > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        });
    };

    const drawSkeleton = (keypoints: Keypoint[], ctx: CanvasRenderingContext2D) => {
        const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 3;

        connections.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score && kp1.score > 0.5 && kp2.score && kp2.score > 0.5) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });
    };

    setup();

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      detector?.dispose();
    };
  }, [toast]);


  const handleVideoLoaded = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if(video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
  }

  return (
    <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden border">
        {isLoading && (
            <div className="absolute z-20 flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading ML model...</p>
            </div>
        )}

        {hasCameraPermission === false && (
            <Alert variant="destructive" className="absolute z-20 m-4 max-w-sm">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>{error || 'Please allow camera access to use this feature.'}</AlertDescription>
            </Alert>
        )}

        <video 
            ref={videoRef} 
            className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100" 
            autoPlay 
            muted 
            playsInline
            onLoadedData={handleVideoLoaded}
        />
        <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 z-10"
        />
    </div>
  );
}
