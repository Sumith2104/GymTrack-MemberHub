
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Camera, Loader2, Bot, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { analyzeWorkoutForm, type AnalyzeWorkoutFormOutput } from '@/ai/flows/analyze-workout-form-flow';

type Workout = 'push-up' | 'plank' | 'dips';

export default function OnlineTrainerPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout>('push-up');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeWorkoutFormOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(cameraStream);
        setHasCameraPermission(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Please enable camera permissions in your browser settings to use this feature.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to use the AI Form Coach.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCheckForm = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Camera feed is not available.",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await analyzeWorkoutForm({
        exercise: selectedWorkout,
        photoDataUri: photoDataUri,
      });
      setAnalysisResult(result);
    } catch (e) {
      console.error('Analysis failed:', e);
      setError('Sorry, the analysis failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not get feedback from the AI coach. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getWorkoutDescription = (workout: Workout) => {
    switch(workout) {
      case 'push-up': return "Position hands slightly wider than your shoulders. Keep your body straight.";
      case 'plank': return "Hold your body in a straight line from head to heels. Engage your core.";
      case 'dips': return "Use a sturdy chair or bench. Lower your body until your elbows are at a 90-degree angle.";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Form Coach
          </CardTitle>
          <CardDescription>
            Select a workout, position yourself in the camera view, and get real-time feedback on your form.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="bg-muted/40">
              <CardContent className="pt-6">
                <div className="aspect-video bg-background rounded-md flex items-center justify-center overflow-hidden">
                  {hasCameraPermission === false ? (
                      <Alert variant="destructive" className="m-4">
                        <Camera className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          {error || 'Please allow camera access to use this feature.'}
                        </AlertDescription>
                      </Alert>
                  ) : (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
                <label className="text-sm font-medium">Select Workout</label>
                 <Select onValueChange={(value: Workout) => setSelectedWorkout(value)} defaultValue={selectedWorkout}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a workout..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="push-up">Push-up</SelectItem>
                        <SelectItem value="plank">Plank</SelectItem>
                        <SelectItem value="dips">Dips (on chair/bench)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{getWorkoutDescription(selectedWorkout)}</p>
            </div>
            
            <Button onClick={handleCheckForm} disabled={isAnalyzing || !hasCameraPermission} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Check My Form
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Feedback</h3>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2 p-4 border rounded-lg bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Your coach is analyzing your form...</p>
              </div>
            ) : analysisResult ? (
              <Card className="bg-muted/40">
                <CardContent className="pt-6">
                  <div className={`p-4 rounded-lg border-2 ${analysisResult.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <Bot /> {analysisResult.isCorrect ? 'Great Form!' : 'Needs Improvement'}
                    </h4>
                    <p className="mt-2 text-sm">{analysisResult.feedback}</p>
                  </div>
                   <ul className="mt-4 space-y-2 text-sm list-disc pl-5">
                    {analysisResult.tips?.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed rounded-lg bg-muted/20">
                <Bot className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground mt-2 text-center">Your feedback from the AI coach will appear here.</p>
              </div>
            )}
            {error && !isAnalyzing && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
