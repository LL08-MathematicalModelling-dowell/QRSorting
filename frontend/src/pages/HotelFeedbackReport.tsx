import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Volume2,
  MessageSquare,
  Clock,
  MapPin,
  Filter,
  Loader2,
} from 'lucide-react';
import { feedbackAPI } from '@/lib/api';

const ReportDashboard = () => {
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get('id');
  const clientName = searchParams.get('client');

  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});
  const [resolvingMap, setResolvingMap] = useState({});

  // Hardcoded date for testing
  const today = new Date().toISOString().split('T')[0];
  // const today = '2026-09-02';

  useEffect(() => {
    const fetchFeedbackAndMetadata = async () => {
      if (!qrId) {
        setError('QR code ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch feedback items
        const response = await feedbackAPI.getFeedbacksByDate(qrId, today, clientName);
        const feedbackList = response.feedbacks || [];

        // Fetch and map metadata for each feedback item
        const feedbacksWithMetadata = await Promise.all(
          feedbackList.map(async (feedback) => {
            try {
              const metaRes = await fetch(
                `http://localhost:8004/api/text-analysis/feedback-metadata/?qrId=${qrId}&feedbackId=${feedback._id}`,
                {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                }
              );

              if (metaRes.ok) {
                const metadata = await metaRes.json();
                const metadataItem = Array.isArray(metadata)
                  ? metadata.find((m) => m.feedback_id === feedback._id || m.qrId === qrId) || metadata[0]
                  : metadata;

                return { ...feedback, metadata: metadataItem || {} };
              }
            } catch (err) {
              console.error(`Error fetching metadata for feedback ${feedback._id}:`, err);
            }
            return { ...feedback, metadata: {} };
          })
        );

        // Sort newest -> oldest based on metadata date (fallback to feedback date)
        const sortedFeedbacks = [...feedbacksWithMetadata].sort(
          (a, b) =>
            new Date(b.metadata?.submitted_at || b.metadata?.date || b.submitted_at) -
            new Date(a.metadata?.submitted_at || a.metadata?.date || a.submitted_at)
        );

        setFeedbacks(sortedFeedbacks);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('No feedback found for this QR code today.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackAndMetadata();
  }, [qrId, today, clientName]);

  const handleTranslate = async (feedback) => {
    if (!feedback.transcript || translating[feedback._id]) return;

    try {
      setTranslating((prev) => ({ ...prev, [feedback._id]: true }));
      const response = await feedbackAPI.translateToEnglish(feedback.transcript);
      const translation = response?.data?.english_translation;

      if (translation) {
        setTranslations((prev) => ({
          ...prev,
          [feedback._id]: {
            text: translation,
            language: response.data.detected_language,
            languageCode: response.data.language_code,
          },
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating((prev) => ({ ...prev, [feedback._id]: false }));
    }
  };

  const handleMarkAsResolved = async (feedback) => {
    const feedbackId = feedback._id;
    setResolvingMap((prev) => ({ ...prev, [feedbackId]: true }));

    const payload = {
      qrId: qrId || feedback.qr_id || '',
      urgency_status: 'low',
      is_resolved: true,
      last_updated: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        'http://localhost:8004/api/text-analysis/feedback-metadata/',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            item._id === feedbackId
              ? {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    is_resolved: true,
                    urgency_status: 'low',
                    last_updated: payload.last_updated,
                  },
                }
              : item
          )
        );
      } else {
        console.error('Failed to update resolution status:', response.statusText);
      }
    } catch (err) {
      console.error('Error marking feedback as resolved:', err);
    } finally {
      setResolvingMap((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading feedback...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  if (!feedbacks.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">VOICE FEEDBACK LIVE</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500">No feedback received today for this QR code.</p>
        </div>
      </div>
    );
  }

  const displayedFeedbacks = filter === 'latest' ? [feedbacks[0]] : feedbacks;

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
      case 'high':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'orange':
      case 'medium':
        return 'bg-orange-50 border-orange-500 text-orange-900';
      case 'green':
      case 'low':
        return 'bg-green-50 border-green-500 text-green-900';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getSeverityIcon = (severity) => {
    const sev = String(severity).toLowerCase();
    if (sev === 'high' || sev === 'red') {
      return <AlertCircle className="w-8 h-8 text-red-600" />;
    }
    if (sev === 'medium' || sev === 'orange') {
      return <AlertCircle className="w-8 h-8 text-orange-500" />;
    }
    return <CheckCircle className="w-8 h-8 text-green-600" />;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp || timestamp === 'Invalid Date') return 'N/A';
    const parsedDate = new Date(timestamp);
    return isNaN(parsedDate.getTime()) ? timestamp : parsedDate.toLocaleString();
  };

  const formatEmotion = (emotion) => {
    if (!emotion) return 'Unknown';
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">VOICE FEEDBACK LIVE</h1>
          <p className="text-sm text-gray-500 mt-1">
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received today
          </p>
        </div>

        {/* FILTER SELECT */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">Latest</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className="space-y-8">
        {displayedFeedbacks.map((feedback) => {
          const meta = feedback.metadata || {};
          const metrics = feedback.dashboard_metrics || {};
          const audio = feedback.audio_analysis || {};
          const transcript = feedback.transcript_analysis || {};
          const rawDistribution = feedback.raw_emotion_distribution || {};

          // Metadata Priority Mapping
          const roomNumber = meta.room_number || meta.room || feedback.room_number || 'N/A';
          const submittedAt = meta.submitted_at || meta.date || meta.timestamp || feedback.submitted_at;
          const severity = meta.urgency_status || meta.severity || metrics.severity || audio.severity || 'low';
          const isResolved = meta.is_resolved ?? feedback.is_resolved ?? false;
          
          const aiAssessment = metrics.ai_assessment_remark || 'No assessment available.';
          const recommendedAction = metrics.recommended_action || 'No recommendation available.';
          const isResolving = resolvingMap[feedback._id] || false;

          return (
            <div key={feedback._id} className="border-b border-gray-200 pb-8">
              {/* FEEDBACK ALERT CARD */}
              <div
                className={`rounded-xl border-l-8 p-6 shadow-md ${getColorClasses(severity)}`}
              >
                <div className="flex justify-between items-start">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityIcon(severity)}
                      <h2 className="text-2xl font-bold uppercase tracking-wide">
                        {severity} URGENCY
                      </h2>
                    </div>

                    <div className="bg-white/60 rounded-lg p-4 mt-4">
                      <p className="text-lg font-bold opacity-90">AI Assessment:</p>
                      <p className="text-md mt-1">{aiAssessment}</p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right flex flex-col items-end gap-3 ml-4">
                    <div className="flex items-center justify-end gap-2 text-sm font-semibold opacity-80">
                      <MapPin className="w-4 h-4" />
                      Room {roomNumber}
                    </div>

                    <div className="flex items-center justify-end gap-2 text-sm opacity-80">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(submittedAt)}
                    </div>

                    {/* RESOLUTION STATUS */}
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-800 font-semibold text-xs border border-green-300">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsResolved(feedback)}
                        disabled={isResolving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs shadow-sm disabled:opacity-50 transition cursor-pointer"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Resolved
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                {feedback.description && (
                  <div className="bg-white/60 rounded-lg p-4 mt-4">
                    <p className="font-bold text-lg">Guest Feedback:</p>
                    <p className="text-md mt-1">{feedback.description}</p>
                  </div>
                )}

                {/* ACTION RECOMMENDATION */}
                <div className="bg-white/60 rounded-lg p-4 mt-3">
                  <p className="font-bold text-lg">Action Recommendation:</p>
                  <p className="text-md mt-1">{recommendedAction}</p>
                </div>
              </div>

              {/* DIAGNOSTIC BREAKDOWN */}
              <h3 className="text-xl font-bold text-gray-700 mt-6 mb-4 border-b pb-2">
                AI Diagnostic Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SEMANTIC CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      What was said (Semantic)
                    </h4>

                    {transcript.label ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          transcript.label.toLowerCase() === 'negative'
                            ? 'bg-red-100 text-red-700'
                            : transcript.label.toLowerCase() === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {transcript.label.toUpperCase()}
                        {typeof transcript.confidence_score === 'number'
                          ? ` (${(transcript.confidence_score * 100).toFixed(0)}%)`
                          : ''}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                        NO TEXT
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-700">
                    {feedback.transcript
                      ? `"${feedback.transcript}"`
                      : 'No transcript available for this feedback.'}
                  </div>

                  {feedback.transcript && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleTranslate(feedback)}
                        disabled={translating[feedback._id]}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition"
                      >
                        {translating[feedback._id] ? 'Translating...' : 'Translate to English'}
                      </button>
                    </div>
                  )}

                  {translations[feedback._id] && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          English Translation
                        </span>
                        {translations[feedback._id].language && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                            {translations[feedback._id].language}
                          </span>
                        )}
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-700">
                        {translations[feedback._id].text}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACOUSTIC CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-purple-500" />
                      How it was said (Acoustic)
                    </h4>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                      {formatEmotion(audio.dominant_emotion)} Tone
                    </span>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Dominant emotion confidence</span>
                      <span className="font-semibold text-gray-700">
                        {typeof audio.audio_score === 'number'
                          ? `${(audio.audio_score * 100).toFixed(0)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{ width: `${(audio.audio_score || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(rawDistribution)
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