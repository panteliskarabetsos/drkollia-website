// app/appointments/page.js

'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

const greekLocale = {
  ...el,
  options: {
    ...el.options,
    weekStartsOn: 1,
  },
};

export default function AppointmentPage() {
  // const [selectedDate, setSelectedDate] = useState(null);
  // const [availableTimes, setAvailableTimes] = useState([]);
  // const [selectedTime, setSelectedTime] = useState('');
  // const [formData, setFormData] = useState({
  //   firstName: '',
  //   lastName: '',
  //   phone: '',
  //   email: '',
  //   reason: '',
  // });

  // // Placeholder: load available times based on selected date
  // useEffect(() => {
  //   if (!selectedDate) return;
  //   // Example: 09:00 - 13:00 every 30 min
  //   const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  //   setAvailableTimes(times);
  //   setSelectedTime('');
  // }, [selectedDate]);

  // const handleChange = (e) => {
  //   setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   alert('Υποβλήθηκε το ραντεβού (demo mode).');
  // };

  // return (
  //   <div className="max-w-2xl mx-auto p-6 space-y-6">
  //     <h1 className="text-2xl font-semibold">Κλείσε το ραντεβού σου</h1>

  //     <div>
  //       <label className="block mb-2 font-medium">Επιλογή Ημερομηνίας</label>
  //       <Calendar
  //         mode="single"
  //         locale={greekLocale}
  //         selected={selectedDate}
  //         onSelect={(date) => setSelectedDate(date)}
  //         disabled={{ before: new Date() }}
  //         modifiers={{ weekend: (d) => [0, 6].includes(d.getDay()) }}
  //         modifiersClassNames={{ weekend: 'text-gray-400 opacity-60' }}
  //       />
  //     </div>

  //     {selectedDate && (
  //       <div>
  //         <label className="block mb-2 font-medium">Επιλογή Ώρας</label>
  //         <div className="grid grid-cols-4 gap-2">
  //           {availableTimes.map((time) => (
  //             <button
  //               key={time}
  //               type="button"
  //               onClick={() => setSelectedTime(time)}
  //               className={`border px-3 py-1 rounded text-sm transition-all ${
  //                 selectedTime === time
  //                   ? 'bg-blue-600 text-white'
  //                   : 'hover:bg-blue-100'
  //               }`}
  //             >
  //               {time}
  //             </button>
  //           ))}
  //         </div>
  //       </div>
  //     )}

  //     <form onSubmit={handleSubmit} className="space-y-4">
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //         <input name="firstName" placeholder="Όνομα" className="input" required onChange={handleChange} />
  //         <input name="lastName" placeholder="Επώνυμο" className="input" required onChange={handleChange} />
  //         <input name="phone" placeholder="Τηλέφωνο" className="input" required onChange={handleChange} />
  //         <input name="email" placeholder="Email (προαιρετικά)" className="input" onChange={handleChange} />
  //       </div>
  //       <textarea
  //         name="reason"
  //         placeholder="Λόγος επίσκεψης"
  //         className="input w-full min-h-[100px]"
  //         required
  //         onChange={handleChange}
  //       />
  //       <button
  //         type="submit"
  //         disabled={!selectedDate || !selectedTime}
  //         className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
  //       >
  //         Υποβολή Ραντεβού
  //       </button>
  //     </form>
  //   </div>
  // );
}

// Tailwind helper για input (ή χρησιμοποίησε custom component)
// .input {
//   @apply border px-3 py-2 rounded w-full;
// }