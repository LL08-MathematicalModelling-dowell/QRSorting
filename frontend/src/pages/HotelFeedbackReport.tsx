import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Volume2,
  MessageSquare,
  Clock,
  MapPin,
  Filter,
  Sparkles,
  Crown,
  Languages,
  Loader2,
  ArrowLeft,
  Calendar,
  RefreshCw,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { feedbackAPI, merchantOrderAPI } from '@/lib/api';

// Sub-component to handle individual feedback audio fetching and rendering cleanly
const FeedbackAudioPlayer = ({ gridfsFileId }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAudioSignedUrl = async () => {
      if (!gridfsFileId) {
        setAudioUrl(null);
        setAudioError(null);
        return;
      }

      try {
        setAudioLoading(true);
        setAudioError(null);

        const response = await merchantOrderAPI.getMediaFiles(gridfsFileId);
        const signedUrl = response?.data?.signed_url;

        if (isMounted) {
          if (signedUrl) {
            setAudioUrl(`${import.meta.env.VITE_DATACUBE_DOMAIN || ''}${signedUrl}`);
          } else {
            setAudioError('Audio file URL not available.');
          }
        }
      } catch (err) {
        console.error('Failed to fetch audio media file:', err);
        if (isMounted) {
          setAudioError('Failed to load audio recording.');
        }
      } finally {
        if (isMounted) {
          setAudioLoading(false);
        }
      }
    };

    fetchAudioSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [gridfsFileId]);

  if (audioLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#F0E6D8] text-xs text-[#8C7A6B] mt-4">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
        Fetching audio recording...
      </div>
    );
  }

  if (audioError) {
    return <p className="text-xs text-[#A35C48] font-medium mt-4">⚠️ {audioError}</p>;
  }

  if (!audioUrl) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#F0E6D8]">
      <div className="flex items-center gap-1.5 mb-2 text-[#4A453F] font-bold text-xs">
        <Volume2 className="w-4 h-4 text-[#C5A059]" />
        Audio Recording Playback
      </div>
      <audio
        controls
        src={audioUrl}
        className="w-full h-10 rounded-xl outline-none"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const ReportDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrId = searchParams.get('id');
  const clientName = searchParams.get('client');

  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState('latest');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reopeningStates, setReopeningStates] = useState({}); // Tracks which card is currently prompting for severity
  const [selectedSeverities, setSelectedSeverities] = useState({}); // Stores chosen severity per feedback ID

  const today = new Date().toISOString().split('T')[0];

  // Helper function to extract a reliable timestamp from feedback or metadata
  const getFeedbackTimestamp = (item) => {
    const raw =
      item.submitted_at ||
      item.date ||
      item.timestamp ||
      item.createdAt;

    if (raw) {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) return parsed.getTime();
    }

    if (item._id && typeof item._id === 'string' && item._id.length === 24) {
      try {
        const timestampHex = item._id.substring(0, 8);
        return parseInt(timestampHex, 16) * 1000;
      } catch (e) {
        // Ignore parsing error
      }
    }

    return 0;
  };

  useEffect(() => {
    const fetchFeedbacksOnly = async (isInitial = false) => {
      if (!qrId) {
        setError('QR code ID is missing.');
        if (isInitial) setLoading(false);
        return;
      }

      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const response = await feedbackAPI.getFeedbacksByDate(qrId, today, clientName);
        const feedbackList = response.feedbacks || [];

        // Sort newest -> oldest, preserving local resolution states
        setFeedbacks((prevFeedbacks) => {
          const resolvedMap = new Map(prevFeedbacks.map((f) => [f._id, f.isResolved]));
          const merged = feedbackList.map((feedback) => {
            const serverResolved = feedback.is_resolved ?? false;
            const localResolved = resolvedMap.get(feedback._id);
            return {
              ...feedback,
              isResolved: localResolved !== undefined ? localResolved : serverResolved,
            };
          });

          return merged.sort((a, b) => {
            const timeA = getFeedbackTimestamp(a);
            const timeB = getFeedbackTimestamp(b);
            return timeB - timeA;
          });
        });

        if (isInitial) setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        if (isInitial) setError('No feedback found for this location');
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setTimeout(() => setIsRefreshing(false), 600);
        }
      }
    };

    fetchFeedbacksOnly(true);

    const intervalId = setInterval(() => {
      fetchFeedbacksOnly(false);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [qrId, today, clientName]);

  const handleResolveToggle = async (feedback, confirmReopen = false) => {
    const isCurrentlyResolved = feedback.isResolved;

    if (isCurrentlyResolved && !reopeningStates[feedback._id] && !confirmReopen) {
      setReopeningStates((prev) => ({ ...prev, [feedback._id]: true }));
      if (!selectedSeverities[feedback._id]) {
        setSelectedSeverities((prev) => ({ ...prev, [feedback._id]: 'medium' }));
      }
      return;
    }

    const newResolvedStatus = !isCurrentlyResolved;
    const chosenSeverity = newResolvedStatus 
      ? 'low' 
      : (selectedSeverities[feedback._id] || 'medium');

    setReopeningStates((prev) => ({ ...prev, [feedback._id]: false }));

    // Optimistic local UI update
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((item) => {
        if (item._id === feedback._id) {
          return {
            ...item,
            isResolved: newResolvedStatus,
            dashboard_metrics: {
              ...item.dashboard_metrics,
              severity: chosenSeverity,
            },
          };
        }
        return item;
      })
    );

    try {
      const payload = {
        qrId: qrId,
        feedbackId: feedback._id,
        is_resolved: newResolvedStatus,
        severity: chosenSeverity,
      };

      const response = await feedbackAPI.updateFeedbackStatus(payload);

      if (!response.success) {
        console.error('Failed to update resolution status on server');
      }
    } catch (err) {
      console.error('Error sending resolution update request:', err);
    }
  };

  const handleTranslate = async (feedback) => {
    if (!feedback.transcript || translating[feedback._id]) return;

    try {
      setTranslating((prev) => ({ ...prev, [feedback._id]: true }));
      const response = await feedbackAPI.translateText(feedback.transcript, 'English');
      
      const translationText =
        response?.data?.translation ||
        response?.data?.english_translation ||
        response?.data?.text;

      if (translationText) {
        setTranslations((prev) => ({
          ...prev,
          [feedback._id]: {
            text: translationText,
            language: response?.data?.detected_language,
            languageCode: response?.data?.language_code,
          },
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating((prev) => ({ ...prev, [feedback._id]: false }));
    }
  };

  const formatClientName = (name: string | null) => {
    if (!name) return 'Grand Horizon Hotel';
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const displayName = formatClientName(clientName);

  // Filter feedbacks based on selected time interval
  const getFilteredByTimeRange = (list) => {
    const now = new Date().getTime();
    let hoursLimit = 24;

    if (timeRange === '7d') hoursLimit = 24 * 7;
    if (timeRange === '15d') hoursLimit = 24 * 15;
    if (timeRange === '30d') hoursLimit = 24 * 30;

    const msLimit = hoursLimit * 60 * 60 * 1000;

    return list.filter((item) => {
      const timestamp = getFeedbackTimestamp(item);
      if (!timestamp) return true;
      return now - timestamp <= msLimit;
    });
  };

  const timeFilteredFeedbacks = getFilteredByTimeRange(feedbacks);
  const displayedFeedbacks = filter === 'latest' ? [timeFilteredFeedbacks[0]].filter(Boolean) : timeFilteredFeedbacks;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C5A059] border-t-transparent mb-4"></div>
          <p className="text-[#8C7A6B] font-medium tracking-wide">
            Loading sentiment analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md border border-[#E6D5B8] rounded-2xl p-8 text-center max-w-md shadow-xl">
          <p className="text-[#A35C48] font-semibold tracking-wide">{error}</p>
        </div>
      </div>
    );
  }

  const getUrgencyTheme = (severity) => {
    const sev = String(severity).toLowerCase();
    switch (sev) {
      case 'red':
      case 'high':
        return {
          cardBg: 'bg-[#991B1B]',
          headerText: 'text-white',
          boxBg: 'bg-white text-gray-900 border border-red-200',
          accentText: 'text-red-700',
          metaBg: 'bg-white/10 text-white border-white/20',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
        };
      case 'orange':
      case 'medium':
        return {
          cardBg: 'bg-[#C2410C]',
          headerText: 'text-white',
          boxBg: 'bg-white text-gray-900 border border-orange-200',
          accentText: 'text-orange-800',
          metaBg: 'bg-white/10 text-white border-white/20',
          icon: <AlertCircle className="w-8 h-8 text-white" />,
        };
      default:
        return {
          cardBg: 'bg-[#065F46]',
          headerText: 'text-white',
          boxBg: 'bg-white text-gray-900 border border-emerald-200',
          accentText: 'text-emerald-800',
          metaBg: 'bg-white/10 text-white border-white/20',
          icon: <CheckCircle className="w-8 h-8 text-white" />,
        };
    }
  };

  const formatDateTime = (timestamp: string | Date | null | undefined) => {
    if (!timestamp) return 'N/A';

    const normalizedTimestamp =
      typeof timestamp === 'string'
        ? timestamp.replace(/([+-]\d{2}:\d{2})Z$/, '$1')
        : timestamp;

    const parsedDate = new Date(normalizedTimestamp);

    if (isNaN(parsedDate.getTime())) return 'N/A';

    return parsedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatEmotion = (emotion) => {
    if (!emotion) return 'Unknown';
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* NAVIGATION & HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#E6D5B8] rounded-xl text-xs font-bold text-[#7D756D] hover:bg-white hover:text-[#2C2A29] shadow-sm transition duration-200 cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
            Back to Overview
          </button>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E6D5B8]/60 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#C5A059] font-bold text-xs uppercase tracking-widest mb-1.5">
                <Crown className="w-4 h-4 text-[#C5A059]" />
                {displayName}
              </div>
              
              {/* TITLE WITH LIVE SPINNER BESIDE IT */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#2C2A29] tracking-tight">
                  VOICE FEEDBACK LIVE
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 rounded-full px-3 py-1 shadow-xs">
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Live (3s)
                </span>
              </div>

              <p className="text-sm font-medium text-[#7D756D] mt-1.5">
                {timeFilteredFeedbacks.length} feedback{timeFilteredFeedbacks.length !== 1 ? 's' : ''} found for selected interval
              </p>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="flex flex-wrap items-center gap-3">
              {/* TIME INTERVAL DROPDOWN */}
              <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-[#E6D5B8] rounded-2xl px-4 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-[#C5A059] mr-2" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider text-[#4A453F] focus:outline-none cursor-pointer pr-2"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="15d">15 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>

              {/* LATEST / ALL DROPDOWN */}
              <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-[#E6D5B8] rounded-2xl px-4 py-2 shadow-sm">
                <Filter className="w-4 h-4 text-[#C5A059] mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider text-[#4A453F] focus:outline-none cursor-pointer pr-2"
                >
                  <option value="latest">Latest</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK LIST OR EMPTY STATE */}
        {displayedFeedbacks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-[#E6D5B8] rounded-3xl p-12 text-center shadow-sm">
            <p className="text-[#8C7A6B] font-medium">
              No feedback found for the selected time interval.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {displayedFeedbacks.map((feedback, index) => {
              const metrics = feedback.dashboard_metrics || {};
              const audio = feedback.audio_analysis || {};
              const transcript = feedback.transcript_analysis || {};
              const rawDistribution = feedback.raw_emotion_distribution || {};

              const roomNumber = feedback.room_number || feedback.room || 'N/A';
              const submittedAt = feedback.submitted_at || feedback.date || feedback.timestamp;
              const severity = feedback.severity || metrics.severity || audio.severity || 'low';

              const gridfsFileId = feedback.gridfs_file_id;

              const theme = getUrgencyTheme(severity);
              const aiAssessment = metrics.ai_assessment_remark || 'No assessment available.';
              const recommendedAction = metrics.recommended_action || 'No recommendation available.';
              const isReopeningActive = reopeningStates[feedback._id];

              return (
                <React.Fragment key={feedback._id}>
                  <div className="space-y-6">
                    {/* PROMINENT URGENCY CARD */}
                    <div
                      className={`rounded-3xl ${theme.cardBg} p-8 shadow-xl border border-black/10 transition-all duration-300`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                        {/* LEFT HEADER */}
                        <div className="flex items-center gap-3">
                          {theme.icon}
                          <h2 className={`text-2xl font-black uppercase tracking-wider ${theme.headerText}`}>
                            {severity} URGENCY
                          </h2>
                        </div>

                        {/* RIGHT METADATA, SEVERITY SELECTOR & RESOLVE/REOPEN BUTTON */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`flex items-center gap-4 text-xs font-bold ${theme.metaBg} backdrop-blur-md px-4 py-2 rounded-2xl border shadow-sm`}>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              Room {roomNumber}
                            </div>
                            <span className="opacity-40">|</span>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(submittedAt)}
                            </div>
                          </div>

                          {/* INLINE SEVERITY DROPDOWN, CONFIRM BUTTON & CLOSE ICON */}
                          {feedback.isResolved && isReopeningActive ? (
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl shadow-sm">
                              <div className="bg-white/25 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Severity:</span>
                                <select
                                  value={selectedSeverities[feedback._id] || 'medium'}
                                  onChange={(e) =>
                                    setSelectedSeverities((prev) => ({
                                      ...prev,
                                      [feedback._id]: e.target.value,
                                    }))
                                  }
                                  className="bg-white text-gray-900 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>

                              <button
                                onClick={() => handleResolveToggle(feedback, true)}
                                className="px-4 py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-md bg-amber-600 hover:bg-amber-700 text-white border border-amber-500"
                              >
                                <Check className="w-4 h-4" />
                                Confirm Reopen
                              </button>

                              {/* CLOSE/UNDO ICON BUTTON TO THE RIGHT OF CONFIRM */}
                              <button
                                onClick={() =>
                                  setReopeningStates((prev) => ({ ...prev, [feedback._id]: false }))
                                }
                                className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition duration-200 cursor-pointer flex items-center justify-center"
                                title="Cancel reopening"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleResolveToggle(feedback, false)}
                              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm backdrop-blur-md ${
                                feedback.isResolved
                                  ? 'bg-amber-600 text-white hover:bg-amber-700 border border-amber-500'
                                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                              }`}
                            >
                              {feedback.isResolved ? (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  Reopen case
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as resolved
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* AI ASSESSMENT */}
                      <div className={`rounded-2xl p-5 ${theme.boxBg} shadow-sm mb-4`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${theme.accentText} mb-1 flex items-center gap-1.5`}>
                          <Sparkles className="w-3.5 h-3.5" /> AI Assessment:
                        </p>
                        <p className="text-base font-medium text-gray-800 leading-relaxed">
                          {aiAssessment}
                        </p>
                      </div>

                      {/* GUEST FEEDBACK */}
                      {feedback.description && (
                        <div className={`rounded-2xl p-5 ${theme.boxBg} shadow-sm mb-4`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${theme.accentText} mb-1`}>
                            Guest Feedback:
                          </p>
                          <p className="text-base font-medium text-gray-800 leading-relaxed">
                            "{feedback.description}"
                          </p>
                        </div>
                      )}

                      {/* ACTION RECOMMENDATION */}
                      <div className={`rounded-2xl p-5 ${theme.boxBg} shadow-sm`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${theme.accentText} mb-1`}>
                          Action Recommendation:
                        </p>
                        <p className="text-base font-medium text-gray-800 leading-relaxed">
                          {recommendedAction}
                        </p>
                      </div>
                    </div>

                    {/* DIAGNOSTIC BREAKDOWN TITLE */}
                    <div className="flex items-center gap-2 pt-2">
                      <h3 className="text-xl font-bold text-[#2C2A29] tracking-tight">
                        AI Diagnostic Breakdown
                      </h3>
                      <div className="flex-1 h-px bg-[#E6D5B8]/60"></div>
                    </div>

                    {/* DIAGNOSTIC CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SEMANTIC CARD */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[#E6D5B8] p-6 shadow-[0_4px_20px_-4px_rgba(197,160,89,0.08)]">
                        <div className="flex justify-between items-center mb-5">
                          <h4 className="font-bold text-[#2C2A29] flex items-center gap-2 text-sm tracking-wide">
                            <MessageSquare className="w-4 h-4 text-[#C5A059]" />
                            What was said (Semantic)
                          </h4>

                          {transcript.label ? (
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                transcript.label.toLowerCase() === 'negative'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : transcript.label.toLowerCase() === 'positive'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {transcript.label.toUpperCase()}
                              {typeof transcript.confidence_score === 'number'
                                ? ` (${(transcript.confidence_score * 100).toFixed(0)}%)`
                                : ''}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8C7A6B] text-[10px] font-bold uppercase tracking-wider border border-[#E6D5B8]">
                              NO TEXT
                            </span>
                          )}
                        </div>

                        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#F0E6D8] italic text-sm text-[#4A453F] leading-relaxed mb-4">
                          {feedback.transcript
                            ? `"${feedback.transcript}"`
                            : 'No transcript available for this feedback.'}
                        </div>

                        {/* BLUE TRANSLATE BUTTON */}
                        {feedback.transcript && (
                          <div>
                            <button
                              onClick={() => handleTranslate(feedback)}
                              disabled={translating[feedback._id]}
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm disabled:opacity-50 transition duration-200 cursor-pointer"
                            >
                              <Languages className="w-3.5 h-3.5 text-white" />
                              {translating[feedback._id] ? 'Translating...' : 'Translate to English'}
                            </button>
                          </div>
                        )}

                        {translations[feedback._id] && (
                          <div className="mt-4 pt-4 border-t border-[#F0E6D8]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                                English Translation
                              </span>
                              {translations[feedback._id].language && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                  {translations[feedback._id].language}
                                </span>
                              )}
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-sm text-[#4A453F] leading-relaxed">
                              {translations[feedback._id].text}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACOUSTIC CARD */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[#E6D5B8] p-6 shadow-[0_4px_20px_-4px_rgba(197,160,89,0.08)] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-5">
                            <h4 className="font-bold text-[#2C2A29] flex items-center gap-2 text-sm tracking-wide">
                              <Volume2 className="w-4 h-4 text-[#C5A059]" />
                              How it was said (Acoustic)
                            </h4>
                            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E6D5B8] text-[#8C7A6B] text-[10px] font-extrabold uppercase tracking-wider">
                              {formatEmotion(audio.dominant_emotion)} Tone
                            </span>
                          </div>

                          {/* DOMINANT EMOTION CONFIDENCE BAR (PURPLE) */}
                          <div className="mb-6 bg-[#FAF7F2] p-4 rounded-2xl border border-[#F0E6D8]">
                            <div className="flex justify-between text-xs font-bold text-[#7D756D] mb-2">
                              <span>Dominant emotion confidence</span>
                              <span className="text-[#2C2A29]">
                                {typeof audio.audio_score === 'number'
                                  ? `${(audio.audio_score * 100).toFixed(0)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="w-full bg-[#E6D5B8]/40 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(audio.audio_score || 0) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* OTHER EMOTION DISTRIBUTION BARS */}
                          <div className="space-y-3">
                            {Object.entries(rawDistribution)
                              .sort(([, a], [, b]) => b - a)
                              .map(([emotion, score]) => {
                                const isDominant =
                                  audio.dominant_emotion &&
                                  emotion.toLowerCase() === audio.dominant_emotion.toLowerCase();

                                return (
                                  <div key={emotion} className="flex items-center text-xs">
                                    <span className="w-20 capitalize font-medium text-[#7D756D]">
                                      {emotion}
                                    </span>
                                    <div className="flex-1 bg-[#FAF7F2] rounded-full h-2 mx-3 overflow-hidden border border-[#F0E6D8]">
                                      <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          isDominant ? 'bg-purple-600' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${score * 100}%` }}
                                      />
                                    </div>
                                    <span className="w-12 text-right font-semibold text-[#4A453F]">
                                      {(score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* AUDIO PLAYER */}
                        <FeedbackAudioPlayer gridfsFileId={gridfsFileId} />
                      </div>
                    </div>
                  </div>

                  {/* FEEDBACK ENTRY SEPARATOR */}
                  {index < displayedFeedbacks.length + 1 && (
                    <div className="relative py-6 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E6D5B8]"></div>
                      </div>
                      <div className="relative bg-[#FAF7F2] border border-[#E6D5B8] px-4 py-1.5 rounded-full text-xs font-bold text-[#C5A059] shadow-sm flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>End of Feedback Entry #{index + 1}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER WATERMARK */}
      <footer className="mt-8 text-right">
        <span className="text-[10px] text-[#A89F91] font-medium tracking-wide">
          Voice Feedback Live @ DoWell Research
        </span>
      </footer>
    </div>
  );
};

export default ReportDashboard;