'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, ArrowLeft,CalendarX } from 'lucide-react';
import Link from 'next/link';
function normalizeGreekText(text) {
  return text
    .normalize('NFD') // αποσυνθέτει τα τονισμένα γράμματα (π.χ. ή → ι + ́)
    .replace(/[\u0300-\u036f]/g, '') // αφαιρεί τους τόνους
    .toLowerCase(); // πεζά
}


export default function NewAppointmentPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatientMode, setNewPatientMode] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    amka: ''
  });
  const [hasFullDayException, setHasFullDayException] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
const [nextAvailableDate, setNextAvailableDate] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    appointment_date: null,
    appointment_time: null,
    duration_minutes: 30,
    customDuration: '',
    reason: '',
    notes: ''
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const filteredPatients = patients.filter((p) => {
    const term = normalizeGreekText(searchTerm);
    const fullName = normalizeGreekText(`${p.first_name} ${p.last_name}`);
    const amka = p.amka || '';
    const phone = p.phone || '';

    return (
      fullName.includes(term) ||
      amka.includes(term) ||
      phone.includes(term)
    );
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allScheduleSlots, setAllScheduleSlots] = useState([]);

  useEffect(() => {
  const fetchAvailableSlots = async () => {
    if (!formData.appointment_date) return;
   setLoadingSlots(true);
    const date = formData.appointment_date;
    const weekday = date.getDay(); // 0=Sunday

    const { data: scheduleData } = await supabase
      .from('clinic_schedule')
      .select('start_time, end_time')
      .eq('weekday', weekday);
   console.log('clinic_schedule:', scheduleData);
  
    if (!scheduleData || scheduleData.length === 0) {
      setAvailableSlots([]);
      setAllScheduleSlots([]);
      setHasFullDayException(false); // reset just in case
      setLoadingSlots(false); 
      return;
    }
  setHasFullDayException(hasFullDayException); // ενημέρωση state

    // Working hours
const workingPeriods = scheduleData.map(s => {
  const [startHour, startMinute, startSecond] = s.start_time.split(':').map(Number);
  const [endHour, endMinute, endSecond] = s.end_time.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMinute, startSecond || 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, endSecond || 0, 0);

  return { start, end };
});

  // Fetch exceptions
  const { data: exceptions } = await supabase
    .from('schedule_exceptions')
    .select('start_time, end_time')
    .eq('exception_date', format(date, 'yyyy-MM-dd'));

  const exceptionRanges = exceptions?.map(e => ({
    start: e.start_time ? new Date(e.start_time) : null,
    end: e.end_time ? new Date(e.end_time) : null
  })) || [];

  // 🆕 Αν έχει εξαίρεση χωρίς start/end ώρα = όλη μέρα κλειστό
const fullDayException = exceptions?.some(e => !e.start_time && !e.end_time);
setHasFullDayException(fullDayException);

    // Appointments (booked)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: booked } = await supabase
      .from('appointments')
      .select('appointment_time, duration_minutes')
      .gte('appointment_time', startOfDay.toISOString())
      .lte('appointment_time', endOfDay.toISOString());

    const bookedSlots = [];
    booked.forEach(({ appointment_time, duration_minutes }) => {
      const start = new Date(appointment_time);
      const slotsCount = Math.ceil(duration_minutes / 15);
      for (let i = 0; i < slotsCount; i++) {
        const slot = new Date(start);
        slot.setMinutes(start.getMinutes() + i * 15);
        bookedSlots.push(slot.toTimeString().slice(0, 5));
      }
    });

    // Υπολογισμός διαθέσιμων + όλων των slots
    const duration = parseInt(
      formData.duration_minutes === 'custom'
        ? formData.customDuration
        : formData.duration_minutes
    );

    const slots = [];
    const allSlots = [];

    workingPeriods.forEach(({ start, end }) => {
      const cursor = new Date(start);
      while (cursor < end) {
        const endSlot = new Date(cursor);
        endSlot.setMinutes(endSlot.getMinutes() + duration);
       if (endSlot.getTime() > end.getTime()) break;

        const timeStr = cursor.toTimeString().slice(0, 5);

        const overlapsBooked = bookedSlots.includes(timeStr);
        const overlapsException = exceptionRanges.some(exc => {
          if (!exc.start || !exc.end) return true;
          return cursor >= new Date(exc.start) && cursor < new Date(exc.end);
        });

        const available = !overlapsBooked && !overlapsException;

        if (available) slots.push(timeStr);

        allSlots.push({
          time: timeStr,
          available
        });

        cursor.setMinutes(cursor.getMinutes() + 15);
      }
    });

    setAvailableSlots(slots);
    setAllScheduleSlots(allSlots);

     setLoadingSlots(false);
  };

  fetchAvailableSlots();
}, [formData.appointment_date, formData.duration_minutes, formData.customDuration]);

