'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  Clock,
  Mail,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const items = [
  {
    title: 'Ραντεβού',
    description: 'Διαχείριση προγραμματισμένων ραντεβού.',
    href: '/admin/appointments',
    icon: <CalendarCheck className="w-5 h-5 text-[#3a3a38]" />,
  },
  {
    title: 'Ασθενείς',
    description: 'Προβολή και επεξεργασία αρχείου ασθενών.',
    href: '/admin/patients',
    icon: <Users className="w-5 h-5 text-[#3a3a38]" />,
  },
  {
    title: 'Πρόγραμμα',
    description: 'Διαχείριση προγράμματος λειτουργίας και εξαιρέσεων.',
    href: '/admin/schedule',
    icon: <Clock className="w-5 h-5 text-[#3a3a38]" />,
  },
  {
    title: 'Μηνύματα',
    description: 'Μηνύματα από τη φόρμα επικοινωνίας.',
    href: '/admin/messages',
    icon: <Mail className="w-5 h-5 text-[#3a3a38]" />,
  },
  {
    title: 'Πρόσβαση',
    description: 'Διαχείριση λογαριασμών διαχειριστών.',
    href: '/admin/accounts',
    icon: <ShieldCheck className="w-5 h-5 text-[#3a3a38]" />,
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafafa] text-[#333]">
        <p className="text-sm text-gray-500">Έλεγχος σύνδεσης...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9f9f7] text-[#3a3a38] font-sans">
      <section className="py-26 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-12 tracking-tight">Πίνακας Διαχείρισης</h1>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group border border-gray-200 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200 hover:scale-[1.01] flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                {item.icon}
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">{item.description}</p>
              <Link href={item.href}>
                <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-[#3a3a38] text-white hover:bg-[#242422] transition font-medium shadow">
                  Μετάβαση
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
