import React, { useEffect, useState } from 'react';
import { Building2, ArrowRight, Sparkles, Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';

// Sub-component for individual room cards with live metric calculations and 3s polling
const RoomCard = ({ room, clientName, onClick }) => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMetrics = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await feedbackAPI.getFeedbacksByDate(room.unique_id, today, clientName);
        const list = res.feedbacks || [];

        if (isMounted) {
          const total = list.length;
          const resolved = list.filter((item) => item.is_resolved === true).length;
          const pending = total - resolved;
          setStats({ total, resolved, pending });
        }
      } catch (err) {
        if (isMounted) {
          setStats({ total: 0, resolved: 0, pending: 0 });
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    // Initial fetch
    fetchMetrics();

    // 3-second polling interval for real-time card metrics
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [room.unique_id, clientName]);

  return (
    <div
      onClick={() => onClick(room)}
      className="
        group
        cursor-pointer
        bg-white/90
        backdrop-blur-sm
        rounded-3xl
        border
        border-[#E6D5B8]/80
        p-6
        shadow-[0_4px_20px_-4px_rgba(197,160,89,0.1)]
        hover:shadow-[0_10px_30px_-4px_rgba(197,160,89,0.25)]
        hover:border-[#C5A059]
        transition-all
        duration-300
        flex
        flex-col
        justify-between
        relative
        overflow-hidden
      "
    >
      {/* Decorative subtle gold highlight bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div>
        {/* Room Header & Status Badges Placed Below Name */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-[#A89F91] uppercase tracking-widest block mb-1">
            Room / Area
          </span>
          {/* Room name color changed back to dark luxury tone (#2C2A29) */}
          <h2 className="text-xl font-black text-[#2C2A29] group-hover:text-[#C5A059] transition-colors duration-200 mb-3">
            {room.room_number}
          </h2>

          {/* Metric Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              {stats.resolved} Resolved
            </span>
            {/* Pending cases badge text color changed to red */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs ${
              stats.pending > 0 
                ? 'bg-red-50 border border-red-200 text-red-600' 
                : 'bg-gray-50 border border-gray-200 text-gray-500'
            }`}>
              <AlertCircle className="w-3 h-3 text-red-500" />
              {stats.pending} Pending
            </span>
          </div>
        </div>

        {/* QR Name */}
        <div className="mb-6 bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#F0E6D8]">
          <span className="text-[10px] font-bold text-[#A89F91] uppercase tracking-wider block mb-0.5">
            QR Identifier
          </span>
          <p className="text-sm font-bold text-[#4A453F] truncate">
            {room.name}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8C7A6B]">
          QR #{room.sequence_number} ({stats.total} total)
        </span>

        <span className="
          text-xs
          font-bold
          text-[#C5A059]
          flex
          items-center
          gap-1.5
          group-hover:translate-x-1.5
          transition-transform
          duration-200
        ">
          View Report
          <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
        </span>
      </div>
    </div>
  );
};

const RoomOverviewDashboard = () => {
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('client');

  const navigate = useNavigate();

  // Format client name for display (e.g., "grand_horizon_hotel" -> "Grand Horizon Hotel")
  const formatClientName = (name: string | null) => {
    if (!name) return 'Grand Horizon Hotel';
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const displayName = formatClientName(clientName);

  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        setLoading(true);
        const response = await feedbackAPI.fetchQRCodeDetails(clientName);
        setRoomsData(response.feedbacks || []);
      } catch (error) {
        console.error("Error fetching QR code data:", error);
        setError("Unable to load QR code details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomsData();
  }, [clientName]);

  const handleCardClick = (qrCode) => {
    navigate(`/hotel-feedback/?id=${qrCode.unique_id}${clientName ? `&client=${clientName}` : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C5A059] border-t-transparent mb-4"></div>
          <p className="text-[#8C7A6B] font-medium tracking-wide">
            Loading luxury suites & areas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md border border-[#E6D5B8] rounded-2xl p-8 text-center max-w-md shadow-xl">
          <p className="text-[#A35C48] font-semibold tracking-wide">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F9F6EE] to-[#F4EFE6] p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#E6D5B8]/60 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#C5A059] font-bold text-xs uppercase tracking-widest mb-2">
              <Crown className="w-4 h-4 text-[#C5A059]" />
              {displayName}
            </div>

            {/* Custom Styled Title with Elegant Font and Gradient Color */}
            <h1 className="text-3xl lg:text-4xl font-serif font-bold bg-gradient-to-r from-[#2C2A29] via-[#7D756D] to-[#C5A059] bg-clip-text text-transparent tracking-wide">
              Guest Experience Dashboard
            </h1>

            <p className="text-sm text-[#7D756D] mt-1.5 font-medium">
              Select a location to review real-time guest sentiment and feedback
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#E6D5B8] px-4 py-2.5 rounded-2xl shadow-sm text-xs font-semibold text-[#8C7A6B]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Active Terminals: {roomsData.length}</span>
            </div>
          </div>
        </div>

        {/* No QR codes */}
        {roomsData.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#E6D5B8] p-12 text-center shadow-sm">
            <p className="text-[#8C7A6B] font-medium">
              No QR codes found for this client.
            </p>
          </div>
        ) : (

          /* QR Code Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roomsData.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                clientName={clientName}
                onClick={handleCardClick}
              />
            ))}
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

export default RoomOverviewDashboard;