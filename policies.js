// A standalone educational model. These inputs are not historical employer data.
export const DEMAND = [48,62,35,78,92,55,42,85,105,64,48,80];
export function simulate(policy, {demand=DEMAND, holding=1.4, ordering=36, penalty=12, lot=180, period=3}={}) {
  if (!['FOQ','LFL','POQ'].includes(policy)) throw new Error('Unknown policy');
  if (!demand.length || demand.some(n=>!Number.isFinite(n)||n<0) || [holding,ordering,penalty].some(n=>!Number.isFinite(n)||n<0) || !Number.isFinite(lot)||lot<=0 || !Number.isInteger(period)||period<1) throw new Error('Invalid simulation inputs');
  let stock=0, orderCount=0, held=0, short=0, served=0;
  const rows=demand.map((d,i)=>{
    const beginning=stock; let received=0;
    if (stock<d) {
      if (policy==='LFL') received=d-stock;
      if (policy==='FOQ') received=Math.ceil((d-stock)/lot)*lot;
      if (policy==='POQ') received=Math.max(0,demand.slice(i,i+period).reduce((a,b)=>a+b,0)-stock);
    }
    if(received>0) orderCount++;
    const available=stock+received, shortage=Math.max(0,d-available);
    served+=Math.min(available,d); short+=shortage; stock=Math.max(0,available-d); held+=stock;
    return {week:i+1,demand:d,beginning,received,ending:stock,shortage};
  });
  const costs={holding:held*holding,ordering:orderCount*ordering,shortage:short*penalty};
  return {policy,rows,orderCount,costs,total:Object.values(costs).reduce((a,b)=>a+b,0),fillRate:served/demand.reduce((a,b)=>a+b,0)};
}
