'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { PoseDetector } from "@/components/me/pose-detector";

export default function OnlineTrainerPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Real-Time Form Coach
          </CardTitle>
          <CardDescription>
            The model will detect your body posture in real-time. Position yourself in the camera view to see the pose detection in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoseDetector />
        </CardContent>
      </Card>
    </div>
  );
}
