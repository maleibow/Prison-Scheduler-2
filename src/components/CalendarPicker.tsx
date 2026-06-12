import React, { useState } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isBefore, startOfDay, addMonths, subMonths
} from 'date-fns';

interface Props {
  selectedDates: string[];
  onToggleDate: (dateStr: string) => void;
}

export default function CalendarPicker({ selectedDates, onToggleDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full flex-1 flex flex-col font-mono max-w-sm mx-auto sm:max-w-none">
      <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-4 mb-4">
        <button 
          onClick={handlePrevMonth}
          className="text-neutral-500 hover:text-neutral-100 px-2 py-1 uppercase text-xs font-bold transition-colors cursor-pointer"
          type="button"
        >
          &lt; PREV
        </button>
        <h2 className="font-bold text-lg text-neutral-100 uppercase tracking-widest">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={handleNextMonth}
          className="text-neutral-500 hover:text-neutral-100 px-2 py-1 uppercase text-xs font-bold transition-colors cursor-pointer"
          type="button"
        >
          NEXT &gt;
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 gap-1 flex-1">
          {/* Day Headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] text-neutral-600 font-bold uppercase pb-2">
              {day}
            </div>
          ))}

          {/* Calendar Cells */}
          {days.map(day => {
            const dateStr = format(day, dateFormat);
            const isSelected = selectedDates.includes(dateStr);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isPast = isBefore(day, today);

            let borderClass = "border border-neutral-800";
            let bgClass = "bg-transparent";
            let textClass = "text-neutral-100 text-xl";
            let extraContent = null;

            if (!isCurrentMonth || isPast) {
              textClass = "text-neutral-700 opacity-50";
              borderClass = "border border-neutral-900";
            } else if (!isSelected) {
               borderClass = "border border-neutral-300 hover:border-neutral-100";
               bgClass = "hover:bg-neutral-800 cursor-pointer";
            }
            
            if (isSelected) {
              borderClass = "border-4 border-red-600 cursor-pointer";
              bgClass = "bg-red-600";
              textClass = "text-black font-bold text-xl";
              extraContent = <span className="text-[10px] font-bold uppercase mt-1">SELECTED</span>;
            }

            return (
              <button
                key={day.toString()}
                type="button"
                disabled={isPast || !isCurrentMonth}
                onClick={() => isCurrentMonth && !isPast && onToggleDate(dateStr)}
                className={`flex flex-col items-center justify-center p-2 min-h-[64px] transition-all disabled:cursor-not-allowed
                  ${borderClass} ${bgClass}
                `}
              >
                <span className={textClass}>{format(day, 'dd')}</span>
                {extraContent}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
