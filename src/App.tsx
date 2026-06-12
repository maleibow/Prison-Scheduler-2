import React, { useState, useEffect } from 'react';
import { UserAvailability } from './types';
import CalendarPicker from './components/CalendarPicker';
import Results from './components/Results';
import { Link, Plus } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [users, setUsers] = useState<UserAvailability[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDates, setNewDates] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time changes
    const availabilitiesRef = collection(db, 'availabilities');
    const unsubscribe = onSnapshot(availabilitiesRef, (snapshot) => {
      const fetched: UserAvailability[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          name: data.name,
          dates: data.dates || [],
          uid: data.uid
        });
      });
      setUsers(fetched);
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, 'availabilities');
    });

    return () => unsubscribe();
  }, []);

  const handleToggleDate = (dateStr: string) => {
    setNewDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleSavePerson = async () => {
    if (!newName.trim() || newDates.length === 0) return;
    const targetUid = editingUid || Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    try {
      const docRef = doc(db, 'availabilities', targetUid);
      const isUpdate = !!editingUid;
      
      const payload: any = {
        name: newName.trim(),
        dates: newDates,
        uid: targetUid,
        updatedAt: serverTimestamp(),
      };
      
      if (!isUpdate) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });
      
      setIsAdding(false);
      setEditingUid(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `availabilities/${targetUid}`);
    }
  };

  const handleRemovePerson = async (uidToRemove: string) => {
    try {
       await deleteDoc(doc(db, 'availabilities', uidToRemove));
    } catch (e) {
       handleFirestoreError(e, OperationType.DELETE, `availabilities/${uidToRemove}`);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 flex justify-center items-start text-neutral-100 font-mono">
      <div className="w-full max-w-5xl border-8 border-neutral-800 p-4 sm:p-8 flex flex-col shadow-2xl relative min-h-[calc(100vh-4rem)]">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end border-b-2 border-neutral-100 pb-4 mb-8">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter leading-none uppercase">PRISON</h1>
            <p className="text-xs tracking-widest text-neutral-500 mt-2 uppercase">Availability Coordinator // CLOUD SYNC</p>
          </div>
          <div className="flex flex-col gap-2 text-left sm:text-right mt-4 sm:mt-0">
            <div>
              <div className="text-xs uppercase text-neutral-500">Status</div>
              <div className="text-xl uppercase">{users.length > 0 ? "SYNC_ACTIVE" : "AWAITING_INPUT"}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <section className="md:col-span-4 flex flex-col space-y-8">
            
            {/* Input Form */}
            {isAdding ? (
               <div className="p-4 border-2 border-neutral-100 bg-neutral-900 flex flex-col space-y-4">
                 <div>
                   <label className="text-xs uppercase font-bold block mb-2">Identify Yourself</label>
                   <input 
                     type="text" 
                     value={newName}
                     onChange={(e) => setNewName(e.target.value)}
                     placeholder="ENTER NAME..."
                     className="w-full bg-transparent border-b border-neutral-700 text-neutral-100 py-2 focus:outline-none focus:border-red-600 uppercase font-mono transition-colors"
                     autoFocus
                   />
                 </div>
                 <div className="flex gap-2 text-xs pt-4">
                   <button 
                     onClick={() => setIsAdding(false)}
                     className="flex-1 border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-500 py-2 uppercase font-bold transition-all cursor-pointer"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSavePerson}
                     disabled={!newName.trim() || newDates.length === 0}
                     className="flex-1 bg-red-600 text-black hover:bg-red-500 disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-500 py-2 uppercase font-bold transition-all cursor-pointer"
                   >
                     Submit
                   </button>
                 </div>
               </div>
            ) : (
                <div 
                   className="p-4 border-2 border-neutral-800 bg-neutral-900/30 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-700 transition-colors" 
                   onClick={() => {
                     setEditingUid(null);
                     setNewName('');
                     setNewDates([]);
                     setIsAdding(true);
                   }}
                >
                   <div className="text-xs uppercase font-bold text-neutral-400 text-center">
                      {"Add Availability"}
                   </div>
                   <button className="bg-red-600 text-black p-2 rounded-full hover:bg-red-500 transition-colors cursor-pointer mt-2">
                     <Plus className="w-5 h-5" />
                   </button>
                </div>
            )}

            {/* Share Banner */}
            {users.length > 0 && !isAdding && (
              <div className="border border-neutral-800 p-4 bg-neutral-900 space-y-3">
                <div className="text-xs text-neutral-500 uppercase font-bold">Data Link</div>
                <div className="text-sm text-neutral-300">Share this URL with the band to sync.</div>
                <button 
                  onClick={copyShareLink}
                  className="w-full flex justify-center items-center gap-2 bg-neutral-100 text-neutral-900 uppercase font-bold text-xs py-2 px-4 hover:bg-neutral-300 transition-colors cursor-pointer"
                >
                  <Link className="w-4 h-4" />
                  {copied ? '[ LINK COPIED ]' : '[ COPY APP URI ]'}
                </button>
              </div>
            )}

            {/* Band Members List */}
            {users.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-neutral-500">Current Roster</h3>
                <ul className="text-sm space-y-2">
                  {users.map(user => (
                    <li key={user.id} className="flex items-center justify-between group">
                      <div 
                        className="flex items-center gap-2 uppercase cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => {
                          setEditingUid(user.uid || user.id);
                          setNewName(user.name);
                          setNewDates(user.dates);
                          setIsAdding(true);
                        }}
                      >
                        <span className="w-2 h-2 bg-neutral-100 inline-block group-hover:bg-red-500 transition-colors"></span>
                        {user.name} <span className="text-neutral-500 text-xs group-hover:text-red-400">({user.dates.length} DAYS)</span>
                      </div>
                      <button 
                        onClick={() => handleRemovePerson(user.uid || user.id)}
                        className="text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer text-xs font-bold font-mono"
                        title="Remove"
                      >
                        [X]
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </section>

          {/* Main Content Area */}
          <section className="md:col-span-8 flex flex-col space-y-8 h-full">
            {isAdding ? (
              <div className="flex-1 border border-neutral-800 p-4 bg-neutral-900/50 flex flex-col">
                <div className="mb-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Select Available Dates</div>
                <div className="flex-1">
                  <CalendarPicker 
                    selectedDates={newDates}
                    onToggleDate={handleToggleDate}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <Results users={users} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