useEffect(() => {
  const date = formData.appointment_date;
  const duration = parseInt(
    formData.duration_minutes === 'custom'
      ? formData.customDuration
      : formData.duration_minutes
  );

  if (
    date &&
    availableSlots.length === 0 &&
    !hasFullDayException &&
    allScheduleSlots.length > 0
  ) {
    findNextAvailableDate(date, duration);
  } else {
    setNextAvailableDate(null);
  }
}, [availableSlots, hasFullDayException, formData.appointment_date, formData.duration_minutes, formData.customDuration]);


  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
   .select('id, first_name, last_name, email, amka, phone')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });


      if (!error) setPatients(data);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.appointment_date) return;

      const start = new Date(formData.appointment_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time, duration_minutes')
        .gte('appointment_time', start.toISOString())
        .lte('appointment_time', end.toISOString());

      if (error) return;

      const taken = [];
      data.forEach(({ appointment_time, duration_minutes }) => {
        const startTime = new Date(appointment_time);
        const totalSlots = Math.ceil(duration_minutes / 15);
        for (let i = 0; i < totalSlots; i++) {
          const t = new Date(startTime);
          t.setMinutes(t.getMinutes() + i * 15);
          taken.push(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
        }
      });

      setBookedSlots(taken);
    };

    fetchBookedSlots();
  }, [formData.appointment_date]);

const handleCancel = () => {
  // Καθαρίζει τη φόρμα
  setFormData({
    appointment_date: null,
    appointment_time: null,
    duration_minutes: '30',
    customDuration: '',
    reason: '',
    customReason: '',
    notes: ''
  });
  setNewPatientData({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    amka: ''
  });
  setSelectedPatient(null);
  setNewPatientMode(false);
  
  // Επιστροφή στην προηγούμενη σελίδα
  router.push('/admin/appointments');
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    let patientId = selectedPatient?.id;

    const duration = formData.duration_minutes === 'custom'
      ? parseInt(formData.customDuration)
      : parseInt(formData.duration_minutes);

    if (isNaN(duration) || duration <= 0) {
      alert('Η διάρκεια του ραντεβού δεν είναι έγκυρη.');
      return;
    }

    if (newPatientMode) {
      const trimmedAmka = newPatientData.amka?.trim();
      if (trimmedAmka) {
        const { data: existingAmka } = await supabase
          .from('patients')
          .select('id')
          .eq('amka', trimmedAmka)
          .single();

        if (existingAmka) {
          alert('Υπάρχει ήδη ασθενής με αυτό το ΑΜΚΑ.');
          return;
        }
      }

      const { data, error: patientError } = await supabase
        .from('patients')
        .insert([{
          first_name: newPatientData.first_name.trim(),
          last_name: newPatientData.last_name.trim(),
          phone: newPatientData.phone?.trim() || null,
          email: newPatientData.email?.trim() || null,
          amka: newPatientData.amka?.trim() || null,
          gender: 'other'
        }])
        .select();

      if (patientError || !data || data.length === 0) {
        console.error('❌ Patient insert error:', patientError);
        alert('Σφάλμα κατά την καταχώρηση νέου ασθενή.');
        return;
      }

      patientId = data[0].id;
    }

    if (!patientId || !formData.appointment_date || !formData.appointment_time) {
      alert('Πρέπει να συμπληρωθούν όλα τα απαραίτητα πεδία.');
      return;
    }

    const [hour, minute] = formData.appointment_time.split(':').map(Number);
    const combinedDate = new Date(formData.appointment_date);
    combinedDate.setHours(hour, minute, 0, 0);

    const { error } = await supabase.from('appointments').insert([
      {
        patient_id: patientId,
        appointment_time: combinedDate.toISOString(),
        duration_minutes: duration,
        notes: formData.notes,
        reason: formData.reason === 'Προσαρμογή' ? formData.customReason : formData.reason,
        status: 'approved'
      }
    ]);

    if (error) {
      console.error('Appointment insert error:', error);
      alert('Σφάλμα κατά την καταχώρηση ραντεβού.');
    } else {
      router.push('/admin/appointments');
    }
  } catch (err) {
    console.error('Σφάλμα:', err);
    alert('Προέκυψε σφάλμα.');
  } finally {
    setIsSubmitting(false);
  }
};



