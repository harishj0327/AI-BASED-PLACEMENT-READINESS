import React, { useState, useEffect } from 'react';
import { User, School, BookOpen, Save, Check, Mail, Award, Calendar } from 'lucide-react';
import { AuthUser } from '../lib/firebase';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface ProfilePageProps {
  currentUser: AuthUser;
  onProfileUpdated: (name: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState(currentUser.name);
  const [college, setCollege] = useState('National Institute of Technology');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [batch, setBatch] = useState('2022-2026');
  const [cgpa, setCgpa] = useState<number>(8.2);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        if (data) {
          setProfile(data);
          setName(data.name || currentUser.name);
          setCollege(data.college || 'National Institute of Technology');
          setBranch(data.branch || 'Computer Science and Engineering');
          setBatch(data.batch || '2022-2026');
          if (data.cgpa) setCgpa(data.cgpa);
        }
      } catch (err) {
        console.error('Could not load profile:', err);
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name,
        college,
        branch,
        batch,
        cgpa,
      });
      onProfileUpdated(name);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Student Academic Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Authenticated Firebase Profile &amp; Campus Placement Credentials
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email (UID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Academic info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  College / Institute
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Branch
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Graduation Batch
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="2022-2026"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Cumulative CGPA
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Synced with Cloud Firestore document /users/{currentUser.uid}
            </span>

            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
