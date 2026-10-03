import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  MapPin,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Languages,
  Loader2 as Loader,
} from 'lucide-react';
import { productFeedbackAPI, feedbackAPI } from '@/lib/api';


// Label mappings for raw acoustic emotion distributions
const EMOTION_LABEL_MAP = {
  sad: 'Disappointed / Dissatisfied',
  fearful: 'Anxious / Apprehensive',
  disgust: 'Frustrated',
  angry: 'Agitated / Escalated Tone',
  calm: 'Composed / Calm',
  neutral: 'Neutral / Matter-of-Fact',
  happy: 'Satisfied / Positive Tone',
  surprised: 'Expressive / Unexpected Reaction',
};

// Supported languages list
const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Punjabi',
  'Gujarati',
  'Bengali',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Odiya',
  'Urdu',
];

// Helper function to format timestamps into relative time (e.g., "2m ago")
const getRelativeTimeString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const ReportDashboard = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const qrId = id ? id.slice(0, 4) : '';

  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Translation States
  const [selectedLanguageMap, setSelectedLanguageMap] = useState({});
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});

  // Core data fetching logic
  const fetchFeedbackAndMetadata = useCallback(
    async (isInitial = false) => {
      if (!qrId) {
        setError('QR code ID is missing.');
        setLoading(false);
        return;
      }

      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const response = await productFeedbackAPI.getProductFeedbacks(qrId);
        const feedbackList = response.feedbacks || [];

        const feedbacksWithMetadata = await Promise.all(
          feedbackList.map(async (feedback) => {
            try {
              const metaRes = await fetch(
                `${import.meta.env.VITE_METADATA_API}?qrId=${qrId}&feedbackId=${feedback._id}`,
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

        const sortedFeedbacks = [...feedbacksWithMetadata].sort(
          (a, b) =>
            new Date(b.metadata?.submitted_at || b.metadata?.date || b.submitted_at) -
            new Date(a.metadata?.submitted_at || a.metadata?.date || a.submitted_at)
        );

        setFeedbacks(sortedFeedbacks);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        if (isInitial) {
          setError('No feedback found for this QR code today.');
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [qrId]
  );

  useEffect(() => {
    fetchFeedbackAndMetadata(true);

    const intervalId = setInterval(() => {
      fetchFeedbackAndMetadata(false);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchFeedbackAndMetadata]);

  // Dynamic Translate Handler based on selected language
  const handleTranslate = async (feedback) => {
    const textToTranslate = feedback.transcript || feedback.description;
    if (!textToTranslate || translating[feedback._id]) return;

    // Fallback to default language if not explicitly mapped yet
    const targetLang = selectedLanguageMap[feedback._id] || SUPPORTED_LANGUAGES[0];

    try {
      setTranslating((prev) => ({ ...prev, [feedback._id]: true }));
      const response = await feedbackAPI.translateText(textToTranslate, targetLang);
      const translation = response?.data?.translation || response?.translation || 'Translation not available.';

      if (translation) {
        setTranslations((prev) => ({
          ...prev,
          [feedback._id]: {
            text: translation,
            targetLanguage: targetLang,
            detectedLanguage: response?.data?.detected_language || 'Auto',
          },
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating((prev) => ({ ...prev, [feedback._id]: false }));
    }
  };

  if (loading) 
    return (
      <div className="h-screen flex items-center justify-center text-stone-600 font-sans">
        <Loader className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}/> 
          <h1 className="ml-2 text-stone-600 font-sans">Generating your dashboard...</h1>
      </div>
  );

  if (error) return <div className="h-screen flex items-center justify-center text-red-600 font-sans">{error}</div>;

  if (!feedbacks.length) {
    return (
      <div className="h-screen bg-[#FAF7F2] p-6 font-sans text-stone-800 flex flex-col justify-center items-center">
        <div className="mb-4">
          <span className="text-2xl font-black tracking-wider uppercase font-sans">
            <span className="text-stone-600">PURE</span>
            <span className="text-[#32D583]">TRACE</span>
          </span>
        </div>
        <p className="text-stone-500 text-sm">No feedback received today for this QR code.</p>
      </div>
    );
  }

  // Active selected feedback
  const feedback = feedbacks[selectedIndex] || feedbacks[0];

  const meta = feedback.metadata || {};
  const metrics = feedback.dashboard_metrics || {};
  const audio = feedback.audio_analysis || {};
  const transcript = feedback.transcript_analysis || {};
  const rawDistribution = feedback.raw_emotion_distribution || {};

  const locationInfo = meta.location || meta.room || feedback.room_number || `Batch ${feedback.batch_id || 'N/A'}`;
  const locationExtra = meta.extra_info || (feedback.qr_id ? `QR: ${feedback.qr_id}` : '');
  const severity = meta.urgency_status || meta.severity || metrics.severity || audio.severity || 'low';

  const aiAssessment = metrics.ai_assessment_remark || 'No assessment available.';
  const customerReport = feedback.description || feedback.transcript || 'No report text provided.';
  const recommendedAction = metrics.recommended_action || audio.recommended_action || 'No action specified.';

  const distributionEntries = Object.entries(rawDistribution).sort(([, a], [, b]) => b - a);
  const dominantLabel = EMOTION_LABEL_MAP[audio.dominant_emotion?.toLowerCase()] || audio.dominant_emotion || 'Acoustic';

  const getPriorityBadgeClass = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === 'high' || s === 'red') return 'bg-red-100 text-red-800 border-red-200';
    if (s === 'medium' || s === 'orange') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getCardBorderClass = (sev) => {
    const s = String(sev).toLowerCase();
    if (s === 'high' || s === 'red') return 'border-l-red-500';
    if (s === 'medium' || s === 'orange') return 'border-l-amber-500';
    return 'border-l-emerald-500';
  };

  // Render Selector Component to reuse between Mobile & Desktop locations
  const renderFeedbackSelector = (extraClasses = '') => (
    feedbacks.length > 0 && (
      <div className={`relative ${extraClasses}`}>
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="w-full lg:w-auto appearance-none bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-medium text-xs rounded-lg pl-3 pr-8 py-2 lg:py-1.5 focus:outline-none cursor-pointer shadow-xs transition"
        >
          {feedbacks.map((item, idx) => {
            const dateStr = item.metadata?.submitted_at || item.metadata?.date || item.submitted_at;
            const relativeTime = getRelativeTimeString(dateStr);
            const itemSeverity = item.metadata?.urgency_status || item.severity || 'low';

            return (
              <option key={item._id || idx} value={idx}>
                Feedback #{idx + 1} ({itemSeverity}) {relativeTime ? `• ${relativeTime}` : ''}
              </option>
            );
          })}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    )
  );

  return (
    <div className="min-h-screen lg:h-screen w-screen bg-[#FAF7F2] p-4 sm:p-6 font-sans text-stone-800 flex flex-col overflow-y-auto lg:overflow-hidden box-border">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-3 border-b border-stone-200/80 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <img 
              src="/puretrace-logo.png" 
              alt="PureTrace" 
              className="h-7 w-auto object-contain hidden sm:block" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-xl font-black tracking-wider uppercase font-sans">
              <span className="text-stone-600">PURE</span>
              <span className="text-[#32D583]">TRACE</span>
            </span>
            <span className="text-md text-blue-800 font-bold pl-1 border-l border-stone-300 hidden md:inline">
              Product Feedback Dashboard
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Live (3s)
          </span>

          {/* DESKTOP FEEDBACK SELECTOR */}
          {renderFeedbackSelector('hidden lg:block')}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 hidden md:inline">
            {feedbacks.length} report{feedbacks.length !== 1 ? 's' : ''} received
          </span>
        </div>
      </div>

      {/* 50/50 SPLIT CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 flex-1 min-h-0">
        
        {/* MAP CONTAINER: FIRST ON MOBILE, LEFT (ORDER-1) ON DESKTOP */}
        <div className="flex flex-col h-auto lg:h-full order-1">
          <div className="bg-white rounded-xl shadow-xs border border-stone-200/80 p-4 flex flex-col flex-1 overflow-hidden min-h-[350px] sm:min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between pb-2 shrink-0">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Live Location Overview
              </h3>
              <a
                href={`${import.meta.env.VITE_PURETRACE_MAP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                Open Full Map <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full flex-1 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 relative min-h-[220px] lg:min-h-0">
              <iframe
                src={`${import.meta.env.VITE_PURETRACE_MAP}`}
                title="Scan Location Map"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="bg-stone-50 rounded-lg p-2 mt-2 text-[10px] text-stone-600 grid grid-cols-2 gap-2 shrink-0">
              <div>
                <span className="text-stone-400 block">Batch ID:</span>
                <span className="font-medium text-stone-800">{feedback.batch_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-400 block">QR Code ID:</span>
                <span className="font-medium text-stone-800">{feedback.qr_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* MOBILE/TABLET FEEDBACK SELECTOR (DISPLAYED BELOW MAP) */}
          {renderFeedbackSelector('block lg:hidden mt-3')}
        </div>

        {/* REPORT & AI DIAGNOSTICS: SECOND ON MOBILE, RIGHT (ORDER-2) ON DESKTOP */}
        <div className="flex flex-col gap-3 h-auto lg:h-full lg:overflow-y-auto pr-0 lg:pr-1 order-2">
          {/* PRIMARY FEEDBACK CARD */}
          <div
            className={`bg-white rounded-xl shadow-xs border border-stone-200/80 border-l-[8px] p-4 relative transition shrink-0 ${getCardBorderClass(
              severity
            )}`}
          >
            <div className="flex justify-between items-center mb-3">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                  severity
                )}`}
              >
                {severity} priority
              </span>
              <p className="text-stone-600 text-xs font-semibold">
                {locationInfo} <span className="text-stone-400 font-normal">{locationExtra}</span>
              </p>
            </div>

            {/* 3-COLUMN METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="bg-stone-100/70 rounded-lg p-3">
                <span className="text-[11px] font-bold text-stone-800 block mb-1">AI Insight</span>
                <p className="text-[11px] text-stone-600 leading-snug line-clamp-3">
                  {aiAssessment}
                </p>
              </div>

              <div className="bg-stone-100/70 rounded-lg p-3">
                <span className="text-[11px] font-bold text-stone-800 block mb-1">Customer Report</span>
                <p className="text-[11px] text-stone-600 italic leading-snug line-clamp-3">
                  "{customerReport}"
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3">
                <span className="text-[11px] font-bold text-stone-800 block mb-1">Suggested Resolution</span>
                <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                  "{recommendedAction}"
                </p>
              </div>
            </div>
          </div>

          {/* AI DIAGNOSTIC BREAKDOWN */}
          <div className="bg-stone-200/40 rounded-xl p-4 flex-1 flex flex-col min-h-0">
            <h2 className="text-xs font-bold text-stone-900 mb-2 shrink-0">
              AI Diagnostic Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
              {/* SEMANTIC ANALYSIS & TRANSLATION SECTION */}
              <div className="bg-white rounded-lg p-3 shadow-xs border border-stone-200/60 flex flex-col justify-between overflow-hidden">
                <div className="overflow-y-auto pr-1 space-y-3">
                  <div>
                    <span className="inline-block text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 mb-1.5">
                      {transcript.category || 'PRODUCT FEEDBACK'}
                    </span>
                    <h3 className="text-xs font-bold text-stone-800 mb-1">Semantic Content</h3>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                      <p className="text-[11px] text-stone-700 font-mono break-all leading-snug">
                        {feedback.transcript || 'No transcript text available.'}
                      </p>
                    </div>
                  </div>

                  {/* TRANSLATE CONTROLS */}
                  <div className="border-t border-stone-100 pt-2.5">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Translate to
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          value={selectedLanguageMap[feedback._id] || SUPPORTED_LANGUAGES[0]}
                          onChange={(e) =>
                            setSelectedLanguageMap((prev) => ({
                              ...prev,
                              [feedback._id]: e.target.value,
                            }))
                          }
                          className="w-full appearance-none bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-8"
                        >
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => handleTranslate(feedback)}
                        disabled={translating[feedback._id]}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {translating[feedback._id] ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          'Translate'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* TRANSLATED OUTPUT BOX */}
                  {translations[feedback._id] && (
                    <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-900 font-semibold text-[11px]">
                        <Languages className="w-3.5 h-3.5 text-blue-600" />
                        {translations[feedback._id].targetLanguage} Translation
                      </div>
                      <p className="text-[11px] text-stone-800 leading-snug font-medium">
                        {translations[feedback._id].text}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-stone-600 space-y-0.5 font-medium border-t border-stone-100 pt-2 shrink-0 mt-2">
                  <p>Semantic Confidence: {((metrics.confidence_scores?.semantic_confidence || 0) * 100).toFixed(0)}%</p>
                  <p>Acoustic Confidence: {((metrics.confidence_scores?.acoustic_confidence || audio.audio_score || 0) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* ACOUSTIC ANALYSIS */}
              <div className="bg-white rounded-lg p-3 shadow-xs border border-stone-200/60 flex flex-col justify-between overflow-hidden min-h-[200px]">
                <div className="flex flex-col h-full overflow-hidden">
                  <span className="inline-block text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 mb-1.5 shrink-0">
                    AUDIO / EMOTION ANALYSIS
                  </span>
                  <h3 className="text-xs font-bold text-stone-800 mb-2 shrink-0">Sentiment Breakdown</h3>

                  <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    {typeof audio.audio_score === 'number' && (
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5 font-medium">
                          <span className="text-stone-700">Primary ({dominantLabel})</span>
                          <span className="text-stone-900 font-bold">{(audio.audio_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1">
                          <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${audio.audio_score * 100}%` }} />
                        </div>
                      </div>
                    )}

                    {distributionEntries.map(([label, score]) => {
                      const percentage = score <= 1 ? score * 100 : score;
                      const mappedLabel = EMOTION_LABEL_MAP[label.toLowerCase()] || label;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-[10px] mb-0.5 font-medium">
                            <span className="text-stone-700 truncate">{mappedLabel}</span>
                            <span className="text-stone-900 font-bold">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1">
                            <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportDashboard;