import React, { useState } from 'react';
import { Hotel, Utensils, ExternalLink, Calendar, MapPin, Receipt, X, CheckCircle2 } from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { money } from '@/lib/utils.js';

export function BookStaysModal({ isOpen, onClose, city, trip }) {
  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' | 'dining'
  const [logOpen, setLogOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingCost, setBookingCost] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const addExpense = useWorldStore((s) => s.addExpense);

  if (!isOpen || !city) return null;

  const cityName = city.name || 'Destination';
  const checkIn = trip?.start_date || '2026-11-01';
  const checkOut = trip?.end_date || '2026-11-05';

  // Smart Deep Links with pre-filled destination query
  const hotelLinks = [
    {
      name: 'Booking.com',
      desc: 'Top hotels, luxury resorts & boutique villas with free cancellation.',
      url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}`,
      badge: 'Most Popular',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      name: 'Google Hotels',
      desc: 'Compare rates across Agoda, Expedia, MakeMyTrip & direct hotel websites.',
      url: `https://www.google.com/travel/hotels/${encodeURIComponent(cityName)}`,
      badge: 'Best Rate Compare',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      name: 'Airbnb Stays',
      desc: 'Unique local apartments, heritage Havelis, and private villas for groups.',
      url: `https://www.airbnb.com/s/${encodeURIComponent(cityName)}/homes`,
      badge: 'Crew & Group Friendly',
      color: 'from-rose-600 to-pink-700',
    },
  ];

  const diningLinks = [
    {
      name: 'Zomato & Dining Reservations',
      desc: 'Top culinary tables, local delicacies, menus, and verified diner reviews.',
      url: `https://www.google.com/search?q=${encodeURIComponent('zomato best restaurants in ' + cityName)}`,
      badge: 'Local Flavors',
      color: 'from-red-600 to-rose-700',
    },
    {
      name: 'Google Maps Top Eats',
      desc: 'Interactive map of street food stalls, cafes, and rooftop bistros near your stops.',
      url: `https://www.google.com/maps/search/top+rated+restaurants+in+${encodeURIComponent(cityName)}`,
      badge: 'Live Map & Ratings',
      color: 'from-amber-600 to-orange-700',
    },
    {
      name: 'Tripadvisor Gourmet Guide',
      desc: 'Curated Travelers’ Choice recommendations & fine dining reservations.',
      url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(cityName + ' restaurants')}`,
      badge: 'Traveler Choice',
      color: 'from-teal-600 to-emerald-700',
    },
  ];

  const handleSaveVoucher = (e) => {
    e.preventDefault();
    if (!bookingName || !bookingCost) return;

    if (addExpense && trip?.id) {
      addExpense({
        id: `e_${Date.now()}`,
        trip_id: trip.id,
        category: activeTab === 'hotels' ? 'stay' : 'meals',
        amount: Number(bookingCost) || 0,
        date: checkIn,
        paid_by: 'u_demo',
        notes: `${cityName}: ${bookingName}`,
      });
    }

    setBookedSuccess(true);
    setTimeout(() => {
      setBookedSuccess(false);
      setLogOpen(false);
      setBookingName('');
      setBookingCost('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border/60 bg-ink/95 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-gradient-to-r from-saffron/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-saffron/20 p-2.5 text-saffron">
                {activeTab === 'hotels' ? <Hotel className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
                  {activeTab === 'hotels' ? 'Book Stays & Hotels' : 'Reserve Dining & Eats'}
                  <span className="text-sm font-normal text-saffron">in {cityName}</span>
                </h3>
                <p className="text-xs text-muted">
                  Pre-filtered booking partners & instant group expense tracking
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'hotels'
                  ? 'bg-saffron text-slate-950 shadow-md font-bold'
                  : 'bg-white/5 text-muted hover:text-parchment hover:bg-white/10'
              }`}
            >
              <Hotel className="h-3.5 w-3.5" />
              Hotels & Stays
            </button>
            <button
              onClick={() => setActiveTab('dining')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dining'
                  ? 'bg-saffron text-slate-950 shadow-md font-bold'
                  : 'bg-white/5 text-muted hover:text-parchment hover:bg-white/10'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              Restaurants & Cafes
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Destination info pill */}
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-border/30 p-3 text-xs">
            <div className="flex items-center gap-2 text-muted">
              <MapPin className="h-3.5 w-3.5 text-aurora" />
              <span>Target Stop: <strong className="text-parchment">{cityName}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted font-mono">
              <Calendar className="h-3.5 w-3.5 text-saffron" />
              <span>{checkIn} → {checkOut}</span>
            </div>
          </div>

          {/* Partner Links */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
              1-Click Direct Booking Engines
            </p>
            {(activeTab === 'hotels' ? hotelLinks : diningLinks).map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border/40 bg-white/[0.02] p-4 hover:border-saffron/40 hover:bg-white/[0.05] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-parchment group-hover:text-saffron transition-colors">
                      {link.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] text-muted">
                      {link.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted max-w-sm">{link.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-parchment group-hover:bg-saffron group-hover:text-slate-950 transition-colors">
                  <span>Open</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            ))}
          </div>

          {/* Quick Expense Logger */}
          <div className="pt-3 border-t border-border/40">
            {!logOpen ? (
              <button
                onClick={() => setLogOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/60 bg-white/[0.02] text-xs font-semibold text-saffron hover:bg-saffron/10 transition-colors"
              >
                <Receipt className="h-4 w-4" />
                Already have a reservation? Record Voucher & Split with Crew
              </button>
            ) : (
              <form onSubmit={handleSaveVoucher} className="rounded-xl border border-saffron/30 bg-saffron/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-parchment flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-saffron" />
                    Record {activeTab === 'hotels' ? 'Hotel Voucher' : 'Dining Bill'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setLogOpen(false)}
                    className="text-[10px] text-muted hover:text-parchment"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted uppercase font-mono">Hotel / Restaurant Name</label>
                    <input
                      type="text"
                      required
                      placeholder={activeTab === 'hotels' ? 'e.g., ITC Rajputana' : 'e.g., Chokhi Dhani Dinner'}
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-border/50 bg-ink px-3 py-1.5 text-xs text-parchment outline-none focus:border-saffron"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-mono">Total Paid Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 4500"
                      value={bookingCost}
                      onChange={(e) => setBookingCost(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-border/50 bg-ink px-3 py-1.5 text-xs text-parchment outline-none focus:border-saffron"
                    />
                  </div>
                </div>

                {bookedSuccess ? (
                  <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Voucher Saved & Added to Shared Expenses!
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-saffron text-slate-950 text-xs font-bold hover:bg-saffron/90 transition-colors"
                  >
                    Save & Split Cost with Crew
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 bg-white/[0.02] flex items-center justify-between text-xs text-muted">
          <span>Yatraverse Smart Booking Assistant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 text-parchment hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
