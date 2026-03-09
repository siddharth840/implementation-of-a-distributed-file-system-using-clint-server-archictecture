import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, trend }) => {
    return (
        <div className="bg-[#161b2a] border border-gray-800 p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-gray-700 transition-all cursor-default">
            <div className="flex items-center justify-between w-full">
                <div className="p-3 bg-gray-800/50 rounded-xl text-accent">
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
                <p className="text-gray-500 text-xs mt-2">{subtitle}</p>
            </div>
        </div>
    );
};

export default StatsCard;
