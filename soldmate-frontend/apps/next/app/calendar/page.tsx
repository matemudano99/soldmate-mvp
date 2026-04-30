"use client";

import React from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EVENTS = [
  { day: "Mon", title: "Reunión equipo", time: "09:00", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { day: "Wed", title: "Entrega informe", time: "12:00", color: "bg-violet-50 border-violet-200 text-violet-700" },
  { day: "Thu", title: "Revisión stock", time: "16:00", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { day: "Fri", title: "Cierre semanal", time: "17:30", color: "bg-green-50 border-green-200 text-green-700" },
];

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Calendario</h1>
        <SectionCard title="Esta semana" subtitle="Mock data · frontend-first">
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => {
              const event = EVENTS.find((e) => e.day === d);
              return (
                <div key={d} className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">{d}</p>
                  <div className={`rounded-xl p-2.5 min-h-[80px] border ${event ? event.color : "bg-gray-50 border-gray-100"}`}>
                    {event && (
                      <>
                        <p className="text-[9px] opacity-70">{event.time}</p>
                        <p className="text-[10px] font-semibold mt-1 leading-tight">{event.title}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
