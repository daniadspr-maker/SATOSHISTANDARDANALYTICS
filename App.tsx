import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, ReferenceLine } from 'recharts';

// --- DATASET INSTITUCIONAL ---
const HALVING_PROJ = [{ year: '2024', price: 65000 }, { year: '2025', price: 95000 }, { year: '2026', price: 140000 }, { year: '2027', price: 185000 }, { year: '2028', price: 290000 }];
const RISK_DATA = [{ subject: 'Sharpe', A: 85 }, { subject: 'Sortino', A: 75 }, { subject: 'Volatility', A: 60 }, { subject: 'Skewness', A: 40 }];
const CYCLE_PROGRESS = { phase: 'MARKUP', progress: 68 };

const CATEGORIES = [
  { key: 'fiat', label: 'CASH & LIQUIDITY' },
  { key: 'gold', label: 'PHYSICAL GOLD RESERVES' },
  { key: 'equities', label: 'GLOBAL EQUITIES & VC' },
  { key: 'realEstate', label: 'PRIME REAL ESTATE' },
  { key: 'horology', label: 'HIGH-END HOROLOGY' },
  { key: 'tech', label: 'ENTERPRISE TECH' }
];

export default function App() {
  const IS_TESTING = false; 

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('portfolioAssets');
    return saved ? JSON.parse(saved) : { fiat: 0, gold: 0, equities: 0, realEstate: 0, horology: 0, tech: 0 };
  });

  const [isPremium, setIsPremium] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [btcPrice, setBtcPrice] = useState(58664105);
  const [debugClicks, setDebugClicks] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('portfolioAssets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { if (IS_TESTING && debugClicks === 3) setIsPremium(true); }, [debugClicks, IS_TESTING]);
  
  useEffect(() => {
    async function fetchLiveCoinbasePrice() {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        const data = await response.json();
        setBtcPrice(Number(data.data.amount));
      } catch (error) {}
    }
    fetchLiveCoinbasePrice();
  }, []);

  const totalValue = Object.values(assets).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
  const totalBtc = btcPrice > 0 ? (totalValue / btcPrice) : 0;
  const satoshiConversion = totalBtc * 100000000;
  const btcFormatted = totalBtc.toFixed(8);
  
  // Cálculo de dominancia: (BTC poseídos / 21,000,000) * 100
  const supplyPercentage = ((totalBtc / 21000000) * 100).toFixed(8);

  const updateAsset = (key: string, value: string) => {
    const cleanValue = value.replace(/,/g, '');
    setAssets(prev => ({ ...prev, [key]: Number(cleanValue) }));
  };

  const getDisplayValue = (key: string) => {
    if (focusedInput === key) return assets[key as keyof typeof assets] || '';
    const val = assets[key as keyof typeof assets];
    return val ? val.toLocaleString('en-US') : '';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto border border-zinc-800 bg-black shadow-2xl">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-zinc-800 p-6 bg-black" onClick={() => setDebugClicks(c => c + 1)}>
          <h1 className="text-[11px] font-bold tracking-[0.2em] text-amber-500 uppercase cursor-pointer opacity-80 hover:opacity-100 transition-opacity">SATOSHI STANDARD ANALYTICS</h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase text-zinc-500">Feed:</span>
                <span className="text-[10px] font-bold text-white bg-zinc-900 px-2 py-0.5 border border-zinc-800">COINBASE</span>
             </div>
             <span className="text-[10px] font-bold text-amber-500 tracking-wider">BTC: {btcPrice.toLocaleString()} USD</span>
          </div>
        </div>

        {/* INPUTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-800">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.key} className={`p-6 ${i % 2 === 0 ? 'md:border-r' : ''} border-b border-zinc-800`}>
              <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-2 tracking-[0.2em]">{cat.label}</label>
              <div className="flex items-center border border-zinc-700 bg-[#0f0f0f]">
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={getDisplayValue(cat.key)}
                  onFocus={() => setFocusedInput(cat.key)}
                  onBlur={() => setFocusedInput(null)}
                  onChange={(e) => updateAsset(cat.key, e.target.value)} 
                  className="w-full bg-transparent p-3 text-sm text-white focus:outline-none" 
                  placeholder="0"
                />
                <span className="text-[10px] font-bold text-zinc-600 px-3 uppercase">USD</span>
              </div>
            </div>
          ))}
        </div>

        {/* VALUE BOX */}
        <div className="p-8 border-b border-zinc-800 bg-[#050505]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
               <div className="h-[40px] flex items-center"><span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">PORTFOLIO VALUATION (SAT/BTC)</span></div>
               <div className="flex items-center gap-4 h-[40px]"><span className="w-[50px] text-sm font-bold text-zinc-500 uppercase tracking-widest">SATS</span><span className="text-3xl font-black text-amber-500 font-mono tabular-nums tracking-tight">{Math.floor(satoshiConversion).toLocaleString()}</span></div>
               <div className="flex items-center gap-4 h-[40px]"><span className="w-[50px] text-sm font-bold text-zinc-500 uppercase tracking-widest">BTC</span><span className="text-3xl font-black text-white font-mono tabular-nums tracking-tight">{btcFormatted}</span></div>
            </div>
            <div className="md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8 flex flex-col gap-6">
               <div className="h-[40px] flex items-center"><span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] whitespace-nowrap">GLOBAL SUPPLY DOMINANCE</span></div>
               <div className="flex items-center h-[40px]"><span className="text-3xl font-black text-white font-mono tabular-nums tracking-tight">{supplyPercentage}%</span></div>
               <div className="h-[40px] flex items-center"><span className="text-sm font-black uppercase text-zinc-600 tracking-[0.1em]">TOTAL SUPPLY: 21,000,000 BTC</span></div>
            </div>
          </div>
        </div>

        {/* PREMIUM BOX */}
        <div className="p-16 bg-[#080808] border-t border-zinc-800">
          {!isPremium ? (
             <div className="text-center max-w-lg mx-auto py-12">
                <div className="inline-block border border-amber-500 px-6 py-2 text-[10px] font-black uppercase mb-8 text-amber-500 tracking-[0.3em]">RESSENCE INSTITUTIONAL ACCESS</div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase">Unlock the Full Suite</h3>
                <p className="text-zinc-400 text-sm mb-12 leading-relaxed">Access advanced institutional assets auditing, halving simulation engine, and precision market correlation metrics.</p>
                <div className="flex flex-col gap-4">
                  <input className="w-full bg-black border border-zinc-700 p-4 text-sm text-white" placeholder="Enter license key..." value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)}/>
                  <button onClick={() => {if(licenseKey === "PH-2026-LIVE") setIsPremium(true); else alert("Invalid License")}} className="w-full bg-amber-500 text-black font-black py-4 uppercase text-[12px] tracking-widest hover:bg-amber-400 transition-all">Verify License // $49</button>
                </div>
             </div>
          ) : (
             <div className="animate-in fade-in duration-1000">
               <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                 <h2 className="text-amber-500 font-black uppercase tracking-[0.2em] text-[12px]">⚡ RESSENCE INSTITUTIONAL SUITE // FULL ACCESS</h2>
                 <span className="text-[9px] font-bold text-zinc-600">LAST UPDATE: 16:17 UTC</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#030303] p-4">
                  <div className="border border-zinc-800 p-6 bg-black">
                      <div className="flex justify-between mb-4"><h3 className="text-[10px] font-black text-amber-500">HALVING PRICE PROJECTION</h3><span className="text-[9px] text-zinc-600 font-mono">USD/BTC</span></div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={HALVING_PROJ}>
                          <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                          <XAxis dataKey="year" stroke="#444" tick={{fontSize:9}} axisLine={false} />
                          <Tooltip contentStyle={{backgroundColor: 'black', borderColor: '#333'}} />
                          <Line type="monotone" dataKey="price" stroke="#d97706" strokeWidth={3} dot={{fill: '#d97706', r: 5}} />
                        </LineChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="border border-zinc-800 p-6 bg-black">
                      <div className="flex justify-between mb-4"><h3 className="text-[10px] font-black text-white">ASSET RISK AUDITOR</h3><span className="text-[9px] text-zinc-600 font-mono">INSTITUTIONAL METRICS</span></div>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={RISK_DATA}>
                          <PolarGrid stroke="#222" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 9}} />
                          <Radar name="Risk" dataKey="A" stroke="#d97706" fill="#d97706" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="border border-zinc-800 p-6 bg-black flex flex-col justify-center">
                    <h3 className="text-[10px] font-black text-amber-500 mb-6 tracking-[0.1em]">BITCOIN CYCLE PHASE</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono"><span>ACCUM</span><span>MARKUP</span><span>DIST</span><span>MARKDOWN</span></div>
                        <div className="h-6 bg-zinc-900 border border-zinc-800 relative">
                           <div className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{width: `${CYCLE_PROGRESS.progress}%`}}></div>
                        </div>
                        <div className="text-center text-[10px] font-bold tracking-widest text-white mt-4 uppercase">Phase: {CYCLE_PROGRESS.phase} // {CYCLE_PROGRESS.progress}% OF CYCLE</div>
                    </div>
                  </div>
                  <div className="border border-zinc-800 p-6 bg-black">
                    <h3 className="text-[10px] font-black text-white mb-6 tracking-[0.1em]">CORRELATION & BETA MATRIX</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                          { l: 'BTC/GOLD', v: '0.78', b: '1.2' }, 
                          { l: 'BTC/SPX', v: '0.42', b: '0.9' }, 
                          { l: 'BTC/YIELD', v: '-0.12', b: '-0.3' }
                        ].map(item => (
                          <div key={item.l} className="bg-[#0f0f0f] p-3 text-center border border-zinc-800">
                             <div className="text-[7px] text-zinc-500 uppercase mb-1 font-bold">{item.l}</div>
                             <div className="text-amber-500 text-sm font-black font-mono">{item.v}</div>
                             <div className="text-[8px] text-zinc-700 font-mono">BETA: {item.b}</div>
                          </div>
                        ))}
                    </div>
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
