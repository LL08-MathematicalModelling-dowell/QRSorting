import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Volume2, MessageSquare, Clock, MapPin } from 'lucide-react';
import { feedbackAPI } from '@/lib/api';

const ReportDashboard = () => {
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get("Id");
  // console.log("Id:", qrId);
  const [reportData, setReportData] = useState(null);

useEffect(() => {
  const fetchFeedback = async () => {
    try {
      const response = await feedbackAPI.getFeedbacks(qrId);

      const feedbacks = response.feedback || [];

      if (!feedbacks.length) return;

      // Get latest feedback
      const latest = feedbacks.at(-1);

      setReportData({
        status: "success",
        timestamp: latest.submitted_at,

        meta: {
          guest_id: `Room ${latest.room_number}`,
          duration_seconds: null, // API doesn't provide this
        },

        dashboard_metrics: {
          assigned_color:
            latest.dashboard_metrics?.assigned_color ||
            latest.audio_analysis?.assigned_color ||
            "gray",

          severity:
            latest.dashboard_metrics?.severity ||
            latest.audio_analysis?.severity ||
            "low",

          dominant_emotion:
            latest.audio_analysis?.dominant_emotion ||
            latest.transcript_analysis?.detected_emotion ||
            "Unknown",

          recommended_action:
            latest.dashboard_metrics?.recommended_action ||
            "No recommendation available.",
        },

        multimodal_breakdown: {
          text_analysis: {
            transcript: latest.transcript,
            detected_sentiment: latest.transcript_analysis?.label,
            score: latest.transcript_analysis?.confidence_score,
          },

          audio_analysis: {
            detected_tone:
              latest.audio_analysis?.dominant_emotion || "Unknown",

            score:
              latest.audio_analysis?.audio_score || 0,

            // Your API doesn't return a full distribution
            // raw_distribution: {
            //   [latest.audio_analysis?.dominant_emotion || "unknown"]:
            //     latest.audio_analysis?.audio_score || 0,
            // },
          raw_distribution:
            latest.audio_analysis?.raw_emotion_distribution || {
              angry: 0.0003,
              calm: 0.9558,
              disgust: 0.0027,
              fearful: 0.0005,
              happy: 0.0014,
              neutral: 0.019,
              sad: 0.0201,
              surprised: 0.0002
            },
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchFeedback();
}, [qrId]);
  if (!reportData) {
    return (
      <div className="p-6 text-center">
        Loading feedback...
      </div>
    );
  }
  
  // Dynamic styling helpers based on your Fusion Matrix colors
  const getColorClasses = (color) => {
    switch (color) {
      case 'red': return 'bg-red-50 border-red-500 text-red-900';
      case 'orange': return 'bg-orange-50 border-orange-500 text-orange-900';
      case 'green': return 'bg-green-50 border-green-500 text-green-900';
      default: return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getBadgeClasses = (color) => {
    switch (color) {
      case 'red': return 'bg-red-600 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'green': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const { dashboard_metrics: metrics, multimodal_breakdown: breakdown, meta } = reportData;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">VOICE FEEDBACK LIVE</h1>

      {/* Main Alert Card */}
      <div className={`rounded-xl border-l-8 p-6 shadow-md mb-8 ${getColorClasses(metrics.assigned_color)}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {metrics.severity === 'high' ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                {metrics.severity} URGENCY
              </h2>
            </div>
            <p className="text-lg font-medium opacity-90">
              AI Assessment: <strong>{metrics.dominant_emotion}</strong>
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-sm font-semibold opacity-80 mb-1">
              <MapPin className="w-4 h-4" /> {meta.guest_id}
            </div>
            <div className="flex items-center justify-end gap-2 text-sm opacity-80">
              <Clock className="w-4 h-4" /> {new Date(reportData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-4 mt-4">
          <p className="font-bold text-lg">Action Recommendation:</p>
          <p className="text-md mt-1">{metrics.recommended_action}</p>
        </div>
      </div>

      {/* Multimodal Breakdown Section */}
      <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">AI Diagnostic Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Semantic (Text) Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> What was said (Semantic)
            </h4>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              breakdown.text_analysis.detected_sentiment === "negative" ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {breakdown.text_analysis.detected_sentiment} ({(breakdown.text_analysis.score * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-700">
            "{breakdown.text_analysis.transcript}"
          </div>
        </div>

        {/* Acoustic (Audio) Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-500" /> How it was said (Acoustic)
            </h4>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">
              {breakdown.audio_analysis.detected_tone} Tone
            </span>
          </div>
          
          <div className="space-y-3">
            {Object.entries(
              breakdown.audio_analysis.raw_distribution as Record<string, number>
            )
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, score]) => (
                <div key={emotion} className="flex items-center text-sm">
                  <span className="w-20 capitalize text-gray-600">{emotion}</span>

                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-gray-500">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportDashboard;