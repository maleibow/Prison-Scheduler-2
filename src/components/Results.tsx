import React from 'react';
import { UserAvailability } from '../types';
import { format, parseISO } from 'date-fns';

interface Props {
  users: UserAvailability[];
}

export default function Results({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="h-full border border-dashed border-neutral-800 p-8 flex items-center justify-center text-neutral-600 uppercase font-bold text-sm tracking-widest">
        SYSTEM AWAITING DATA INPUT
      </div>
    );
  }

  // Aggregate dates
  const dateCounts: Record<string, string[]> = {}; 

  users.forEach(user => {
    user.dates.forEach(date => {
      if (!dateCounts[date]) {
        dateCounts[date] = [];
      }
      dateCounts[date].push(user.name);
    });
  });

  const results = Object.entries(dateCounts)
    .map(([date, people]) => ({
      date,
      people,
      count: people.length
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.date.localeCompare(b.date);
    });

  if (results.length === 0) {
     return (
      <div className="h-full border border-neutral-800 p-8 flex items-center justify-center text-neutral-500 uppercase font-bold text-sm bg-neutral-900/50">
        NO OVERLAPPING DATES DETECTED
      </div>
    );
  }

  const everyoneCount = users.length;
  const bestResults = results.filter(r => r.count === everyoneCount && everyoneCount > 1);

  return (
    <div className="flex flex-col h-full space-y-6">
      {bestResults.length > 0 && (
         <div className="p-4 bg-red-600 text-black mb-6">
           <div className="text-xs font-bold uppercase mb-1">Golden Opportunity</div>
           <div className="text-lg leading-tight font-bold uppercase">
              {bestResults.length === 1 
                ? `EVERYONE IS FREE ON ${format(parseISO(bestResults[0].date), 'MMM d').toUpperCase()}` 
                : `EVERYONE IS FREE ON ${bestResults.map(r => format(parseISO(r.date), 'MMM d').toUpperCase()).join(', ')}`}
           </div>
         </div>
      )}

      <div>
        <h3 className="text-xs uppercase font-bold text-neutral-500 mb-4 tracking-widest border-b border-neutral-800 pb-2">Analysis Results</h3>
        <div className="space-y-2">
          {results.map(({ date, people, count }) => {
            const isEveryone = count === everyoneCount && everyoneCount > 1;
            const parsedDate = parseISO(date);
            const formattedDate = format(parsedDate, 'EEE, MMM dd');

            return (
              <div 
                key={date} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border ${
                  isEveryone 
                    ? 'border-red-600 bg-red-950/20' 
                    : 'border-neutral-800 bg-neutral-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xl font-bold uppercase ${isEveryone ? 'text-red-500' : 'text-neutral-300'}`}>
                      {formattedDate}
                    </span>
                    {isEveryone && (
                      <span className="text-[10px] font-bold uppercase bg-red-600 text-black px-2 py-0.5">
                        ALL CLEAR
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
                    {people.join(' // ')}
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                  <div className="text-sm font-bold text-neutral-400">
                    <span className={isEveryone ? 'text-red-500' : 'text-neutral-100'}>{count}</span> / {everyoneCount} <span className="text-[10px]">AVAILABLE</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
