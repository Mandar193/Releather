import { motion } from "motion/react";
import { DollarSign, Tag, Leaf, ExternalLink } from "lucide-react";
import { LeatherItem } from "../types";
import { formatDistanceToNow } from "date-fns";

interface Props {
  item: LeatherItem;
  onSelect: (item: LeatherItem) => void;
}

export default function ItemCard({ item, onSelect }: Props) {
  const isRecycling = item.status === 'recycling';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#5A5A40]/10 hover:shadow-2xl hover:shadow-[#5A5A40]/10 transition-all cursor-pointer"
      onClick={() => onSelect(item)}
    >
      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isRecycling ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 backdrop-blur-sm border border-green-200">
               <Leaf className="w-3 h-3" />
               Recycling Loop
            </span>
          ) : (
            <span className="px-3 py-1 bg-[#5A5A40] text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-white/20">
               {item.category}
            </span>
          )}
          <span className="px-3 py-1 bg-white/90 text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-gray-100">
             {item.aiAnalysis?.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-serif font-bold italic text-[#1a1a1a] mb-1 group-hover:text-[#5A5A40] transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 capitalize flex items-center gap-1 underline underline-offset-2">
            Listed {item.createdAt ? formatDistanceToNow(new Date(item.createdAt as any)) : 'recently'} ago
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[#1a1a1a]">
          {!isRecycling ? (
            <div className="flex items-center text-xl font-serif font-bold italic">
              <DollarSign className="w-5 h-5 text-[#5A5A40]" />
              <span>{item.listedPrice}</span>
            </div>
          ) : (
            <div className="text-xs font-bold uppercase tracking-tighter text-green-700">
               Sustainable Action
            </div>
          )}
          
          <button className="p-2 bg-[#f5f5f0] rounded-full group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
