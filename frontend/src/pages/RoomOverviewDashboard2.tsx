import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Filter, 
  Building2,
  ChevronLeft 
} from 'lucide-react';
import ReportDashboard from './HotelFeedbackReport'; // Importing your detail view

const TypedReportDashboard = ReportDashboard as React.ComponentType<{ data: any }>;

const RoomOverviewDashboard = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterColor, setFilterColor] = useState('all');
  
  // Sample room feeds from backend API
  const roomsData = [
    {
      id: "room_404",
      room_number: "404",
      guest_name: "John Doe",
      color: "red",
      severity: "high",
      summary: "Ceiling leaking onto luggage",
      time_ago: "3 mins ago",
      payload: {
        status: "success",
        timestamp: "2026-07-16T14:42:00Z",
        meta: { guest_id: "Room 404", duration_seconds: 12.4 },
        dashboard_metrics: {
          assigned_color: "red",
          severity: "high",
          dominant_emotion: "Calmly Dissatisfied",
          recommended_action: "CRITICAL: Immediate manager dispatch to guest room."
        },
        multimodal_breakdown: {
          text_analysis: {
            transcript: "The ceiling is leaking all over my luggage, this is unacceptable.",
            detected_sentiment: "NEGATIVE",
            score: 0.99
          },
          audio_analysis: {
            detected_tone: "calm",
            score: 0.72,
            raw_distribution: { calm: 0.72, sad: 0.18, neutral: 0.05, angry: 0.05 }
          }
        }
      }
    },
    {
      id: "room_201",
      room_number: "201",
      guest_name: "Sarah Smith",
      color: "orange",
      severity: "medium",
      summary: "Delay in delivering extra towels",
      time_ago: "14 mins ago",
      payload: {
        status: "success",
        timestamp: "2026-07-16T14:31:00Z",
        meta: { guest_id: "Room 201", duration_seconds: 8.1 },
        dashboard_metrics: {
          assigned_color: "orange",
          severity: "medium",
          dominant_emotion: "Frustrated",
          recommended_action: "URGENT: Dispatch housekeeping within 10 mins."
        },
        multimodal_breakdown: {
          text_analysis: {
            transcript: "I asked for extra towels an hour ago and nobody showed up.",
            detected_sentiment: "NEGATIVE",
            score: 0.85
          },
          audio_analysis: {
            detected_tone: "angry",
            score: 0.88,
            raw_distribution: { angry: 0.88, neutral: 0.08, calm: 0.04 }
          }
        }
      }
    },
    {
      id: "room_305",
      room_number: "305",
      guest_name: "Robert Chen",
      color: "yellow",
      severity: "low-medium",
      summary: "Inquiry about late checkout times",
      time_ago: "28 mins ago",
      payload: {
        status: "success",
        timestamp: "2026-07-16T14:15:00Z",
        meta: { guest_id: "Room 305", duration_seconds: 6.2 },
        dashboard_metrics: {
          assigned_color: "yellow",
          severity: "low-medium",
          dominant_emotion: "Neutral",
          recommended_action: "INFO: Call room to confirm 12 PM checkout option."
        },
        multimodal_breakdown: {
          text_analysis: {
            transcript: "Could someone let me know if late checkout is available tomorrow?",
            detected_sentiment: "NEUTRAL",
            score: 0.92
          },
          audio_analysis: {
            detected_tone: "calm",
            score: 0.95,
            raw_distribution: { calm: 0.95, happy: 0.05 }
          }
        }
      }
    },
    {
      id: "room_108",
      room_number: "108",
      guest_name: "Emily Davis",
      color: "green",
      severity: "low",
      summary: "Compliment on breakfast buffet service",
      time_ago: "45 mins ago",
      payload: {
        status: "success",
        timestamp: "2026-07-16T13:58:00Z",
        meta: { guest_id: "Room 108", duration_seconds: 9.5 },
        dashboard_metrics: {
          assigned_color: "green",
          severity: "low",
          dominant_emotion: "Happy",
          recommended_action: "NO ACTION REQUIRED: Log feedback to guest profile."
        },
        multimodal_breakdown: {
          text_analysis: {
            transcript: "The breakfast spread was fantastic, thanks to the staff!",
            detected_sentiment: "POSITIVE",
            score: 0.98
          },
          audio_analysis: {
            detected_tone: "happy",
            score: 0.91,
            raw_distribution: { happy: 0.91, calm: 0.09 }
          }
        }
      }
    }
  ];

  // Card theme helper
  const getCardTheme = (color) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-50 hover:bg-red-100/80',
          border: 'border-red-500',
          badge: 'bg-red-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          glow: 'shadow-red-100'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 hover:bg-orange-100/80',
          border: 'border-orange-500',
          badge: 'bg-orange-500 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          glow: 'shadow-orange-100'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/80',
          border: 'border-amber-400',
          badge: 'bg-amber-500 text-white',
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          glow: 'shadow-amber-100'
        };
      case 'green':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/80',
          border: 'border-emerald-500',
          badge: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          glow: 'shadow-emerald-100'
        };
      default:
        return {
          bg: 'bg-gray-50 hover:bg-gray-100',
          border: 'border-gray-300',
          badge: 'bg-gray-600 text-white',
          icon: null,
          glow: 'shadow-gray-100'
        };
    }
  };

  // Filter handlers
  const filteredRooms = filterColor === 'all' 
    ? roomsData 
    : roomsData.filter(room => room.color === filterColor);

  // If a room is clicked, render the detailed report view
  if (selectedRoom) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => setSelectedRoom(null)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-semibold transition"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Room Overview
        </button>
        <TypedReportDashboard data={selectedRoom.payload} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
              <Building2 className="w-5 h-5" /> Grand Horizon Hotel
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Live Room Monitoring</h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-red-700">
                {roomsData.filter(r => r.color === 'red').length}
              </span>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical</span>
            </div>
            <div className="bg-orange-100 border border-orange-200 px-4 py-2 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-orange-700">
                {roomsData.filter(r => r.color === 'orange').length}
              </span>
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Urgent</span>
            </div>
            <div className="bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-emerald-700">
                {roomsData.filter(r => r.color === 'green').length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-1 mr-2">
            <Filter className="w-4 h-4" /> Filter:
          </span>
          {['all', 'red', 'orange', 'yellow', 'green'].map((color) => (
            <button
              key={color}
              onClick={() => setFilterColor(color)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                filterColor === color
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {color}
            </button>
          ))}
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => {
            const theme = getCardTheme(room.color);
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`group cursor-pointer rounded-2xl border-l-8 ${theme.border} ${theme.bg} p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border-t border-r border-b border-gray-200/60`}
              >
                <div>
                  {/* Top Row: Room Number & Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Room
                      </span>
                      <h2 className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition">
                        #{room.room_number}
                      </h2>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${theme.badge}`}>
                      {theme.icon}
                      {room.color}
                    </span>
                  </div>

                  {/* Room Summary Content */}
                  <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">
                    "{room.summary}"
                  </p>
                  <p className="text-xs text-gray-500 mb-4">Guest: {room.guest_name}</p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {room.time_ago}
                  </span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Report <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RoomOverviewDashboard;