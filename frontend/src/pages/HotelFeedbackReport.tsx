// import React, { useState, useEffect } from 'react';
// import { useParams, useSearchParams } from 'react-router-dom';
// import { AlertCircle, CheckCircle, Volume2, MessageSquare, Clock, MapPin } from 'lucide-react';
// import { feedbackAPI } from '@/lib/api';

// const ReportDashboard = () => {
//   const [searchParams] = useSearchParams();
//   const qrId = searchParams.get("id");
//   // console.log("Id:", qrId);
//   const today = new Date().toISOString();
//   const date = today.split("T")[0];

//   console.log("Today's date:", date);
//   const [reportData, setReportData] = useState(null);

// useEffect(() => {
//   const fetchFeedback = async () => {
//     try {
//       const response = await feedbackAPI.getFeedbacks(qrId, date);

//       const feedbacks = response.feedback || [];

//       if (!feedbacks.length) return;

//       // Get latest feedback
//       const latest = feedbacks.at(-1);
//       console.log("Latest feedback:", latest.raw_emotion_distribution);

//       setReportData({
//         status: "success",
//         timestamp: latest.submitted_at,

//         meta: {
//           guest_id: `Room ${latest.room_number}`,
//           duration_seconds: null, // API doesn't provide this
//         },

//         dashboard_metrics: {
//           assigned_color:
//             latest.dashboard_metrics?.assigned_color ||
//             latest.audio_analysis?.assigned_color ||
//             "gray",

//           severity:
//             latest.dashboard_metrics?.severity ||
//             latest.audio_analysis?.severity ||
//             "low",

//           dominant_emotion:
//             latest.audio_analysis?.dominant_emotion ||
//             latest.transcript_analysis?.detected_emotion ||
//             "Unknown",

//           recommended_action:
//             latest.dashboard_metrics?.recommended_action ||
//             "No recommendation available.",
//         },

//         multimodal_breakdown: {
//           text_analysis: {
//             transcript: latest.transcript,
//             detected_sentiment: latest.transcript_analysis?.label,
//             score: latest.transcript_analysis?.confidence_score,
//           },

//           audio_analysis: {
//             detected_tone:
//               latest.audio_analysis?.dominant_emotion || "Unknown",

//             score:
//               latest.audio_analysis?.audio_score || 0,

//             // Your API doesn't return a full distribution
//             // raw_distribution: {
//             //   [latest.audio_analysis?.dominant_emotion || "unknown"]:
//             //     latest.audio_analysis?.audio_score || 0,
//             // },
//           raw_emotion_distribution:
//             latest.raw_emotion_distribution,
//           },
//         },
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   fetchFeedback();
// }, [qrId]);
//   if (!reportData) {
//     return (
//       <div className="p-6 text-center">
//         Loading feedback...
//       </div>
//     );
//   }
  
//   // Dynamic styling helpers based on your Fusion Matrix colors
//   const getColorClasses = (color) => {
//     switch (color) {
//       case 'red': return 'bg-red-50 border-red-500 text-red-900';
//       case 'orange': return 'bg-orange-50 border-orange-500 text-orange-900';
//       case 'green': return 'bg-green-50 border-green-500 text-green-900';
//       default: return 'bg-gray-50 border-gray-500 text-gray-900';
//     }
//   };

//   const getBadgeClasses = (color) => {
//     switch (color) {
//       case 'red': return 'bg-red-600 text-white';
//       case 'orange': return 'bg-orange-500 text-white';
//       case 'green': return 'bg-green-600 text-white';
//       default: return 'bg-gray-600 text-white';
//     }
//   };

//   const { dashboard_metrics: metrics, multimodal_breakdown: breakdown, meta } = reportData;

//   return (
//     <div className="max-w-4xl mx-auto p-6 font-sans">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">VOICE FEEDBACK LIVE</h1>

//       {/* Main Alert Card */}
//       <div className={`rounded-xl border-l-8 p-6 shadow-md mb-8 ${getColorClasses(metrics.assigned_color)}`}>
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               {metrics.severity === 'high' ? (
//                 <AlertCircle className="w-8 h-8 text-red-600" />
//               ) : (
//                 <CheckCircle className="w-8 h-8 text-green-600" />
//               )}
//               <h2 className="text-2xl font-bold uppercase tracking-wide">
//                 {metrics.severity} URGENCY
//               </h2>
//             </div>
//             <p className="text-lg font-medium opacity-90">
//               AI Assessment: <strong>{metrics.dominant_emotion}</strong>
//             </p>
//           </div>
          
//           <div className="text-right">
//             <div className="flex items-center justify-end gap-2 text-sm font-semibold opacity-80 mb-1">
//               <MapPin className="w-4 h-4" /> {meta.guest_id}
//             </div>
//             <div className="flex items-center justify-end gap-2 text-sm opacity-80">
//               <Clock className="w-4 h-4" /> {new Date(reportData.timestamp).toLocaleString()}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white/60 rounded-lg p-4 mt-4">
//           <p className="font-bold text-lg">Action Recommendation:</p>
//           <p className="text-md mt-1">{metrics.recommended_action}</p>
//         </div>
//       </div>

//       {/* Multimodal Breakdown Section */}
//       <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">AI Diagnostic Breakdown</h3>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* Semantic (Text) Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-bold text-gray-700 flex items-center gap-2">
//               <MessageSquare className="w-5 h-5 text-blue-500" /> What was said (Semantic)
//             </h4>
//             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//               breakdown.text_analysis.detected_sentiment === "negative" ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
//             }`}>
//               {breakdown.text_analysis.detected_sentiment} ({(breakdown.text_analysis.score * 100).toFixed(0)}%)
//             </span>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-700">
//             "{breakdown.text_analysis.transcript}"
//           </div>
//         </div>

//         {/* Acoustic (Audio) Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-bold text-gray-700 flex items-center gap-2">
//               <Volume2 className="w-5 h-5 text-purple-500" /> How it was said (Acoustic)
//             </h4>
//             <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">
//               {breakdown.audio_analysis.detected_tone} Tone
//             </span>
//           </div>
          
//           <div className="space-y-3">
//             {Object.entries(
//               breakdown.raw_emotion_distribution as Record<string, number>
//             )
//               .sort(([, a], [, b]) => b - a)
//               .map(([emotion, score]) => (
//                 <div key={emotion} className="flex items-center text-sm">
//                   <span className="w-20 capitalize text-gray-600">{emotion}</span>

//                   <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
//                     <div
//                       className="bg-purple-500 h-2.5 rounded-full"
//                       style={{ width: `${score * 100}%` }}
//                     />
//                   </div>

//                   <span className="w-12 text-right text-gray-500">
//                     {(score * 100).toFixed(0)}%
//                   </span>
//                 </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ReportDashboard;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Volume2,
  MessageSquare,
  Clock,
  MapPin,
  Filter,
} from 'lucide-react';
import { feedbackAPI } from '@/lib/api';

const ReportDashboard = () => {
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get('id');

  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!qrId) {
        setError('QR code ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await feedbackAPI.getFeedbacks(qrId, today);

        console.log('Feedback API response:', response);

        const feedbackList = response.feedbacks || [];

        // Sort newest -> oldest
        const sortedFeedbacks = [...feedbackList].sort(
          (a, b) =>
            new Date(b.submitted_at) - new Date(a.submitted_at)
        );

        setFeedbacks(sortedFeedbacks);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Unable to load feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [qrId, today]);

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading feedback...
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error state
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  // ---------------------------------------------------------
  // No feedback
  // ---------------------------------------------------------

  if (!feedbacks.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          VOICE FEEDBACK LIVE
        </h1>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500">
            No feedback received today for this QR code.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Apply filter
  // ---------------------------------------------------------

  const displayedFeedbacks =
    filter === 'latest'
      ? [feedbacks[0]]
      : feedbacks;

  // ---------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-50 border-red-500 text-red-900';

      case 'orange':
        return 'bg-orange-50 border-orange-500 text-orange-900';

      case 'green':
        return 'bg-green-50 border-green-500 text-green-900';

      default:
        return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') {
      return (
        <AlertCircle className="w-8 h-8 text-red-600" />
      );
    }

    if (severity === 'medium') {
      return (
        <AlertCircle className="w-8 h-8 text-orange-500" />
      );
    }

    return (
      <CheckCircle className="w-8 h-8 text-green-600" />
    );
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown';

    return new Date(timestamp).toLocaleString();
  };

  const formatEmotion = (emotion) => {
    if (!emotion) return 'Unknown';

    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            VOICE FEEDBACK LIVE
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {feedbacks.length} feedback
            {feedbacks.length !== 1 ? 's' : ''} received today
          </p>
        </div>

        {/* =================================================
            FILTER BUTTON
        ================================================= */}

        <div className="relative">

          <div className="flex items-center gap-2">

            <Filter className="w-4 h-4 text-gray-500" />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                border-gray-300
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                text-gray-700
                bg-white
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <option value="latest">
                Latest
              </option>

              <option value="all">
                All
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          FEEDBACK LIST
      ===================================================== */}

      <div className="space-y-8">

        {displayedFeedbacks.map((feedback) => {

          const metrics =
            feedback.dashboard_metrics || {};

          const audio =
            feedback.audio_analysis || {};

          const transcript =
            feedback.transcript_analysis || {};

          const rawDistribution =
            feedback.raw_emotion_distribution || {};

          const assignedColor =
            metrics.assigned_color ||
            audio.assigned_color ||
            'gray';

          const severity =
            metrics.severity ||
            audio.severity ||
            'low';

          const dominantEmotion =
            audio.dominant_emotion ||
            transcript.detected_emotion ||
            'Unknown';

          const recommendedAction =
            metrics.recommended_action ||
            'No recommendation available.';

          return (
            <div
              key={feedback._id}
              className="border-b border-gray-200 pb-8"
            >

              {/* =================================================
                  FEEDBACK HEADER / ALERT CARD
              ================================================= */}

              <div
                className={`
                  rounded-xl
                  border-l-8
                  p-6
                  shadow-md
                  ${getColorClasses(assignedColor)}
                `}
              >

                <div className="flex justify-between items-start">

                  {/* LEFT */}
                  <div>

                    <div className="flex items-center gap-3 mb-2">

                      {getSeverityIcon(severity)}

                      <h2 className="text-2xl font-bold uppercase tracking-wide">
                        {severity} URGENCY
                      </h2>

                    </div>

                    <p className="text-lg font-medium opacity-90">
                      AI Assessment:{' '}
                      <strong>
                        {formatEmotion(dominantEmotion)}
                      </strong>
                    </p>

                  </div>

                  {/* RIGHT */}
                  <div className="text-right">

                    <div className="flex items-center justify-end gap-2 text-sm font-semibold opacity-80 mb-2">
                      <MapPin className="w-4 h-4" />

                      Room {feedback.room_number}
                    </div>

                    <div className="flex items-center justify-end gap-2 text-sm opacity-80">
                      <Clock className="w-4 h-4" />

                      {formatDateTime(feedback.submitted_at)}
                    </div>

                  </div>

                </div>

                {/* DESCRIPTION */}

                {feedback.description && (
                  <div className="bg-white/60 rounded-lg p-4 mt-4">

                    <p className="font-bold text-lg">
                      Guest Feedback:
                    </p>

                    <p className="text-md mt-1">
                      {feedback.description}
                    </p>

                  </div>
                )}

                {/* ACTION */}

                <div className="bg-white/60 rounded-lg p-4 mt-3">

                  <p className="font-bold text-lg">
                    Action Recommendation:
                  </p>

                  <p className="text-md mt-1">
                    {recommendedAction}
                  </p>

                </div>

              </div>

              {/* =================================================
                  AI DIAGNOSTIC BREAKDOWN
              ================================================= */}

              <h3 className="text-xl font-bold text-gray-700 mt-6 mb-4 border-b pb-2">
                AI Diagnostic Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* =================================================
                    SEMANTIC CARD
                ================================================= */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

                  <div className="flex justify-between items-center mb-4">

                    <h4 className="font-bold text-gray-700 flex items-center gap-2">

                      <MessageSquare className="w-5 h-5 text-blue-500" />

                      What was said (Semantic)

                    </h4>

                    {transcript.label ? (
                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-bold
                          ${
                            transcript.label.toLowerCase() === 'negative'
                              ? 'bg-red-100 text-red-700'
                              : transcript.label.toLowerCase() === 'positive'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {transcript.label.toUpperCase()}

                        {typeof transcript.confidence_score === 'number'
                          ? ` (${(
                              transcript.confidence_score * 100
                            ).toFixed(0)}%)`
                          : ''}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                        NO TEXT
                      </span>
                    )}

                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-700 min-h-[60px]">

                    {feedback.transcript
                      ? `"${feedback.transcript}"`
                      : 'No transcript available for this feedback.'}

                  </div>

                </div>

                {/* =================================================
                    ACOUSTIC CARD
                ================================================= */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

                  <div className="flex justify-between items-center mb-4">

                    <h4 className="font-bold text-gray-700 flex items-center gap-2">

                      <Volume2 className="w-5 h-5 text-purple-500" />

                      How it was said (Acoustic)

                    </h4>

                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">

                      {formatEmotion(
                        audio.dominant_emotion
                      )}{' '}
                      Tone

                    </span>

                  </div>

                  {/* AUDIO SCORE */}

                  <div className="mb-5">

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">
                        Dominant emotion confidence
                      </span>

                      <span className="font-semibold text-gray-700">
                        {typeof audio.audio_score === 'number'
                          ? `${(
                              audio.audio_score * 100
                            ).toFixed(0)}%`
                          : 'N/A'}
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">

                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (audio.audio_score || 0) * 100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* EMOTION DISTRIBUTION */}

                  <div className="space-y-3">

                    {Object.entries(rawDistribution)
                      .sort(
                        ([, a], [, b]) => b - a
                      )
                      .map(([emotion, score]) => (

                        <div
                          key={emotion}
                          className="flex items-center text-sm"
                        >

                          <span className="w-20 capitalize text-gray-600">
                            {emotion}
                          </span>

                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">

                            <div
                              className="bg-purple-500 h-2.5 rounded-full"
                              style={{
                                width: `${score * 100}%`,
                              }}
                            />

                          </div>

                          <span className="w-12 text-right text-gray-500">
                            {(score * 100).toFixed(1)}%
                          </span>

                        </div>

                      ))}

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default ReportDashboard;