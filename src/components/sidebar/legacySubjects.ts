
import { 
  Calculator, FlaskConical, Atom, Languages, BookOpen, 
  MapPin, Monitor, Plus, Globe
} from "lucide-react";

export const legacySubjects = [
  { id: 'math', name: '数学', icon: Calculator, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', gradient: 'from-blue-400 to-blue-600' },
  { id: 'chemistry', name: '化学', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', gradient: 'from-purple-400 to-purple-600' },
  { id: 'biology', name: '生物', icon: Atom, color: 'bg-green-100 text-green-700 hover:bg-green-200', gradient: 'from-green-400 to-green-600' },
  { id: 'english', name: '英語', icon: Languages, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', gradient: 'from-indigo-400 to-indigo-600' },
  { id: 'japanese', name: '国語', icon: BookOpen, color: 'bg-red-100 text-red-700 hover:bg-red-200', gradient: 'from-red-400 to-red-600' },
  { id: 'geography', name: '地理', icon: MapPin, color: 'bg-teal-100 text-teal-700 hover:bg-teal-200', gradient: 'from-teal-400 to-teal-600' },
  { id: 'information', name: '情報', icon: Monitor, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', gradient: 'from-gray-400 to-gray-600' },
  { id: 'other', name: '全般', icon: Plus, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradient: 'from-orange-400 to-orange-600' },
  { id: 'physics', name: '物理', icon: Atom, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradient: 'from-orange-400 to-orange-600' },
  { id: 'japanese_history', name: '日本史', icon: BookOpen, color: 'bg-pink-100 text-pink-700 hover:bg-pink-200', gradient: 'from-pink-400 to-pink-600' },
  { id: 'world_history', name: '世界史', icon: BookOpen, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', gradient: 'from-amber-400 to-amber-600' },
  { id: 'earth_science', name: '地学', icon: Globe, color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200', gradient: 'from-cyan-400 to-cyan-600' },
];
