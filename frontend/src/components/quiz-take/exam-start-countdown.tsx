"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Calendar,
  FileQuestion,
  AlertCircle,
  CheckCircle2,
  Timer,
  RotateCcw,
  Play,
  Lock,
  Camera,
  Clipboard,
  XCircle,
} from "lucide-react";
import { QuizTakeWrapper } from "./quiz-take-wrapper";
import { getFingerprint } from "@thumbmarkjs/thumbmarkjs";
import { takeExamAction } from "@/action/exam.action";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { TakeExamType } from "@/lib/types";

interface ExamData {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  retake: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface PermissionStatus {
  camera: boolean;
  clipboard: boolean;
}

export function ExamStartCountdown({ exam }: { exam: ExamData }) {
  const [timeUntilStart, setTimeUntilStart] = useState<TimeRemaining | null>(
    null
  );
  const [timeUntilEnd, setTimeUntilEnd] = useState<TimeRemaining | null>(null);
  const [examStatus, setExamStatus] = useState<"upcoming" | "active" | "ended">(
    "upcoming"
  );
  const [examData, setExamData] = useState<TakeExamType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    clipboard: false,
  });
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  const calculateTimeRemaining = useCallback(
    (targetTime: string): TimeRemaining => {
      const target = new Date(targetTime).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    },
    []
  );

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const startTime = new Date(exam.start_time).getTime();
    const endTime = new Date(exam.end_time).getTime();

    if (now < startTime) {
      setExamStatus("upcoming");
      setTimeUntilStart(calculateTimeRemaining(exam.start_time));
      setTimeUntilEnd(null);
    } else if (now >= startTime && now < endTime) {
      setExamStatus("active");
      setTimeUntilStart(null);
      setTimeUntilEnd(calculateTimeRemaining(exam.end_time));
    } else {
      setExamStatus("ended");
      setTimeUntilStart(null);
      setTimeUntilEnd(null);
    }
  }, [exam.start_time, exam.end_time, calculateTimeRemaining]);

  useEffect(() => {
    // Update immediately
    updateTimer();

    // Set up interval
    const timer = setInterval(updateTimer, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [updateTimer]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const checkPermissions = useCallback(async () => {
    const newPermissions: PermissionStatus = {
      camera: false,
      clipboard: false,
    };

    try {
      // Check camera permission
      const cameraPermission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      newPermissions.camera = cameraPermission.state === "granted";

      // Check clipboard permission (for clipboard-read)
      const clipboardPermission = await navigator.permissions.query({
        name: "clipboard-read" as PermissionName,
      });
      newPermissions.clipboard = clipboardPermission.state === "granted";
    } catch (error) {
      // Fallback: try to access the devices directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        newPermissions.camera = true;
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        newPermissions.camera = false;
      }

      try {
        await navigator.clipboard.readText();
        newPermissions.clipboard = true;
      } catch {
        newPermissions.clipboard = false;
      }
    }

    setPermissions(newPermissions);
    return newPermissions;
  }, []);

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);

    try {
      // Request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        toast.success("Camera permission granted");
      } catch (error) {
        toast.error(
          "Camera permission denied. Please allow camera access to continue."
        );
      }

      // Request clipboard permission by attempting to read
      try {
        await navigator.clipboard.readText();
        toast.success("Clipboard permission granted");
      } catch (error) {
        toast.error(
          "Clipboard permission denied. Please allow clipboard access to continue."
        );
      }

      // Recheck permissions after requests
      await checkPermissions();
    } catch (error) {
      toast.error("Error requesting permissions");
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const handleStartExam = async () => {
    // Check permissions before starting exam
    const currentPermissions = await checkPermissions();

    if (!currentPermissions.camera || !currentPermissions.clipboard) {
      toast.error(
        "Camera and clipboard permissions are required to start the exam"
      );
      return;
    }

    setIsLoading(true);
    const fingerprint = await getFingerprint();
    console.log("fingerprint", fingerprint);
    const data = await takeExamAction({
      exam_id: exam.id,
      device_id: fingerprint,
    });
    setIsLoading(false);
    if (!data.success) {
      toast.error(data.error);
      return;
    }
    setExamData(data.data);
  };

  const getStatusBadgeColor = () => {
    switch (examStatus) {
      case "upcoming":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "active":
        return "bg-green-100 text-green-700 border border-green-300";
      case "ended":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const getStatusIcon = () => {
    switch (examStatus) {
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "ended":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const startDateTime = formatDateTime(exam.start_time);
  const endDateTime = formatDateTime(exam.end_time);

  const canStartExam =
    examStatus === "active" && permissions.camera && permissions.clipboard;

  if (examData && examStatus === "active") {
    return <QuizTakeWrapper examData={examData} examStatus={examStatus} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileQuestion className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {exam.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {exam.retake && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-300 text-sm">
                <RotateCcw className="h-3 w-3" />
                Retake Allowed
              </div>
            )}
          </div>
        </div>

        {/* Permissions Check */}
        {(!permissions.camera || !permissions.clipboard) && (
          <div className="bg-white rounded-lg shadow-lg border p-6">
            <div className="text-center pb-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Required Permissions
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                The following permissions are required to take the exam
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  permissions.camera
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <Camera className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">Camera Access</div>
                  <div className="text-sm opacity-80">
                    Required for proctoring
                  </div>
                </div>
                {permissions.camera ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>

              <div
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  permissions.clipboard
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <Clipboard className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">Clipboard Access</div>
                  <div className="text-sm opacity-80">
                    Required for security
                  </div>
                </div>
                {permissions.clipboard ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>

            {(!permissions.camera || !permissions.clipboard) && (
              <div className="text-center">
                <Button
                  onClick={requestPermissions}
                  disabled={isCheckingPermissions}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isCheckingPermissions ? "Checking..." : "Grant Permissions"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Status and Countdown */}
        <div className="bg-white rounded-lg shadow-lg border p-6">
          <div className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusBadgeColor()}`}
              >
                {getStatusIcon()}
                {examStatus === "upcoming" && "Upcoming"}
                {examStatus === "active" && "Active Now"}
                {examStatus === "ended" && "Ended"}
              </div>
            </div>
            <h2 className="text-xl font-semibold">
              {examStatus === "upcoming" && "Exam starts in"}
              {examStatus === "active" && "Exam ends in"}
              {examStatus === "ended" && "Exam has ended"}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Countdown Display */}
            {examStatus === "upcoming" &&
              timeUntilStart &&
              timeUntilStart.total > 0 && (
                <div className="text-center">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-sm mx-auto">
                    {timeUntilStart.days > 0 && (
                      <div className="bg-yellow-400 text-black rounded-lg p-4 shadow-lg">
                        <div className="text-2xl md:text-3xl font-bold">
                          {timeUntilStart.days}
                        </div>
                        <div className="text-sm font-medium opacity-80">
                          Days
                        </div>
                      </div>
                    )}
                    <div className="bg-yellow-400 text-black rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilStart.hours}
                      </div>
                      <div className="text-sm font-medium opacity-80">
                        Hours
                      </div>
                    </div>
                    <div className="bg-yellow-400 text-black rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilStart.minutes}
                      </div>
                      <div className="text-sm font-medium opacity-80">
                        Minutes
                      </div>
                    </div>
                    <div className="bg-yellow-400 text-black rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilStart.seconds}
                      </div>
                      <div className="text-sm font-medium opacity-80">
                        Seconds
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {examStatus === "active" &&
              timeUntilEnd &&
              timeUntilEnd.total > 0 && (
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilEnd.hours}
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        Hours
                      </div>
                    </div>
                    <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilEnd.minutes}
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        Minutes
                      </div>
                    </div>
                    <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeUntilEnd.seconds}
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        Seconds
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {examStatus === "ended" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-lg text-gray-600">
                  This exam session has ended
                </p>
              </div>
            )}

            {/* Start Button */}
            <div className="text-center">
              <Button
                onClick={handleStartExam}
                disabled={!canStartExam || isLoading}
                className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                  canStartExam
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-70"
                }`}
              >
                {canStartExam ? (
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-5 w-5" />
                    {isLoading ? "Loading..." : "Start Exam"}
                  </div>
                ) : examStatus === "upcoming" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Exam Not Started
                  </div>
                ) : examStatus === "ended" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Exam Ended
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Permissions Required
                  </div>
                )}
              </Button>

              {examStatus === "active" &&
                (!permissions.camera || !permissions.clipboard) && (
                  <p className="text-sm text-red-600 mt-2">
                    Camera and clipboard permissions are required to start the
                    exam
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule & Details */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Schedule & Details
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Start Time:</span>
                  <div className="text-right">
                    <div className="font-medium">{startDateTime.time}</div>
                    <div className="text-sm text-gray-500">
                      {startDateTime.date}
                    </div>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">End Time:</span>
                  <div className="text-right">
                    <div className="font-medium">{endDateTime.time}</div>
                    <div className="text-sm text-gray-500">
                      {endDateTime.date}
                    </div>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {Math.floor(
                        (new Date(exam.end_time).getTime() -
                          new Date(exam.start_time).getTime()) /
                          60000
                      )}{" "}
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Important Instructions
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Camera and clipboard permissions are required for exam security",
                "Read each question carefully before selecting your answer",
                "Make sure you have a stable internet connection",
                "The exam will auto-submit when time expires",
                "No external resources or materials are allowed",
              ].map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    {instruction}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