const findNextAvailableDate = async (startDate, duration) => {
  for (let i = 1; i <= 30; i++) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + i);

    const weekday = nextDate.getDay();

    const { data: scheduleData } = await supabase
      .from('clinic_schedule')
      .select('start_time, end_time')
      .eq('weekday', weekday);

    if (!scheduleData || scheduleData.length === 0) continue;

    const workingPeriods = scheduleData.map((s) => {
      const [startHour, startMinute] = s.start_time.split(':').map(Number);
      const [endHour, endMinute] = s.end_time.split(':').map(Number);

      const start = new Date(nextDate);
      start.setHours(startHour, startMinute, 0, 0);
      const end = new Date(nextDate);
      end.setHours(endHour, endMinute, 0, 0);

      return { start, end };
    });

    const { data: exceptions } = await supabase
      .from('schedule_exceptions')
      .select('start_time, end_time')
      .eq('exception_date', format(nextDate, 'yyyy-MM-dd'));

    const fullDay = exceptions?.some((e) => !e.start_time && !e.end_time);
    if (fullDay) continue;

    const exceptionRanges = exceptions?.map((e) => ({
      start: e.start_time ? new Date(e.start_time) : null,
      end: e.end_time ? new Date(e.end_time) : null,
    })) || [];

    const startOfDay = new Date(nextDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(nextDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: booked } = await supabase
      .from('appointments')
      .select('appointment_time, duration_minutes')
      .gte('appointment_time', startOfDay.toISOString())
      .lte('appointment_time', endOfDay.toISOString());

    const bookedSlots = [];
    booked.forEach(({ appointment_time, duration_minutes }) => {
      const start = new Date(appointment_time);
      const slotsCount = Math.ceil(duration_minutes / 15);
      for (let i = 0; i < slotsCount; i++) {
        const slot = new Date(start);
        slot.setMinutes(start.getMinutes() + i * 15);
        bookedSlots.push(slot.toTimeString().slice(0, 5));
      }
    });

    for (const { start, end } of workingPeriods) {
      const cursor = new Date(start);
      while (cursor < end) {
        const endSlot = new Date(cursor);
        endSlot.setMinutes(endSlot.getMinutes() + duration);
        if (endSlot > end) break;

        const timeStr = cursor.toTimeString().slice(0, 5);

        const overlapsBooked = bookedSlots.includes(timeStr);
        const overlapsException = exceptionRanges.some((exc) => {
          if (!exc.start || !exc.end) return true;
          return cursor >= new Date(exc.start) && cursor < new Date(exc.end);
        });

        if (!overlapsBooked && !overlapsException) {
          setNextAvailableDate(nextDate);
          return;
        }

        cursor.setMinutes(cursor.getMinutes() + 15);
      }
    }
  }

  setNextAvailableDate(null); // Δεν βρέθηκε διαθέσιμη ημερομηνία
};


  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f9f9f9] px-14 py-12 ">
     <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-3xl shadow-lg border border-[#e4dfd4] transition-shadow hover:shadow-xl">
    <div className="relative mb-8">
      {/* Back Button */}
      <button
        type="button"
         onClick={handleCancel}
        className="absolute left-0 top-1 p-2 rounded-full hover:bg-gray-200 transition"
        aria-label="Επιστροφή"
      >
        <ArrowLeft size={22} className="text-gray-600" />
      </button>

      {/* Τίτλος στο κέντρο */}
      <h2 className="text-center text-3xl font-serif font-semibold text-[#3b3a36] tracking-tight">
        Καταχώρηση Ραντεβού
      </h2>

      {/* Κουμπί κάτω από τον τίτλο */}
      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setNewPatientMode(!newPatientMode)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-black text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          {newPatientMode ? (
            <>
              <Users className="w-4 h-4" />
              Επιλογή Υπάρχοντα Ασθενή
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Νέος Ασθενής
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/appointments/exception')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-black text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <CalendarX className="w-4 h-4" />
          Προσθήκη με Εξαίρεση
        </button>
      </div>

        </div>
        {newPatientMode ? (
          <div className="mb-6 grid grid-cols-1 gap-3">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Όνομα"
              value={newPatientData.first_name}
              onChange={(e) => setNewPatientData({ ...newPatientData, first_name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Επώνυμο"
              value={newPatientData.last_name}
              onChange={(e) => setNewPatientData({ ...newPatientData, last_name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
            <input
              type="text"
              placeholder="Τηλέφωνο"
              value={newPatientData.phone}
              onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={newPatientData.email}
              onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="ΑΜΚΑ"
              value={newPatientData.amka}
              onChange={(e) => setNewPatientData({ ...newPatientData, amka: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        ) : (
          <div className="mb-5">
            <label className="block text-sm mb-1 text-gray-600">Αναζήτηση Ασθενή</label>
            <input
              type="text"
              placeholder="Πληκτρολογήστε ονοματεπώνημο, ΑΜΚΑ ή τηλέφωνο ασθενούς..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPatient(null);
              }}
              className="px-4 py-2 border border-[#d6d3cb] rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b5aa96] transition w-full"
            />
            {searchTerm && !selectedPatient && (
              <ul className="mt-2 border rounded-lg max-h-40 overflow-y-auto text-sm bg-white">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <li
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchTerm(`${patient.first_name} ${patient.last_name}`);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                     {patient.first_name} {patient.last_name} ({patient.email})<br />
                      <span className="text-xs text-gray-500">ΑΜΚΑ: {patient.amka} | Τηλ: {patient.phone}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">Δεν βρέθηκε ασθενής</li>
                )}
              </ul>
            )}
            {selectedPatient && (
              <p className="mt-2 text-sm text-green-600">
                Επιλέχθηκε: <strong>{`${selectedPatient.first_name} ${selectedPatient.last_name}`}</strong>
              </p>
            )}
          </div>
        )}


   {/* Λόγος Επίσκεψης */}
    <div className="mb-5">
      <label className="block text-sm mb-1 text-gray-600">Λόγος Επίσκεψης</label>
      <select
        value={formData.reason}
        onChange={(e) => {
          const value = e.target.value;
          setFormData((prev) => ({
            ...prev,
            reason: value,
            duration_minutes:
              value === 'Αξιολόγηση Αποτελεσμάτων' || value === 'Ιατρικός Επισκέπτης'
                ? '15'
                : value === 'Εξέταση'
                ? '30'
                : 'custom',
            customDuration: value === 'Προσαρμογή' ? prev.customDuration : ''
          }));
        }}
        className="w-full p-2 border border-gray-300 rounded-lg"
      >
        <option value="">-- Επιλέξτε λόγο επίσκεψης --</option>
        <option value="Εξέταση">Εξέταση</option>
        <option value="Αξιολόγηση Αποτελεσμάτων">Αξιολόγηση Αποτελεσμάτων</option>
        <option value="Ιατρικός Επισκέπτης">Ιατρικός Επισκέπτης</option>
        <option value="Προσαρμογή">Προσαρμογή (ελεύθερο κείμενο)</option>
      </select>
    </div>

    {/* Ελεύθερο πεδίο αν επιλέχθηκε Προσαρμογή */}
    {formData.reason === 'Προσαρμογή' && (
      <div className="mb-5">
        <label className="block text-sm mb-1 text-gray-600">Περιγραφή Επίσκεψης</label>
        <input
          type="text"
          value={formData.customReason || ''}
          onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="π.χ. Συνταγογράφηση, Έλεγχος ορμονών κ.λπ."
          required
        />
      </div>
    )}

        {/* Επιλογή Ημερομηνίας */}
        <div className="mb-5">
          <label className="block text-sm mb-1 text-gray-600">Ημερομηνία</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.appointment_date ? format(formData.appointment_date, 'dd/MM/yyyy') : 'Επιλέξτε ημερομηνία'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.appointment_date}
                onSelect={(date) => {
                  setFormData({ ...formData, appointment_date: date, appointment_time: null });
            
                }}
                disabled={{ before: new Date() }}
                showOutsideDays
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

     {/* Διάρκεια Ραντεβού */}
        <div className="mb-5">
          <label className="block text-sm mb-1 text-gray-600">Διάρκεια Ραντεβού</label>
          <select
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData({ ...formData, duration_minutes: e.target.value, customDuration: '' })
            }
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="15">15 λεπτά</option>
            <option value="30">30 λεπτά</option>
            <option value="45">45 λεπτά</option>
            <option value="60">1 ώρα</option>
            <option value="custom">Προσαρμογή</option>
          </select>
        </div>

        {/* Προσαρμοσμένη διάρκεια */}
        {formData.duration_minutes === 'custom' && (
          <div className="mb-5">
            <label className="block text-sm mb-1 text-gray-600">Προσαρμοσμένη Διάρκεια (σε λεπτά)</label>
            <input
              type="number"
              min="5"
              step="5"
              placeholder="π.χ. 20"
              value={formData.customDuration}
              onChange={(e) => setFormData({ ...formData, customDuration: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        )}
        {/* Ώρες Διαθεσιμότητας */}
{/* Ώρες Διαθεσιμότητας */}
{formData.appointment_date && (
  <div className="mb-5">
    <label className="block text-sm mb-1 text-gray-600">Επιλογή Ώρας</label>

    {loadingSlots ? (
      <div className="flex items-center justify-center py-4">
        <svg
          className="animate-spin h-5 w-5 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="ml-2 text-gray-600 text-sm">Φόρτωση διαθέσιμων ωρών...</span>
      </div>
    ) : hasFullDayException ? (
      <p className="text-red-600 text-sm mt-2">
        Το ιατρείο είναι κλειστό για όλη την ημέρα λόγω εξαίρεσης.
      </p>
    ) : allScheduleSlots.length === 0 ? (
      <p className="text-red-600 text-sm mt-2">
        Εκτός ωραρίου Ιατρείου για την επιλεγμένη ημέρα.
      </p>
    ) : availableSlots.length === 0 ? (
      <p className="text-red-600 text-sm mt-2">
        Δεν υπάρχει διαθέσιμο ραντεβού για τη διάρκεια που επιλέξατε.
        {nextAvailableDate ? (
          <> Πρώτο διαθέσιμο: <strong>{format(nextAvailableDate, 'dd/MM/yyyy')}</strong></>
        ) : (
          <> Δοκιμάστε άλλη ημερομηνία.</>
        )}
      </p>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {allScheduleSlots.map(({ time, available }) => {
          const [hour, minute] = time.split(':').map(Number);
          const start = new Date();
          start.setHours(hour, minute, 0, 0);

          const duration = parseInt(
            formData.duration_minutes === 'custom'
              ? formData.customDuration
              : formData.duration_minutes
          );

          const end = new Date(start);
          end.setMinutes(end.getMinutes() + duration);

          const endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

          return (
            <button
              key={time}
              type="button"
              onClick={() => {
                if (available) setFormData({ ...formData, appointment_time: time });
              }}
              disabled={!available}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                formData.appointment_time === time && available
                  ? 'bg-gray-800 text-white'
                  : available
                  ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
              title={available ? '' : 'Κλεισμένο ή μη διαθέσιμο'}
            >
              {time}–{endTimeStr}
            </button>
          );
        })}
      </div>
    )}
  </div>
)}

{/* Σημειώσεις */}
<div className="mb-6">
  <label className="block text-sm mb-1 text-gray-600">Σημειώσεις</label>
  <textarea
    rows="3"
    value={formData.notes}
    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
  />
</div>

  <button
    type="submit"
    disabled={isSubmitting}
    className={`w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded-lg transition ${
      isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700'
    }`}
  >
    {isSubmitting ? (
      <>
        <svg
          className="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Καταχώρηση...
      </>
    ) : (
      'Καταχώρηση Ραντεβού'
    )}
  </button>

      </form>
    </main>
  );
}


function generateAvailableSlots(startHour, endHour, duration, booked) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      const start = new Date();
      start.setHours(h, m, 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      if (end.getHours() > endHour || (end.getHours() === endHour && end.getMinutes() > 0)) continue;

      let overlaps = false;
      for (let t = 0; t < duration; t += 15) {
        const check = new Date(start);
        check.setMinutes(check.getMinutes() + t);
        const hh = String(check.getHours()).padStart(2, '0');
        const mm = String(check.getMinutes()).padStart(2, '0');
        if (booked.includes(`${hh}:${mm}`)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
  }
  return slots;
}

